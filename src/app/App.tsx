import { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { ResourcesTable } from '@/components/ResourcesTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button, Toaster } from '@/components/ui';
import { RESOURCES } from '@/domain';
import { cn } from '@/lib/utils';

const SIDEBAR_ID = 'applications-sidebar';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Applications"
            aria-expanded={sidebarOpen}
            aria-controls={SIDEBAR_ID}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <MenuIcon />
          </Button>
          <span className="font-semibold">Applications Console</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        <aside
          id={SIDEBAR_ID}
          aria-labelledby="applications-heading"
          className={cn(
            'border-b bg-sidebar p-4 text-sidebar-foreground md:block md:w-64 md:shrink-0 md:border-r md:border-b-0',
            !sidebarOpen && 'hidden',
          )}
        >
          <h2 id="applications-heading" className="text-sm font-semibold">
            Applications
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">No Applications yet.</p>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6">
          <h1 className="text-2xl font-semibold">Resources</h1>
          <div className="mt-4 rounded-lg border">
            <ResourcesTable resources={RESOURCES} />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
