import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { Button, Checkbox, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { valuesOf } from '@/domain';

export interface MultiSelectFilterProps<T extends string> {
  label: string;
  /** Option value → display label, in display order. */
  options: Record<T, string>;
  selected: T[];
  onChange: (next: T[]) => void;
}

/**
 * A popover of real checkboxes. The option lists are short (≤ 4), so a searchable combobox
 * would add nothing, and checkboxes announce "checked" correctly where listbox options don't.
 */
export function MultiSelectFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps<T>) {
  const id = useId();
  const values = valuesOf(options);

  const toggle = (value: T, checked: boolean) =>
    // Keep the display order regardless of click order, so the selection is canonical.
    onChange(values.filter((v) => (v === value ? checked : selected.includes(v))));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label={`${label} filter, ${selected.length} selected`}>
          {label}
          {selected.length > 0 && (
            <span className="rounded-sm bg-muted px-1.5 text-xs tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronDown aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-muted-foreground">{label}</legend>
          <ul className="space-y-1">
            {values.map((value) => {
              const optionId = `${id}-${value}`;
              return (
                <li
                  key={value}
                  className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted"
                >
                  <Checkbox
                    id={optionId}
                    checked={selected.includes(value)}
                    onCheckedChange={(checked) => toggle(value, checked === true)}
                  />
                  <label htmlFor={optionId} className="flex-1 cursor-pointer text-sm">
                    {options[value]}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange([])}>
            Clear {label.toLowerCase()}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
