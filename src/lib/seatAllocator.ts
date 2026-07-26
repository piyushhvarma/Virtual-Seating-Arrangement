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
  startIndex: number = 0
): { assigned: AllocationResult[]; overflow: string[] } {
  const capacity = rows * cols;
  const availableSlots = capacity - startIndex;

  const assigned: AllocationResult[] = [];
  const overflow: string[] = [];

  regNumbers.forEach((regNo, i) => {
    const seatIndex = startIndex + i;
    if (seatIndex < capacity) {
      assigned.push({
        regNo,
        seatIndex,
        seatLabel: getSeatCoordinates(seatIndex, rows),
      });
    } else {
      overflow.push(regNo);
    }
  });

  return { assigned, overflow };
}
