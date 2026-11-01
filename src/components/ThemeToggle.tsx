import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { useTheme } from '@/components/ThemeProvider';
import type { Theme } from '@/lib/theme';

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <div role="group" aria-label="Theme" className="flex rounded-lg border p-0.5">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                variant={theme === value ? 'secondary' : 'ghost'}
                size="icon-sm"
                aria-label={label}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
