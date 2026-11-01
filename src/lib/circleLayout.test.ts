import { circleLayout } from './circleLayout';

test('returns one point per member, none for zero', () => {
  expect(circleLayout(0, 100)).toEqual([]);
  expect(circleLayout(7, 100)).toHaveLength(7);
});

test('a single member sits at the top', () => {
  const point = circleLayout(1, 100)[0]!;
  expect(point.x).toBeCloseTo(0);
  expect(point.y).toBeCloseTo(-100);
});

test('points are evenly spaced around a circle', () => {
  const points = circleLayout(6, 100);
  const gaps = points.map((point, i) => {
    const next = points[(i + 1) % points.length]!;
    return Math.hypot(next.x - point.x, next.y - point.y);
  });
  for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0]!);
  for (const { x, y } of points) expect(Math.hypot(x, y)).toBeCloseTo(100);
});

test('points stay within the ellipse radii', () => {
  for (let count = 1; count <= 12; count++) {
    for (const { x, y } of circleLayout(count, 300, 190)) {
      expect(Math.abs(x)).toBeLessThanOrEqual(300 + 1e-9);
      expect(Math.abs(y)).toBeLessThanOrEqual(190 + 1e-9);
    }
  }
});
