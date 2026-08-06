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
// LINK-NAME. A link that writes no text of its own is named by the alt of the
// images inside it. If none of them carries one, the link has no accessible
// name at all, which fails WCAG 2.2 SC 2.4.4 and 4.1.2. This is the trap:
// emptying an alt to silence the other rule can produce a worse page than the
// repeat it removed, so the two rules are deliberately opposed and an image
// cannot satisfy one by breaking the other.
//
// The rule reads the anchor's text and not the image's position in it, which is
// a widening. It was written as "the image is the only content of the anchor",
// and that shape is one line of markup away from silence: wrap the image in
// <picture> for a dark-mode badge, or leave a <br /> beside it, and the image
// stops being the only content while the link stays exactly as unnamed. Both
// were planted against the earlier reading and both passed it.
//
// BOTH SPELLINGS OF AN IMAGE AND OF A LINK ARE READ. These pages are Markdown
// carrying raw HTML, so every image and every link here can be written twice
// over, and a rule that reads <img> and <a> alone is silent on the half a
// profile page is conventionally written in: ![alt](src) for the image and
// [![alt](src)](href) for the badge. Three shapes were planted against the
// reading that saw HTML only - a Markdown image repeating prose beside it, a
// Markdown link whose only content is a Markdown image with an empty alt, and
// the same link around an HTML <img> with an empty alt - and all three passed
// it silently. Neither rule is about a syntax; both are about what a screen
// reader announces.
//
// ALT-REPEATS-PROSE. An image that is not carrying a link name, whose alt
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
//   - An alt value holding the quote character that delimits it ends the value
//     early, and the rest of the value is read as further attributes. HTML
//     requires that character escaped, so this is a defect in the page rather
//     than one the reader here can see past.
//   - An <img> parked inside an HTML comment is read as a published image.
//     Masking covers code spans and fenced blocks and not comments, so a tag
//     nobody renders can still be refused for a repeat nobody hears. That is
//     the wide direction and the repair is to delete the comment.
//   - An <img> outside a link with no alt attribute at all is refused by
//     neither rule, and it is a real defect under WCAG 2.2 SC 1.1.1. The two
//     rules here are the two this repository asked for, and a missing alt is
//     not one of them; the run says "no alt attribute" where it meets one, so
//     the silence is at least legible.
//   - Anchors are matched non-greedily and are assumed not to nest. A nested
//     <a> would be read as ending at the inner closing tag, and a Markdown link
//     is read one level of image nesting deep, which is the badge shape, and no
//     further.
//   - Every Markdown image form is read off the ![alt] that opens it, so the
//     inline, full, collapsed and shortcut forms all yield their alt. The cost
//     is that a bracketed phrase in prose written after an exclamation mark is
//     read as an image. That is the wide direction: it can only add a report
//     about text that already looks like an image on the page.
//   - A Markdown link's destination is not prose and is removed before the
//     comparison, because a URL is not text the page announces. Deleting that
//     one line refuses alt="SQLite" for a nearby [handbook](.../SQLite/notes)
//     whose visible text says nothing of the sort, which is what the line is
//     for.
//   - An anchor is read as naming itself when stripping its tags leaves any
//     letter or digit, so a link whose visible text is one character passes
//     LINK-NAME with a name a reader might still call useless. That is SC 2.4.4
//     read narrowly, and no rule here judges whether a name is a good one.
//     Text that normalises to nothing, an emoji on its own, leaves the anchor
//     text-less and the image is required to name it, which is the safe
//     direction of the same reading.
//   - aria-label on the anchor is not read, so a link named that way with an
//     empty-alt image inside it is refused. That is deliberate: whether the
//     rule should exempt it is the open half of #10 and it is a decision rather
//     than an oversight.
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

// A Markdown image, its alt in group 1 and the destination or reference that
// follows it in group 2. Inline ![alt](src), full ![alt][ref], collapsed
// ![alt][] and shortcut ![alt] all open the same way, so one expression carries
// every form and the tail is optional.
const MD_IMAGE = /!\[([^\]]*)\](?:\([^()]*\)|\[[^\]]*\])?/g;

// A Markdown link, its content in group 1. The inner alternation admits one
// level of image nesting, which is how a badge is written: [![alt](src)](href).
// A destination or a reference is required, so a bracketed phrase alone is text.
const MD_LINK = /\[((?:[^[\]]|!\[[^\]]*\])*)\](?:\([^()]*\)|\[[^\]]*\])/dg;

const HTML_ANCHOR = /<a\b[^>]*>([\s\S]*?)<\/a>/dgi;

// The prose an image is compared against: the window around it with every image
// removed first, in both spellings, so an alt can match neither itself nor
// another badge's alt, then with a Markdown link's destination removed because a
// URL is not text the page announces, then with the remaining markup stripped.
function proseAround(lines, line) {
  const from = Math.max(0, line - 1 - WINDOW);
  const to = Math.min(lines.length, line + WINDOW);
  return normalise(
    lines
      .slice(from, to)
      .join("\n")
      .replace(/<img\b[^>]*>/gi, " ")
      .replace(MD_IMAGE, " ")
      .replace(/\]\([^()]*\)/g, "] ")
      .replace(/<[^>]*>/g, " "),
  );
}

// What a link announces on its own: its images removed in both spellings and
// whatever markup is left removed, so a wrapper element, a <br /> and a badge
// all fall out and only what a reader would hear remains.
function linkText(content) {
  return normalise(content.replace(MD_IMAGE, " ").replace(/<[^>]*>/g, " "));
}

// Both spellings of a link, each as the span its content occupies. The offsets
// are read off the match's own group indices, which is exact, rather than by
// searching the match for a copy of its content. No page here is known to
// separate the two readings; one mechanism serving both spellings is the reason
// to prefer it.
function* links(masked) {
  for (const pattern of [HTML_ANCHOR, MD_LINK]) {
    for (const m of masked.matchAll(pattern)) {
      yield { from: m.indices[1][0], to: m.indices[1][1], content: m[1] };
    }
  }
}

// All three forms HTML allows for the value, because both verdicts below turn
// on the quote character alone when only one form is read. Reading the double
// quote by itself made alt='...' indistinguishable from an absent attribute,
// which passed a real repeat as decorative and refused a named link as unnamed.
// The unquoted branch stops at whitespace and at the characters HTML forbids
// inside an unquoted value.
const ALT_VALUE = /\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/i;

function readImages(text) {
  const masked = maskCode(text);
  const lines = masked.split("\n");

  const images = [];
  for (const m of masked.matchAll(/<img\b[^>]*>/gi)) {
    const alt = ALT_VALUE.exec(m[0]);
    images.push({
      start: m.index,
      line: lineOf(masked, m.index),
      alt: alt ? (alt[1] ?? alt[2] ?? alt[3]) : null,
      namesALink: false,
    });
  }
  // Markdown always writes an alt, empty or not, so an absent one is a state
  // only the HTML spelling has.
  for (const m of masked.matchAll(MD_IMAGE)) {
    images.push({
      start: m.index,
      line: lineOf(masked, m.index),
      alt: m[1],
      namesALink: false,
    });
  }
  // Document order, so the report reads down the page and so the image that
  // carries an unnamed link's refusal below is the first one in it.
  images.sort((a, b) => a.start - b.start);

  // An image is carrying a link name when the link around it announces nothing
  // else. Stripping the markup leaves the link's own text, so a wrapper element
  // and a <br /> fall out rather than taking the rule off the link.
  for (const link of links(masked)) {
    const inside = images.filter(
      (image) => image.start >= link.from && image.start < link.to,
    );
    if (inside.length === 0) continue;
    // Text of its own names the link whatever its images carry.
    if (linkText(link.content) !== "") continue;
    // Where an image already names the link, only that image is exempt from the
    // repeat rule and an empty-alt sibling is decorative beside a named link.
    // Where none of them names it the first carries the refusal, so one unnamed
    // link is reported once rather than once per image.
    const named = inside.filter((image) => (image.alt ?? "").trim() !== "");
    for (const image of named.length > 0 ? named : inside.slice(0, 1)) {
      image.namesALink = true;
    }
  }

  return { images, lines };
}

function reportGaps(files) {
  for (const file of files) {
    const { images, lines } = readImages(readFileSync(file, "utf8"));
    const prose = lines.map((l) =>
      normalise(
        l
          .replace(/<img\b[^>]*>/gi, " ")
          .replace(MD_IMAGE, " ")
          .replace(/\]\([^()]*\)/g, "] ")
          .replace(/<[^>]*>/g, " "),
      ),
    );
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
            `::error file=${file},line=${image.line}::${where}: the link around this image writes no text of its own, and the image's alt is ${image.alt === null ? "missing" : "empty"}, so the link has no accessible name (WCAG 2.2 SC 2.4.4, 4.1.2). Give it the name the link should announce.`,
          );
        } else {
          console.log(`${where}: alt="${alt}" names a link, not compared`);
        }
        continue;
      }

      if (alt === "") {
        // Absent and empty are different pages. Neither is refused here, and
        // saying which one was read is what keeps the second case from looking
        // like a decision somebody made.
        console.log(
          image.alt === null
            ? `${where}: no alt attribute, refused by neither rule, see LIMITS`
            : `${where}: alt is empty, decorative, nothing to compare`,
        );
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
