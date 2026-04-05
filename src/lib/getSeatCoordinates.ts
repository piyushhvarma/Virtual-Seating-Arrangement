/**
 * Converts a student's column-wise index in a room to an RXCX seat label.
 *
 * MUJ PDF layout: students are filled column-first.
 * index=0 → R1C1, index=1 → R2C1, ..., index=rowsPerCol → R1C2, etc.
 *
 * @param index        0-based position of the student in the room list
 * @param rowsPerCol   Number of rows per column in the room
 * @returns            Seat label like "R4C3"
 */
export function getSeatCoordinates(index: number, rowsPerCol: number): string {
  const col = Math.floor(index / rowsPerCol) + 1;
  const row = (index % rowsPerCol) + 1;
  return `R${row}C${col}`;
}

/**
 * Parses an RXCX string back into { row, col } numbers (1-indexed).
 */
export function parseSeatLabel(label: string): { row: number; col: number } {
  const match = label.match(/R(\d+)C(\d+)/);
  if (!match) return { row: 1, col: 1 };
  return { row: parseInt(match[1]), col: parseInt(match[2]) };
}
