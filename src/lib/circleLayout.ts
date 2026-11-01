export interface Point {
  x: number;
  y: number;
}

/**
 * `count` points spaced evenly by angle on an ellipse centred on the origin, the first at the
 * top and the rest clockwise. Offset the result to place it.
 */
export function circleLayout(count: number, radiusX: number, radiusY = radiusX): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return { x: radiusX * Math.cos(angle), y: radiusY * Math.sin(angle) };
  });
}
