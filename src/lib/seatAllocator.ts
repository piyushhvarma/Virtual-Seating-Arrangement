import { getSeatCoordinates } from "./getSeatCoordinates";

export interface AllocationResult {
  regNo: string;
  seatIndex: number;
  seatLabel: string;
}

/**
 * Auto-assign seats to students in a room grid.
 *
 * Fills column-first to match MUJ convention:
 *   index 0 → R1C1, index 1 → R2C1, ..., index rows → R1C2, etc.
 *
 * @param regNumbers  Ordered list of registration numbers to assign
 * @param rows        Number of rows in the room
 * @param cols        Number of columns in the room
 * @param startIndex  Starting seat index (for partial room fills)
 * @returns           Array of allocations (capped at room capacity)
 */
export function autoAssignSeats(
  regNumbers: string[],
  rows: number,
  cols: number,
  occupiedIndices: Set<number> = new Set()
): { assigned: AllocationResult[]; overflow: string[] } {
  const capacity = rows * cols;
  const assigned: AllocationResult[] = [];
  const overflow: string[] = [];

  let currentRegIdx = 0;
  for (let seatIndex = 0; seatIndex < capacity; seatIndex++) {
    if (currentRegIdx >= regNumbers.length) break;
    if (occupiedIndices.has(seatIndex)) continue; // skip taken

    assigned.push({
      regNo: regNumbers[currentRegIdx],
      seatIndex,
      seatLabel: getSeatCoordinates(seatIndex, rows),
    });
    currentRegIdx++;
  }

  // Any left over
  for (let i = currentRegIdx; i < regNumbers.length; i++) {
    overflow.push(regNumbers[i]);
  }

  return { assigned, overflow };
}
