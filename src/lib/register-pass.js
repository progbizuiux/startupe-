import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * The registration pass PDF, laid out like the event ticket the design was
 * taken from: an information block on the left, a diagonally-cut photograph
 * through the middle, and a panel on the right whose "Name" and "Registration
 * ID" rules are filled in with the holder's details.
 *
 * Server only: pdf-lib has no business in a client bundle, and this reads from
 * the filesystem. Never import it into a client component.
 *
 * Built from StandardFonts (Helvetica) rather than an embedded face. That keeps
 * the file small and adds no font asset to the repo, but it means the document
 * can only encode WinAnsi — which is why `sanitise` below is not optional and
 * why the schema restricts a name to Latin letters. pdf-lib THROWS on an
 * unencodable glyph, and it would throw at exactly the moment someone is
 * waiting for their pass.
 */

/* The site's own palette, from src/styles/tokens.css. */
const PAPER = rgb(1, 1, 1);
const BRAND = rgb(0.125, 0.49, 0.929); // --brand-500 #207ded
const INK = rgb(0.067, 0.067, 0.067); // --ink-950 #111111
const MUTED = rgb(0.443, 0.443, 0.478); // --ink-500 #71717a
const RULE = rgb(0.83, 0.83, 0.85);

/* The reference ticket's own proportions: 582 x 181pt, a shade over 3:1. */
const W = 582;
const H = 181;

/* The photo is a parallelogram leaning to the right, like the reference's. */
const SLANT = 58;
const PHOTO_L_BOTTOM = 150;
const PHOTO_R_BOTTOM = 316;
const PANEL_X = PHOTO_R_BOTTOM + SLANT + 14; // clear of the photo's top corner

const ASSETS = path.join(process.cwd(), "public", "images");
const LOGO_RATIO = 640 / 209;
const PHOTO_RATIO = 640 / 500;

export function sanitise(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[^ -~ -ÿ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Shrink until it fits, so a long name never runs past its rule. */
function fitSize(text, font, max, startSize, minSize) {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > max) size -= 0.5;
  return size;
}

/** "25 September 2026" — spelled out, so it cannot be read as either D/M or M/D. */
const longDate = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);

/**
 * Render the pass. Returns the PDF as a Uint8Array.
 *
 * @param {{ registrationId: string, fullName: string, district: string,
 *           pathway: string, issuedAt?: Date }} registration
 */
export async function buildRegistrationPass(registration) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([W, H]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const body = await doc.embedFont(StandardFonts.Helvetica);

  const id = sanitise(registration.registrationId);
  doc.setTitle(`Startup E+ registration pass ${id}`);
  doc.setCreator("Startup E+");
  doc.setProducer("Startup E+");

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });

  /* ---------- The diagonal photo band ----------
     pdf-lib has no clipping, so the picture is drawn as a full rectangle and
     the two wedges outside the parallelogram are painted back in white. That is
     also why the ticket is drawn on white rather than on a tint: the mask has
     to be the same colour as whatever it covers. */
  const photo = await doc.embedJpg(await fs.readFile(path.join(ASSETS, "pass-photo.jpg")));
  const bandLeft = PHOTO_L_BOTTOM;
  const bandRight = PHOTO_R_BOTTOM + SLANT;
  const drawW = bandRight - bandLeft;
  /* cover: scale to the band's height and let the width overflow into the mask */
  const drawH = H;
  const coverW = Math.max(drawW, drawH * PHOTO_RATIO);
  page.drawImage(photo, {
    x: bandLeft - (coverW - drawW) / 2,
    y: 0,
    width: coverW,
    height: drawH,
  });

  const wedge = (topX, bottomX, toLeft) =>
    page.drawSvgPath(
      toLeft
        ? `M ${topX} 0 L ${bottomX} ${H} L 0 ${H} L 0 0 Z`
        : `M ${topX} 0 L ${bottomX} ${H} L ${W} ${H} L ${W} 0 Z`,
      { x: 0, y: H, color: PAPER },
    );
  wedge(PHOTO_L_BOTTOM + SLANT, PHOTO_L_BOTTOM, true);
  wedge(PHOTO_R_BOTTOM + SLANT, PHOTO_R_BOTTOM, false);

  /* ---------- Left: who issued it, and what for ---------- */
  const left = 22;
  const logo = await doc.embedPng(await fs.readFile(path.join(ASSETS, "pass-logo.png")));
  const logoW = 104;
  page.drawImage(logo, {
    x: left,
    y: H - 20 - logoW / LOGO_RATIO,
    width: logoW,
    height: logoW / LOGO_RATIO,
  });

  page.drawText("MP Office, Vadakara", { x: left, y: H - 62, size: 7, font: body, color: MUTED });

  page.drawText(sanitise(registration.pathway), {
    x: left,
    y: H - 92,
    size: 17,
    font: bold,
    color: INK,
  });
  page.drawText("Your registration pathway", {
    x: left,
    y: H - 104,
    size: 6.5,
    font: body,
    color: MUTED,
  });

  page.drawText("District", { x: left, y: 44, size: 7, font: body, color: MUTED });
  const district = sanitise(registration.district);
  page.drawText(district, {
    x: left,
    y: 22,
    size: fitSize(district, bold, PHOTO_L_BOTTOM - left - 14, 16, 9),
    font: bold,
    color: INK,
  });

  /* ---------- Right: the panel that gets filled in ---------- */
  const panelW = W - PANEL_X - 22;
  const mid = PANEL_X + panelW / 2;

  const heading = "Startup E+";
  page.drawText(heading, {
    x: mid - bold.widthOfTextAtSize(heading, 15) / 2,
    y: H - 38,
    size: 15,
    font: bold,
    color: INK,
  });

  /* Label, then the value sitting on its rule — the reference's blank lines,
     filled. The rule stays so a printed pass still reads as a ticket. */
  const field = (label, value, y, valueColor) => {
    const labelW = body.widthOfTextAtSize(label, 9);
    page.drawText(label, { x: PANEL_X, y, size: 9, font: body, color: INK });
    const vx = PANEL_X + labelW + 5;
    const vw = W - 22 - vx;
    page.drawText(value, {
      x: vx,
      y: y + 2,
      size: fitSize(value, bold, vw, 10, 6),
      font: bold,
      color: valueColor,
    });
    page.drawLine({
      start: { x: vx, y: y - 3 },
      end: { x: W - 22, y: y - 3 },
      thickness: 0.75,
      color: RULE,
    });
  };

  field("Name:", sanitise(registration.fullName), H - 74, INK);
  field("ID:", id, H - 104, BRAND);

  const note = "Quote this ID at the Startup E+ office";
  page.drawText(note, {
    x: mid - body.widthOfTextAtSize(note, 6.5) / 2,
    y: 40,
    size: 6.5,
    font: body,
    color: MUTED,
  });
  const issued = `Issued ${longDate(registration.issuedAt ?? new Date())}`;
  page.drawText(issued, {
    x: mid - body.widthOfTextAtSize(issued, 6.5) / 2,
    y: 27,
    size: 6.5,
    font: body,
    color: MUTED,
  });
  const caveat = "Not proof of enrolment or selection";
  page.drawText(caveat, {
    x: mid - body.widthOfTextAtSize(caveat, 6) / 2,
    y: 15,
    size: 6,
    font: body,
    color: MUTED,
  });

  return doc.save();
}
