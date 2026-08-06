// Refuses two defects in the alt text of the pages this repository publishes.
//
// It is a tracked file rather than a block inside .github/workflows/ci.yml so
// that the laptop and the runner execute the same bytes. `npm run lint:alt`
// names the files once, in package.json, and the workflow calls that script.
//
// It has no dependencies. Node is already a runtime this repository carries
// (package.json pins Prettier, and ci.yml already installs Node for it), so the
// check adds no language and no third-party code to the tree. The page is raw
// HTML inside Markdown; an HTML parser would read it more exactly than the
// regexes below, and the cost of that accuracy is a dependency in a repository
// whose whole tracked tree is a profile page. What the regex approach cannot do
// is written down under LIMITS.
//
// THE TWO RULES
//
// LINK-NAME. An <img> that is the only content of an <a> carries the link's
// accessible name. If its alt is missing or empty, the link has no name at all,
// which fails WCAG 2.2 SC 2.4.4 and 4.1.2. This is the trap: emptying an alt to
// silence the other rule can produce a worse page than the repeat it removed,
// so the two rules are deliberately opposed and an image cannot satisfy one by
// breaking the other.
//
// ALT-REPEATS-PROSE. An <img> that is not carrying a link name, whose alt
// reproduces text already written near it, tells a screen reader nothing it is
// not about to hear anyway. Under WCAG 2.2 SC 1.1.1 the alternative has to
// serve an equivalent purpose; a duplicate serves none, and alt="" is what
// removes a decorative image from the accessibility tree cleanly.
//
// Images that carry a link name are exempt from the second rule ON PURPOSE.
// There the alt is the link's name rather than a description of a picture, and
// naming a link after the sentence that introduces it is correct rather than
// redundant.
//
// THE WINDOW
//
// "Near it" is WINDOW source lines either side of the line the tag opens on.
// The number is chosen, not inherited. Every image on the tracked pages reaches
// the nearest prose line above it at 11 lines or less; the widest is the last
// toolbox badge reaching its own heading. Measured with:
//
//     node tools/alt-check.mjs --gaps README.md assets/README.md
//
// Twelve is that measurement with a line to spare, and it errs WIDE knowingly:
// a repeat one line outside the window is still a repeat, whereas the cost of
// the extra line is a false positive that a reader resolves in seconds. Moving
// this number changes what is refused, which is why it is one line of code with
// a measurement behind it rather than a constant buried in a workflow.
//
// LIMITS, stated rather than discovered later
//
//   - The comparison is over normalised text, so it catches a repeat and not a
//     paraphrase. An alt that restates the page's subject in different words
//     passes. That is the shape of the defect this page was published with, and
//     no rule here would have refused it; what refuses that is a reader.
//   - Normalising an apostrophe to a space splits a contraction into two
//     tokens, so "I'm" and "I am" do not compare equal and an alt repeating a
//     contracted phrase in its expanded form passes. Found by planting the
//     expanded form and watching the check stay green on it.
//   - A one-word alt matches a one-word token. alt="Docker" beside the word
//     Docker in prose is refused, which is the rule applied consistently rather
//     than an accident, but it is the likeliest false positive.
//   - Anchors are matched non-greedily and are assumed not to nest. A nested
//     <a> would be read as ending at the inner closing tag.
//   - Only the files named on the command line are read. Nothing here discovers
//     a page that was added and not listed.

import { readFileSync } from "node:fs";

const WINDOW = 12;

// A code span or a fenced block can hold the literal text of a tag without
// publishing an image: assets/README.md line 7 documents the <img src=...> in
// the profile README, and reading that as an image would refuse a sentence.
// Masking preserves every byte offset and every newline, so line numbers and
// the anchor scan below are unaffected.
function maskCode(text) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  return text.replace(/^```[\s\S]*?^```/gm, blank).replace(/`[^`\n]*`/g, blank);
}

// Lowercase, then reduce everything that is not a letter or a number to a single
// space. Punctuation, case and markup fall out, so "since 2017." and
// alt="since 2017" compare equal. It is Unicode-aware: an accented or
// non-Latin word survives as a word rather than being deleted.
function normalise(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text[i] === "\n") line++;
  return line;
}

// The prose an image is compared against: the window around it with every <img>
// removed first, so an alt can match neither itself nor another badge's alt,
// and then with the remaining markup stripped.
function proseAround(lines, line) {
  const from = Math.max(0, line - 1 - WINDOW);
  const to = Math.min(lines.length, line + WINDOW);
  return normalise(
    lines
      .slice(from, to)
      .join("\n")
      .replace(/<img\b[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  );
}

function readImages(text) {
  const masked = maskCode(text);
  const lines = masked.split("\n");

  const images = [];
  for (const m of masked.matchAll(/<img\b[^>]*>/gi)) {
    const alt = /\balt\s*=\s*"([^"]*)"/i.exec(m[0]);
    images.push({
      tag: m[0],
      start: m.index,
      line: lineOf(masked, m.index),
      alt: alt ? alt[1] : null,
      namesALink: false,
    });
  }

  // An image is carrying a link name when it is the only thing inside the <a>.
  for (const a of masked.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    if (!/^<img\b[^>]*>$/i.test(a[1].trim())) continue;
    const inner = a.index + a[0].indexOf(a[1]);
    for (const image of images) {
      if (image.start >= inner && image.start < inner + a[1].length) {
        image.namesALink = true;
      }
    }
  }

  return { images, lines };
}

function reportGaps(files) {
  for (const file of files) {
    const { images, lines } = readImages(readFileSync(file, "utf8"));
    const prose = lines.map((l) => normalise(l.replace(/<[^>]*>/g, " ")));
    for (const image of images) {
      let gap = null;
      for (let j = image.line - 2; j >= 0; j--) {
        if (prose[j] !== "") {
          gap = image.line - 1 - j;
          break;
        }
      }
      console.log(`${file}:${image.line} nearest prose above: ${gap} line(s)`);
    }
  }
}

function main(argv) {
  const files = argv.filter((a) => a !== "--gaps");
  if (files.length === 0) {
    console.error("alt-check: no files given, so nothing was examined.");
    return 2;
  }
  if (argv.includes("--gaps")) {
    reportGaps(files);
    return 0;
  }

  let examined = 0;
  let refused = 0;

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const { images, lines } = readImages(text);

    for (const image of images) {
      examined++;
      const where = `${file}:${image.line}`;
      const alt = image.alt === null ? "" : image.alt.trim();

      if (image.namesALink) {
        if (alt === "") {
          refused++;
          console.log(
            `::error file=${file},line=${image.line}::${where}: this image is the only content of a link, and its alt is ${image.alt === null ? "missing" : "empty"}, so the link has no accessible name (WCAG 2.2 SC 2.4.4, 4.1.2). Give it the name the link should announce.`,
          );
        } else {
          console.log(`${where}: alt="${alt}" names a link, not compared`);
        }
        continue;
      }

      if (alt === "") {
        console.log(`${where}: alt is empty, decorative, nothing to compare`);
        continue;
      }

      const needle = normalise(alt);
      if (needle === "") {
        console.log(`${where}: alt="${alt}" holds no comparable text`);
        continue;
      }

      const prose = proseAround(lines, image.line);
      if (` ${prose} `.includes(` ${needle} `)) {
        refused++;
        console.log(
          `::error file=${file},line=${image.line}::${where}: alt="${alt}" repeats text already written within ${WINDOW} lines of it, so a screen reader announces it twice and learns nothing from the image. Either describe the image or set alt="" if it is decorative.`,
        );
      } else {
        console.log(`${where}: alt="${alt}" does not repeat nearby text`);
      }
    }
  }

  // A run that found no images at all would otherwise print the same green as a
  // run that read every one and found them sound.
  if (examined === 0) {
    console.error(
      `alt-check: no <img> found in ${files.length} file(s), so the check measured nothing. Failing closed rather than reporting a clean page.`,
    );
    return 2;
  }

  console.log(
    `alt-check: ${examined} image(s) examined across ${files.length} file(s), ${refused} refused.`,
  );
  return refused === 0 ? 0 : 1;
}

try {
  process.exit(main(process.argv.slice(2)));
} catch (error) {
  console.error(`alt-check: ${error.message}`);
  console.error("Failing closed rather than reporting a page nothing read.");
  process.exit(2);
}
