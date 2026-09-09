import { Inter, JetBrains_Mono } from "next/font/google";
// import localFont from "next/font/local";

/**
 * Headings : Inter        (Google font, self-hosted by next/font)
 * Body     : Satoshi      (loaded from Fontshare via <link> in app/layout.jsx)
 * Code     : JetBrains Mono
 *
 * The CSS variables here feed src/styles/tokens.css (--ff-heading / --ff-mono).
 *
 * To self-host Satoshi instead (recommended before going live):
 *   1. Download it from https://www.fontshare.com/fonts/satoshi
 *   2. Put Satoshi-Variable.woff2 + Satoshi-VariableItalic.woff2 in src/assets/fonts/
 *   3. Uncomment `fontBody` below and add `fontBody.variable` to fontVariables
 *   4. Remove the Fontshare <link> tags from app/layout.jsx
 *   5. In tokens.css change --ff-sans to start with var(--font-satoshi)
 */
export const fontHeading = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// export const fontBody = localFont({
//   src: [
//     { path: "../assets/fonts/Satoshi-Variable.woff2", weight: "300 900", style: "normal" },
//     { path: "../assets/fonts/Satoshi-VariableItalic.woff2", weight: "300 900", style: "italic" },
//   ],
//   variable: "--font-satoshi",
//   display: "swap",
// });

export const fontVariables = `${fontHeading.variable} ${fontMono.variable}`;
