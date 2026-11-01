import { render } from '@testing-library/react';
import { RESOURCES } from '@/domain';
import {
  ApplicationGraph,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  NODE_HEIGHT,
  NODE_WIDTH,
} from './ApplicationGraph';

interface Box {
  x: number;
  y: number;
}

function nodeBoxes(count: number): Box[] {
  const members = RESOURCES.slice(0, count);
  const { container } = render(
    <ApplicationGraph
      application={{ id: 'a', name: 'App', resourceIds: members.map((m) => m.id) }}
      members={members}
    />,
  );
  return [...container.querySelectorAll('rect')].map((rect) => {
    const [x, y] = /translate\(([^,\s]+),?\s*([^)\s]+)\)/
      .exec(rect.closest('[transform]')!.getAttribute('transform')!)!
      .slice(1);
    // The group sits at the node's centre; the box's corner is half its size away.
    return { x: Number(x) - NODE_WIDTH / 2, y: Number(y) - NODE_HEIGHT / 2 };
  });
}

const overlaps = (a: Box, b: Box) =>
  Math.abs(a.x - b.x) < NODE_WIDTH && Math.abs(a.y - b.y) < NODE_HEIGHT;

test.each([1, 2, 12])(
  'draws %i members and the centre without overlaps, inside the view',
  (count) => {
    const boxes = nodeBoxes(count);
    expect(boxes).toHaveLength(count + 1);
    boxes.forEach((box, i) => {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + NODE_WIDTH).toBeLessThanOrEqual(GRAPH_WIDTH);
      expect(box.y + NODE_HEIGHT).toBeLessThanOrEqual(GRAPH_HEIGHT);
      boxes.slice(i + 1).forEach((other) => expect(overlaps(box, other)).toBe(false));
    });
  },
);
