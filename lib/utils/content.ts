/**
 * Block parser for merged pulse content.
 *
 * Merged notes are saved in this format:
 *   Main thought here
 *
 *   — 3h fa —
 *   Content of the first merged note
 *
 *   — ieri —
 *   Content of the second merged note
 */

export interface Block {
  text: string
  label?: string  // human-readable timestamp, e.g. "3h fa"
  isMain: boolean
}

/** Split pulse content into structured blocks. */
export function parseBlocks(content: string): Block[] {
  const dividerRe = /\n\n— .+? —\n/

  if (!dividerRe.test(content)) {
    return [{ text: content.trim(), isMain: true }]
  }

  const parts = content.split(/\n\n— .+? —\n/)
  const labelMatches = [...content.matchAll(/\n\n— (.+?) —\n/g)]
  const labels = labelMatches.map((m) => m[1])

  return parts.map((text, i) => ({
    text: text.trim(),
    label: i > 0 ? labels[i - 1] : undefined,
    isMain: i === 0,
  }))
}

/** Count merged blocks in content (total blocks minus the main one). */
export function countMergedBlocks(content: string): number {
  return parseBlocks(content).filter((b) => !b.isMain).length
}
