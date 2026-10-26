# Startup E+ — client → route contract (for the mobile app)

> ## ⚠ Out of date — the Grand Launch is over
>
> `POST /api/register/start` **has been removed**, along with the `/register`
> page it served. That form existed for the Grand Launch registration; the event
> has ended.
>
> Still live and unchanged:
>
> - `POST /api/register` — the two detailed portals (`portal: "aspirant"` or
>   `"beginner"`), reached from `/register/aspirant` and `/register/beginner`
> - `POST /api/contact`
> - `GET /api/health`
>
> **For the app:** there is no longer a quick-registration endpoint and no
> registration ID. If the app was built around `/api/register/start`, it needs
> to point at `/api/register` with a `portal` instead — that route returns
> `{"ok": true}` and no ID. Ask before building against this.
>
> Everything below describing `/api/register/start` — its request body, its
> `registrationId` response, the Grand Launch `Event` tag on the CRM lead — no
> longer applies. The rest of the document is still accurate.

---

Answers to the Flutter app's six questions. Field names and behaviour below are
read from the route handlers and schemas, not from memory.

Three things in the original questions are built on assumptions that do not
hold. Read these first, because they change the integration:

1. **Do not send `formName`.** It is set server-side and a client cannot
   influence it. See §4.
2. **`/api/register/start` and `/api/register` are not a sequence.** They are
   two unrelated forms. The app does not call one then the other. See §3.
3. **Only `/api/register/start` returns an ID,** and the app must never
   generate its own. See §2.

---

## 1. Request bodies

The guessed shape — `{name, phone, email, place, track}` — matches none of the
routes. Every key below is the real one. All three routes take
`Content-Type: application/json`, flat JSON, no nesting except
`/api/register`'s `founders` array.

Unknown keys are silently stripped by the validator, so a stray field will not
error — it will just be ignored.

### POST `/api/register/start`

The short front-door form. This is almost certainly the one the app wants.

```json
{
  "fullName": "Nithya Raj",
  "age": "22",
  "occupation": "student",
  "email": "nithya@example.com",
  "phone": "98765 43210",
  "altPhone": "",
  "address": "12/4 Mango Lane, Vadakara",
  "district": "Kozhikode",
  "website": ""
}
```

| Key          | Type             | Required | Notes                                                                                                                                  |
| ------------ | ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `fullName`   | string           | yes      | 2–120 after whitespace collapsing. Any alphabet, Malayalam included.                                                                   |
| `age`        | string or number | yes      | integer 14–99                                                                                                                          |
| `occupation` | string           | yes      | exactly `student`, `entrepreneur` or `business`                                                                                        |
| `email`      | string           | yes      | valid email                                                                                                                            |
| `phone`      | string           | yes      | 10-digit Indian mobile, starts 6–9. Spaces, dashes and brackets are stripped server-side, and `+91` / `91` / `0` prefixes are allowed. |
| `altPhone`   | string           | no       | same rule, or `""`                                                                                                                     |
| `address`    | string           | yes      | 6–240 after whitespace collapsing                                                                                                      |
| `district`   | string           | yes      | one of the 14 Kerala districts, exact spelling                                                                                         |
| `website`    | string           | no       | **honeypot — always send `""` or omit**                                                                                                |

> `website` is a bot trap. If it arrives with any value the submission is
> silently discarded and the route still answers `201` with
> `registrationId: null`. An app that fills it will appear to work and file
> nothing.

Districts: Alappuzha, Ernakulam, Idukki, Kannur, Kasaragod, Kollam, Kottayam,
Kozhikode, Malappuram, Palakkad, Pathanamthitta, Thiruvananthapuram, Thrissur,
Wayanad.

### POST `/api/register` — the two detailed portals

One route, two schemas. **`portal` selects which**, and it is required.

Aspirant:

```json
{
  "portal": "aspirant",
  "fullName": "Nithya Raj",
  "age": 22,
  "gender": "Female",
  "district": "Kozhikode",
  "whatsapp": "9876543210",
  "email": "nithya@example.com",
  "academicStatus": "College student",
  "institution": "Govt. College Vadakara",
  "pitchSummary": "A short written pitch, 150 words or fewer.",
  "pitchVideoUrl": "",
  "sector": "Agriculture / Food Processing",
  "primaryNeed": "Idea Validation",
  "ipAcknowledged": true
}
```

Rules no single field expresses:

- `institution` is **required** when `academicStatus` is `School student` or
  `College student`.
- **At least one** of `pitchSummary` (≤150 words) or `pitchVideoUrl` (a full
  URL with scheme) must be present. The error comes back on `pitchSummary`.
- `ipAcknowledged` must be literally `true`. The portal takes IP, so the NDA
  acknowledgement is a hard gate — the app needs a real checkbox, not a
  hardcoded `true`.
- `whatsapp` here is **stricter than `/start`'s `phone`**: it accepts a `+91`
  or `0` prefix but _not_ spaces between digit groups. Send `9876543210`, not
  `98765 43210`.

Beginner:

```json
{
  "portal": "beginner",
  "founders": [
    {
      "name": "Arun P",
      "email": "arun@example.com",
      "phone": "9876543210",
      "background": "Ten years in food processing."
    }
  ],
  "legalName": "Example Foods Pvt Ltd",
  "registrationType": "Private Limited (Pvt Ltd)",
  "udyamNumber": "UDYAM-KL-00-0000000",
  "incorporationDate": "2024-06-01",
  "currentStage": "MVP Ready",
  "fundingHistory": ["Bootstrapped"],
  "operationalHurdle": "Customer Acquisition",
  "ipAcknowledged": true
}
```

- `founders` — 1 to 5. Each needs `name`, `email`, `phone`, and `background`
  (10–600 chars). The first is treated as the primary founder and becomes the
  CRM contact.
- `udyamNumber` — optional; `UDYAM-XX-00-0000000` when present.
- `incorporationDate` — any parseable date string, not in the future, not
  before 1900.
- `fundingHistory` — array, at least one entry (`"Bootstrapped"` counts).

Enum values — these are matched exactly, so the app should render them from a
list rather than let anyone type:

- **gender** — Female, Male, Other, Prefer not to say
- **academicStatus** — School student, College student, Recent graduate,
  Working professional, Not currently studying
- **sector** — Agriculture / Food Processing, Deep Tech / Software, Retail /
  Ecommerce, Healthcare, Creative / Media, Traditional Crafts
- **primaryNeed** — Idea Validation, Co-founder Matching, Prototyping Funds,
  Basic Guidance
- **registrationType** — Private Limited (Pvt Ltd), Limited Liability
  Partnership (LLP), Partnership, Sole Proprietorship
- **currentStage** — Ideation / POC, MVP Ready, Beta Testing, Early Revenue
- **fundingHistory** — Bootstrapped, Friends & Family, Grants, External Angel
- **operationalHurdle** — Product Iteration, Customer Acquisition, Regulatory /
  FSSAI / GST Clearance, Initial Working Capital

### POST `/api/contact`

```json
{
  "fullName": "Nithya Raj",
  "email": "nithya@example.com",
  "phone": "9876543210",
  "topic": "Partnership or collaboration",
  "organisation": "",
  "preferredReply": "Email",
  "message": "At least twenty characters, up to twelve hundred.",
  "website": ""
}
```

- `phone` is **required** when `preferredReply` is `Phone call` or `WhatsApp`,
  optional otherwise.
- `preferredReply` — `Email`, `Phone call`, or `WhatsApp`.
- `topic` — Help with registering, Partnership or collaboration, Mentoring,
  E-Clubs and campus sessions, Investor or funding enquiry, Media and press,
  Something else.
- `message` — 20–1200 characters.
- `website` — honeypot, same as above.

---

## 2. Response shapes

### `/api/register/start`

```json
{
  "ok": true,
  "registrationId": "SEP-FP4HW-CB88M",
  "pathway": "The Aspirant",
  "next": "/register/aspirant"
}
```

`201`, `application/json`, `Cache-Control: no-store`.

**This is the only route that returns an ID.** The format is
`SEP-XXXXX-XXXXY` — Crockford base32, where the final character is a
position-weighted check character, so a mistyped or transposed ID can be
rejected without a database lookup.

> **The app must not generate its own ID.** The note says it will "otherwise
> generate its own" — please don't. This ID is the only link between the person
> and their CRM record; nothing is stored on our side, so an app-generated ID
> matches nothing and the office cannot look the person up. If the call fails,
> show the failure and let them retry. A retry mints a fresh ID.
>
> Relatedly: there is no longer a PDF pass. That was removed. The registration
> ID _is_ the pass — display it as the thing to quote at the office.

### `/api/register` and `/api/contact`

```json
{ "ok": true }
```

`201`. No ID, no document — these file a lead and nothing else.

### Failures — all routes

One shape, one message per field:

```json
{ "ok": false, "errors": { "phone": "Enter a valid 10-digit number" } }
```

| Status | Meaning                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------ |
| `400`  | body was not valid JSON, or `portal` is unknown (`/api/register`)                                |
| `403`  | origin rejected — see §5                                                                         |
| `413`  | body too large (8 KB on `/start`, 16 KB on `/contact`)                                           |
| `422`  | validation; `errors` is keyed by field name                                                      |
| `429`  | rate limited — see §6                                                                            |
| `500`  | server misconfigured (CRM credentials missing)                                                   |
| `502`  | the CRM rejected or timed out. **The lead was not filed.** Show an error and let the user retry. |

The `errors` keys match the request keys exactly, so the app can map them
straight onto its form fields.

---

## 3. Flow — they are not sequential

There is no `start` → `register` handshake. `start` sets nothing up and returns
no token.

- **`/api/register/start`** is the short public registration — eight fields,
  about a minute. It mints the registration ID and files a lead.
- **`/api/register`** is the long detailed application, in one of two portals.
  It is a separate form someone fills in later, and it files its own lead.

On the website the success screen points the person from the first to the
second, which is probably what suggested a sequence. The app can post to either
independently. If the app only replaces the quick registration, it needs
`/api/register/start` alone.

---

## 4. `formName` — do not send it

The app cannot set this, and should not try. In `buildLead`, `formName` is
assigned from a server-side table **after** the submission data is spread in,
so a client-supplied value is overwritten; and the validator strips unknown keys
before that anyway. Sending it is harmless but has no effect.

The four strings are correct as listed, and the server sends exactly those:

| Route                                     | `formName` sent to the CRM  |
| ----------------------------------------- | --------------------------- |
| `/api/register/start`                     | `Startup E+ - Registration` |
| `/api/register` with `portal: "aspirant"` | `Startup E+ - The Aspirant` |
| `/api/register` with `portal: "beginner"` | `Startup E+ - The Beginner` |
| `/api/contact`                            | `Startup E+ - Contact`      |

So the thing that steers CRM routing from the app is **`portal`** on
`/api/register`. Get that right and the executive assignment follows.

`branchID`, `ToAddress` and `leadSourceName` are likewise server-side only.

---

## 5. Auth — a shared secret is now required

**This changed. The app must send a header it did not need before.**

```
X-App-Key: <the secret>
```

The rule, for `POST /api/register` and `POST /api/contact`:

| Caller                                 | Sends `Origin`? | Requirement                           |
| -------------------------------------- | --------------- | ------------------------------------- |
| The website's own forms                | yes, this site  | nothing — authorised by Origin        |
| Another website                        | yes, elsewhere  | `403 Bad origin`                      |
| The mobile app, curl, server-to-server | no              | **must send `X-App-Key`**, else `401` |

So the app sends the header on every POST; the website is unaffected and sends
nothing.

**The secret is not in this document, and will not be sent by email.** It is
generated by the office and handed to you directly. On the server it lives in
`APP_API_KEY`.

Two things worth being straight about:

- **It fails closed.** If `APP_API_KEY` is not set on the server, requests with
  no Origin are refused outright rather than waved through — a forgotten
  environment variable cannot silently reopen the endpoint. If the app gets a
  blanket `401` after deploy, that is the first thing to check.
- **It is not real authentication.** A secret shipped inside an app binary can
  be extracted from it. This raises the bar a long way above "anyone with the
  URL", and it is the right step for these endpoints today, but it should not be
  mistaken for per-user auth.

Verified behaviour, both routes:

```
no Origin, no key        401
no Origin, wrong key     401
no Origin, correct key   proceeds
Origin: the site         proceeds   (no key needed)
Origin: anywhere else    403
```

---

## 6. Everything else the app must send

- **No CSRF token.** None is issued or checked.
- **No captcha.** The only bot defence is the `website` honeypot field, which
  the app must leave empty.
- **Headers:** `Content-Type: application/json` and nothing else. Do not send
  `Origin`.
- **Rate limits**, per IP, in server memory — they reset on redeploy and are
  per instance, so treat them as a speed bump rather than a guarantee:

  | Route           | Limit         | Body cap |
  | --------------- | ------------- | -------- |
  | `/api/contact`  | 30 per 10 min | 16 KB    |
  | `/api/register` | 30 per 10 min | 16 KB    |

  Raised from 5, and added to `/api/register` which previously had no limit,
  no body cap and no honeypot at all.

  Worth flagging: several users behind one mobile network NAT can share an
  apparent IP, so a shared-IP crowd at an event could hit the `/start` limit of
  4-per-10-minutes and see `429` without having done anything wrong. If the app
  is for event sign-ups, raise that limit before launch.

- **Timeouts:** `/api/register/start` can take up to 30s, because it waits on
  the CRM (which has its own 10s timeout) before answering. Set the client
  timeout above that or a successful registration will look like a failure.

---

## A corrected test request

The original example targets the wrong route with the wrong keys. This is the
equivalent that works:

```bash
curl -i -X POST https://startupeplus.com/api/register/start \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Person",
    "age": "22",
    "occupation": "student",
    "email": "t@example.com",
    "phone": "9000000000",
    "altPhone": "",
    "address": "Test Road, Vadakara",
    "district": "Kozhikode",
    "website": ""
  }'
```

Expected: `201` and
`{"ok":true,"registrationId":"SEP-…","pathway":"The Aspirant","next":"/register/aspirant"}`.

**This files a real lead in the CRM and emails the address you put in.** Use a
real mailbox you control, and tell the office which ID was a test so they can
remove it.
