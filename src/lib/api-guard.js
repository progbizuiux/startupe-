import { createHash, timingSafeEqual } from "node:crypto";
import { siteConfig } from "@/config/site";

/**
 * Shared front door for the public POST routes.
 *
 * `/api/contact` and `/api/register` both had their own copy of the origin
 * check and the throttle. Two copies of an access rule is how the two drift
 * apart, and a rule that is only right in one of them is not a rule - so they
 * live here now and both routes call the same code.
 *
 * Server only: this reads the app key from the environment.
 */

/* Enough for a long message and the rest of the fields several times over;
   anything larger is not a person filling in a form. */
export const MAX_BODY_BYTES = 16 * 1024;

/**
 * Per-IP throttle, held in module memory.
 *
 * A speed bump, not a guarantee: it is per server instance, so it resets on
 * redeploy and does not coordinate across instances, and the key comes from a
 * header a client can set unless a proxy rewrites it.
 *
 * 30 in ten minutes, not 5. At an event sign-up desk every phone on the same
 * mobile network shares one apparent address, so a queue of real people arrives
 * as one IP - a low limit turns that into "Too many requests" for the sixth
 * person, who has done nothing wrong and cannot tell what went wrong. 30 still
 * stops a script, and a crowd gets through.
 */
const RATE_LIMIT = { max: 30, windowMs: 10 * 60 * 1000 };

const hits = new Map();

/** First hop in X-Forwarded-For is the client; junk falls into one shared bucket. */
function clientIp(request) {
  const first = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const looksLikeIp = /^[0-9.]+$/.test(first) || /^[0-9a-f:]+$/i.test(first);
  return looksLikeIp && first ? first : "unknown";
}

function throttled(request, now = Date.now()) {
  const ip = clientIp(request);
  const fresh = (hits.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT.windowMs);
  fresh.push(now);
  hits.set(ip, fresh);

  /* the map only ever grows otherwise: drop everyone whose window has passed */
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((at) => now - at >= RATE_LIMIT.windowMs)) hits.delete(key);
    }
  }
  return fresh.length > RATE_LIMIT.max;
}

/**
 * Compare two secrets without leaking their contents through timing.
 *
 * Hashed first so both sides are the same length: timingSafeEqual throws on a
 * length mismatch, and catching that throw would itself reveal the length.
 */
function secretsMatch(a, b) {
  const digest = (v) => createHash("sha256").update(String(v)).digest();
  return timingSafeEqual(digest(a), digest(b));
}

/**
 * Decide whether a POST may proceed. Returns a Response to send back, or null
 * to carry on.
 *
 * Two kinds of caller, two rules:
 *
 *  - A BROWSER sends `Origin` on any fetch POST. It must match this site. That
 *    is what stops another website posting as one of our visitors, and it is
 *    all the site's own forms ever needed.
 *
 *  - ANYTHING ELSE - the mobile app, curl, a server-to-server caller - sends no
 *    Origin, and must present APP_API_KEY in `X-App-Key`.
 *
 * FAIL CLOSED on a missing APP_API_KEY: if the variable is not set, no-Origin
 * requests are refused rather than waved through. Allowing them would mean a
 * forgotten environment variable silently restores exactly the open endpoint
 * this exists to close, and nothing would look wrong until someone noticed the
 * CRM filling with junk.
 *
 * Worth being honest about what this is: a secret shipped inside an app binary
 * can be extracted from it. This raises the bar well above "anyone with the
 * URL" - it is not real authentication, and it is not a substitute for one if
 * these endpoints ever carry anything that matters.
 */
/**
 * Origin / app-key check only. The throttle is deliberately NOT folded in here:
 * the contact route checks its honeypot first, so that a bot gets the same
 * cheerful 201 a real submission gets rather than a 429 telling it there is a
 * limit worth pacing around. Each route keeps that ordering decision.
 */
export function rejectRequest(request) {
  const origin = request.headers.get("origin");

  if (origin) {
    let sameSite = false;
    try {
      sameSite = new URL(origin).origin === new URL(siteConfig.url).origin;
    } catch {
      sameSite = false;
    }
    if (!sameSite) {
      return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
    }
  } else {
    const expected = process.env.APP_API_KEY;
    if (!expected) {
      console.error(
        "[api] APP_API_KEY is not set - refusing a request with no Origin. " +
          "Set it, or the mobile app and any server-to-server caller will get 401.",
      );
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const presented = request.headers.get("x-app-key");
    if (!presented || !secretsMatch(presented, expected)) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  return null;
}

/**
 * Per-IP throttle. Returns a 429 Response, or null to carry on.
 *
 * Called by each route at the point it chooses - see the note on
 * `rejectRequest` about why this is separate.
 */
export function rejectIfThrottled(request, message = "Too many submissions from here.") {
  if (!throttled(request)) return null;
  return Response.json({ ok: false, error: `${message} Please try again later.` }, { status: 429 });
}

/**
 * Read the body with a real size cap.
 *
 * The Content-Length header is a hint, not a cap: a chunked POST sends none,
 * and `Number(null) > MAX` is false. Measure what was actually read.
 *
 * Returns `{ payload }` or `{ response }` to send back.
 */
export async function readJsonBody(request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return {
        response: Response.json({ ok: false, error: "Request too large" }, { status: 413 }),
      };
    }
    return { payload: JSON.parse(raw) };
  } catch {
    return {
      response: Response.json({ ok: false, error: "Malformed request body" }, { status: 400 }),
    };
  }
}
