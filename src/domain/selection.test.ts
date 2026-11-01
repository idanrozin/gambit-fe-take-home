import { RESOURCES } from './resources';
import {
  NO_SELECTION,
  countHidden,
  setVisibleSelected,
  toggleSelected,
  visibleSelectionState,
} from './selection';

const [a, b, c, d] = RESOURCES as [
  (typeof RESOURCES)[number],
  (typeof RESOURCES)[number],
  (typeof RESOURCES)[number],
  (typeof RESOURCES)[number],
];

test('toggleSelected adds then removes without mutating the input', () => {
  const one = toggleSelected(NO_SELECTION, a.id);
  expect([...one]).toEqual([a.id]);
  expect(NO_SELECTION.size).toBe(0);
  expect(toggleSelected(one, a.id).size).toBe(0);
});

test('setVisibleSelected touches only the visible rows', () => {
  const selected = new Set([a.id, d.id]);
  const visible = [a, b, c];

  expect([...setVisibleSelected(selected, visible, true)].sort()).toEqual(
    [a.id, b.id, c.id, d.id].sort(),
  );
  expect([...setVisibleSelected(selected, visible, false)]).toEqual([d.id]);
});

test('visibleSelectionState ignores selected rows that are hidden', () => {
  const visible = [a, b];
  expect(visibleSelectionState(NO_SELECTION, visible)).toBe('none');
  expect(visibleSelectionState(new Set([c.id]), visible)).toBe('none');
  expect(visibleSelectionState(new Set([a.id, c.id]), visible)).toBe('some');
  expect(visibleSelectionState(new Set([a.id, b.id]), visible)).toBe('all');
});

test('countHidden counts selected resources outside the visible rows', () => {
  expect(countHidden(NO_SELECTION, [a])).toBe(0);
  expect(countHidden(new Set([a.id, b.id, c.id]), [a])).toBe(2);
  expect(countHidden(new Set([a.id]), [])).toBe(1);
});
