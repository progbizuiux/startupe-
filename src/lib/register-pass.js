import fs from "node:fs/promises";
import path from "node:path";
import {
  PDFDocument,
  TextRenderingMode,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setLineWidth,
  setStrokingColor,
  setTextRenderingMode,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

/**
 * The registration pass PDF.
 *
 * The design is not drawn here — it is the supplied ticket artwork, loaded
 * whole and written onto. `PDFDocument.load` keeps every page object exactly as
 * Photoshop exported it (six images, the blue field boxes, the printed
 * headings), and all this module does is draw three strings into the boxes
 * already printed on it. Nothing else about the document is touched.
 *
 * Server only: pdf-lib has no business in a client bundle, and this reads from
 * the filesystem. Never import it into a client component.
 */

const TEMPLATE = path.join(process.cwd(), "public", "images", "registration-pass-template.pdf");

/**
 * The face the values are set in.
 *
 * NOT the artwork's own BomstadDisplay-Medium, and not for want of trying: the
 * template embeds a SUBSET of it containing exactly nineteen glyphs — space and
 * `D I N P R a e g h i m n o r s t w y`, which is precisely the letters needed
 * to print "Name", "ID" and "Registration Pathway" and nothing more. Every
 * other character, including all ten digits, has no outline in the file. A
 * registration ID set in it would come out blank.
 *
 * Geist was picked by measuring rather than by eye. Across those nineteen
 * glyphs — the only ones where the artwork's own widths can be read — its
 * advances sit a mean 44 units (per 1000em) from Bomstad's, against 66 for
 * Helvetica and 58 for Helvetica-Bold, and its x-height-to-cap ratio (0.746) is
 * nearer Bomstad's 0.768 than either. It is also SIL OFL 1.1, so it ships with
 * the repo legitimately; the licence sits beside it.
 *
 * Copied out of `next/dist/compiled/@vercel/og` rather than read from there at
 * run time: that is a private path inside another package, free to move on any
 * Next upgrade and not guaranteed to be traced into a serverless bundle.
 */
const FONT = path.join(process.cwd(), "public", "fonts", "geist-regular.ttf");

const INK = rgb(0.07, 0.07, 0.07);

/**
 * Stroke width as a fraction of the type size, used to carry Geist Regular up
 * to the artwork's Medium. 0.0115 is 0.15pt at the 13pt the fields are set in —
 * picked by rendering 0, 0.1, 0.15, 0.2 and 0.3pt against the printed headings:
 * below it the values still read light, and by 0.3 they read bold.
 */
const STROKE_RATIO = 0.0115;

/**
 * The artwork's three white boxes, in PDF points on its 595.2 x 280.56 page.
 *
 * These are measured, not estimated. The boxes are not vector rectangles — they
 * are baked into the ticket's raster artwork — so they were found by rendering
 * the template at 6x and scanning for the white runs. All three are identical
 * and evenly spaced: 171.67 wide, 26.83 tall, centred at y 159.14, 106.31 and
 * 51.14.
 *
 * Only the CENTRE of each box is stored, and the baseline is worked out at draw
 * time. Hardcoding the baselines is what put the last set out: they were eyed
 * in one at a time and drifted — 0.5pt low in the Name box, 1.7pt in the ID,
 * 4.5pt in the Registration Pathway, which is a sixth of the box height and
 * plainly visible as a gap above the text. Deriving it also keeps a name that
 * fitSize has shrunk to 7pt centred, where a fixed baseline would leave it
 * sitting low.
 */
const BOX = { left: 382.17, right: 553.83, padding: 12 };

const FIELDS = {
  name: { centreY: 159.14, size: 13 },
  id: { centreY: 106.31, size: 13 },
  pathway: { centreY: 51.14, size: 13 },
};

/**
 * Geist's cap height, 710 units against an em of 1000, read from the OS/2 table
 * of the file in public/fonts.
 *
 * Text is centred on the cap band rather than on the full ascender-to-descender
 * height, which is what the eye reads as centred: with the full height, a value
 * without descenders — "Business", "SEP-J99Y5-MD1SC", most names — would leave
 * a reserved gap underneath and sit visibly high.
 */
const CAP_RATIO = 0.71;

/**
 * How wide a value may be: the box less equal padding on both sides.
 *
 * The old figure was 154 against a box inset 11.83 on the left, which left only
 * 5.83 on the right — the text was allowed to run twice as close to one edge as
 * the other.
 */
const TEXT_WIDTH = BOX.right - BOX.left - BOX.padding * 2;

/**
 * Both files, read once per process instead of once per registration.
 *
 * The template alone is 1.8MB and neither file changes between requests. A
 * failed read is deliberately NOT cached — otherwise one transient error would
 * leave every later registration failing against a rejected promise.
 */
let assets = null;
function loadAssets() {
  if (!assets) {
    assets = Promise.all([fs.readFile(TEMPLATE), fs.readFile(FONT)]);
    assets.catch(() => {
      assets = null;
    });
  }
  return assets;
}

/**
 * Map a string into something the embedded font can set.
 *
 * The kept range stops at U+00FF, and that number is Geist's, not an arbitrary
 * one: of the 400 code points between U+00C0 and U+024F the font has outlines
 * for only 200, and the gaps are scattered — U+0114, U+012C, U+0138, U+014E,
 * U+017F, and everything past U+017F bar a dozen. A character it lacks does not
 * throw the way a standard font does: fontkit maps it to glyph 0 and the pass
 * prints a .notdef box in the middle of someone's name. Latin-1 Supplement it
 * covers without a hole, so the range is cut to there, and registerStartSchema
 * rejects anything past it with a message the person sees before they submit.
 *
 * Control characters go regardless: drawText splits on newlines and draws each
 * one downward, so a value carrying a newline would print over the box below.
 */
export function sanitise(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[^ -~ -ÿ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Capital first letter of each word, lower case for the rest.
 *
 * People type their name on a phone — some with no capitals at all, some with
 * caps lock on — and the pass should read the same either way, so the case is
 * set here rather than trusted from the field: "anu k nair" and "ANU K NAIR"
 * both print as "Anu K Nair".
 *
 * A word starts after a space, a hyphen, an apostrophe, a full stop or a
 * comma — every separator LATIN_NAME lets through — so
 * "mary-jane o'brien" becomes "Mary-Jane O'Brien".
 *
 * The cost of lowering, and it is a real one: a name whose capital belongs
 * mid-word loses it — "McDonald" prints as "Mcdonald", "DeSouza" as "Desouza".
 * There is no way to tell those from caps-lock without a list of name prefixes
 * that would get Malayalam and Arabic-origin names wrong more often than it got
 * Scottish ones right. Anyone affected can be corrected by hand at the office.
 */
export function capitaliseWords(value) {
  return value
    .toLowerCase()
    .replace(/(^|[\s\-'.,])(\p{L})/gu, (_, boundary, letter) => boundary + letter.toUpperCase());
}

/**
 * Make a string fit its box: shrink it, and cut it if shrinking is not enough.
 *
 * Shrinking ALONE is not enough, and quietly assuming it is was a real bug
 * here. The type can only drop to 7pt before it stops being readable, and a
 * name long enough to still overflow at 7pt used to be drawn anyway — nothing
 * clips it, because the artwork's own clipping paths are pushed and popped
 * inside its own content stream, so text appended afterwards is bounded by
 * nothing but the page edge. A 45-character name ran out of its white box and
 * across the blue artwork; at the 120 characters the schema permits it ran off
 * the page. Now the string is trimmed a character at a time until it and an
 * ellipsis fit, so the worst case is a visibly shortened name rather than one
 * painted over the design.
 *
 * The budget is the box less the stroke: TextRenderingMode.FillAndOutline lays
 * the line width across the outline, half of it outside, so the painted glyphs
 * are wider than widthOfTextAtSize reports.
 */
function fit(text, font, maxWidth, startSize, minSize = 7) {
  const budget = maxWidth - startSize * STROKE_RATIO;
  const wide = (s, size) => font.widthOfTextAtSize(s, size) > budget;

  let size = startSize;
  while (size > minSize && wide(text, size)) size -= 0.5;
  if (!wide(text, size)) return { text, size };

  let cut = text;
  while (cut.length > 1 && wide(`${cut}…`, size)) cut = cut.slice(0, -1).trimEnd();
  return { text: `${cut}…`, size };
}

/**
 * Render the pass: the supplied artwork with the three fields filled in.
 *
 * @param {{ registrationId: string, fullName: string, pathway: string }} registration
 * @returns {Promise<Uint8Array>}
 */
export async function buildRegistrationPass(registration) {
  const [templateBytes, fontBytes] = await loadAssets();

  const doc = await PDFDocument.load(templateBytes);
  const page = doc.getPages()[0];

  /* `subset: true` embeds only the glyphs actually drawn — a dozen or so
     characters rather than the whole 126KB face, on every pass issued. */
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: true });

  const id = sanitise(registration.registrationId);
  doc.setTitle(`Startup E+ registration pass ${id}`);

  /* `value` is already sanitised by the caller. It used to be sanitised again
     in here, which could eat a character capitaliseWords had just raised: a
     lowercase letter whose uppercase form falls outside the kept range would be
     raised and then stripped, so "ȿara" printed as "ara" — a name short of its
     first letter, with no error anywhere. */
  const write = (field, text) => {
    if (!text) return;
    const { text: fitted, size } = fit(text, font, TEXT_WIDTH, field.size);

    /* Baseline from the box, not from a constant: sit the cap band's middle on
       the box's middle, whatever size fit() settled on. */
    const baseline = field.centreY - (size * CAP_RATIO) / 2;

    /* Geist ships here as Regular (weight 400) and the artwork's headings are
       BomstadDisplay-Medium (500), so filled text set plainly reads lighter
       than the "Name" printed above it. Stroking the glyphs as well as filling
       them, in the same ink, thickens every stem by the line width and closes
       that gap — one text object, so the pass still copy-pastes as one clean
       string, unlike drawing the same string twice at an offset.

       Proportional to the size rather than a fixed 0.15pt: fitSize drops a long
       name to as little as 7pt, and a fixed stroke there would come out half
       again as heavy as the same name at 13pt. */
    page.pushOperators(
      pushGraphicsState(),
      setTextRenderingMode(TextRenderingMode.FillAndOutline),
      setLineWidth(size * STROKE_RATIO),
      setStrokingColor(INK),
    );
    page.drawText(fitted, { x: BOX.left + BOX.padding, y: baseline, size, font, color: INK });
    page.pushOperators(popGraphicsState());
  };

  /* The ID is minted uppercase and the pathway comes from our own data, so only
     the name — the one value a person types — needs raising. */
  write(FIELDS.name, capitaliseWords(sanitise(registration.fullName)));
  write(FIELDS.id, id);
  write(FIELDS.pathway, sanitise(registration.pathway));

  return doc.save();
}
