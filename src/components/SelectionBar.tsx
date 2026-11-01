import { Button } from '@/components/ui';

interface SelectionBarProps {
  count: number;
  hiddenCount: number;
  onClear: () => void;
  /** Absent until Applications can be created; the action is then disabled. */
  onCreate?: () => void;
}

/** Sits at the end of the filter row, so it adds no height when it appears. */
export function SelectionBar({ count, hiddenCount, onClear, onCreate }: SelectionBarProps) {
  return (
    <section aria-label="Selection" className="ml-auto flex items-center gap-2">
      <p className="text-sm font-medium tabular-nums">
        {count} selected
        {hiddenCount > 0 && (
          <span className="font-normal text-muted-foreground"> ({hiddenCount} hidden)</span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onClear}>
          Clear selection
        </Button>
        <Button onClick={onCreate} disabled={!onCreate}>
          Create Application
        </Button>
      </div>
    </section>
  );
}
