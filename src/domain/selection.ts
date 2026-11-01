import type { Resource } from './types';

export type SelectionState = 'none' | 'some' | 'all';

export const NO_SELECTION: ReadonlySet<string> = new Set();

/** Adds `id` when absent, removes it when present. */
export function toggleSelected(selected: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(selected);
  if (!next.delete(id)) next.add(id);
  return next;
}

/** Selects or deselects `visible` only; selected resources hidden by a filter are left alone. */
export function setVisibleSelected(
  selected: ReadonlySet<string>,
  visible: Resource[],
  checked: boolean,
): ReadonlySet<string> {
  const next = new Set(selected);
  for (const { id } of visible) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  return next;
}

/** Drives the header checkbox: only the visible rows count. */
export function visibleSelectionState(
  selected: ReadonlySet<string>,
  visible: Resource[],
): SelectionState {
  const count = visible.filter((r) => selected.has(r.id)).length;
  if (count === 0) return 'none';
  return count === visible.length ? 'all' : 'some';
}

/** How many selected resources are filtered out of view. */
export function countHidden(selected: ReadonlySet<string>, visible: Resource[]): number {
  return selected.size - visible.filter((r) => selected.has(r.id)).length;
}
