export interface PositionedProduct {
  position: number;
}

export function parseStartContinuousAfter(value: string): number {
  const n = parseInt(value, 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

export function getUpcomingAddPositions(
  startContinuousAfter: number,
  assigned: PositionedProduct[],
  maxOrdersByLevel: number,
  count = 5
): number[] {
  const occupied = new Set(assigned.map((p) => p.position));
  const positions: number[] = [];
  let candidate = startContinuousAfter + 1;
  const max = Math.max(0, maxOrdersByLevel);

  while (positions.length < count && candidate <= max) {
    if (!occupied.has(candidate)) {
      positions.push(candidate);
    }
    candidate += 1;
  }

  return positions;
}

export function getNextAddPosition(
  startContinuousAfter: number,
  assigned: PositionedProduct[],
  maxOrdersByLevel: number
): number | null {
  const [next] = getUpcomingAddPositions(startContinuousAfter, assigned, maxOrdersByLevel, 1);
  return next ?? null;
}
