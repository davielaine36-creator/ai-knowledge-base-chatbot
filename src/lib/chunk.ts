import fs from "node:fs";
import path from "node:path";

import { KNOWLEDGE_DIR } from "./config";
import type { RawChunk } from "./types";

/** Target chunk size in characters. Chunks aim to stay under this. */
const MAX_CHUNK_CHARS = 900;

/** Friendlier display names for files whose title-case form looks wrong. */
const SOURCE_NAME_OVERRIDES: Record<string, string> = {
  faqs: "FAQs",
  faq: "FAQ",
  cctv: "CCTV",
};

/** Turn a filename like "requalification.md" into "Requalification". */
function fileToSource(filename: string): string {
  const base = filename.replace(/\.md$/i, "").toLowerCase();
  if (SOURCE_NAME_OVERRIDES[base]) return SOURCE_NAME_OVERRIDES[base];
  return base.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Split a single markdown document into chunks. We split on markdown headings
 * first (so each chunk stays topically coherent), then further split long
 * sections on blank lines so no chunk greatly exceeds MAX_CHUNK_CHARS.
 */
export function chunkMarkdown(
  markdown: string,
  source: string,
  sourceFile: string
): RawChunk[] {
  const lines = markdown.split(/\r?\n/);

  // Group lines into sections keyed by their nearest heading.
  const sections: { heading: string; body: string }[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  const flush = () => {
    const body = currentBody.join("\n").trim();
    if (body) sections.push({ heading: currentHeading, body });
    currentBody = [];
  };

  for (const line of lines) {
    const headingMatch = /^#{1,6}\s+(.*)$/.exec(line);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[1].trim();
    } else {
      currentBody.push(line);
    }
  }
  flush();

  const chunks: RawChunk[] = [];
  let index = 0;

  for (const section of sections) {
    for (const piece of packParagraphs(section.body)) {
      chunks.push({
        id: `${sourceFile.replace(/\.md$/i, "")}-${index}`,
        source,
        sourceFile,
        heading: section.heading,
        text: section.heading ? `${section.heading}\n${piece}` : piece,
      });
      index += 1;
    }
  }

  return chunks;
}

/**
 * Greedily pack paragraphs (separated by blank lines) into chunks of up to
 * MAX_CHUNK_CHARS characters.
 */
function packParagraphs(body: string): string[] {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const pieces: string[] = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    if (!buffer) {
      buffer = paragraph;
    } else if (buffer.length + paragraph.length + 2 <= MAX_CHUNK_CHARS) {
      buffer += `\n\n${paragraph}`;
    } else {
      pieces.push(buffer);
      buffer = paragraph;
    }
  }
  if (buffer) pieces.push(buffer);

  return pieces;
}

/**
 * Read every markdown file in the knowledge directory and return chunks for
 * all of them.
 */
export function readKnowledgeChunks(rootDir = process.cwd()): RawChunk[] {
  const dir = path.join(rootDir, KNOWLEDGE_DIR);
  if (!fs.existsSync(dir)) {
    throw new Error(`Knowledge directory not found: ${dir}`);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .sort();

  const all: RawChunk[] = [];
  for (const file of files) {
    const markdown = fs.readFileSync(path.join(dir, file), "utf8");
    all.push(...chunkMarkdown(markdown, fileToSource(file), file));
  }
  return all;
}
