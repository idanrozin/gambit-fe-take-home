import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { CRITICALITY_LABELS, type Criticality } from '@/domain';
import { MultiSelectFilter } from './MultiSelectFilter';

function Harness({ onChange }: { onChange: (next: Criticality[]) => void }) {
  const [selected, setSelected] = useState<Criticality[]>([]);
  return (
    <MultiSelectFilter
      label="Criticality"
      options={CRITICALITY_LABELS}
      selected={selected}
      onChange={(next) => {
        setSelected(next);
        onChange(next);
      }}
    />
  );
}

it('keeps selections in display order, whatever the click order', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<Harness onChange={onChange} />);

  await user.click(screen.getByRole('button', { name: /criticality filter/i }));
  await user.click(screen.getByLabelText('Low'));
  await user.click(screen.getByLabelText('Critical'));

  expect(onChange).toHaveBeenLastCalledWith(['critical', 'low']);
  expect(
    screen.getByRole('button', { name: 'Criticality filter, 2 selected' }),
  ).toBeInTheDocument();
});
