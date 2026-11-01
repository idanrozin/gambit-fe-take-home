import { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { ApplicationDrawer } from '@/components/ApplicationDrawer';
import { ApplicationsSidebar } from '@/components/ApplicationsSidebar';
import { ResourcesView } from '@/components/ResourcesView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button, Toaster } from '@/components/ui';
import { RESOURCES } from '@/domain';
import { cn } from '@/lib/utils';

const SIDEBAR_ID = 'applications-sidebar';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header data-slot="app-header" className="border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-3">
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
          <span data-slot="wordmark" className="font-semibold">
            Applications Console
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div data-slot="app-body" className="flex w-full flex-1 flex-col md:flex-row">
        <aside
          id={SIDEBAR_ID}
          data-slot="app-sidebar"
          aria-labelledby="applications-heading"
          className={cn(
            'border-b bg-sidebar p-4 text-sidebar-foreground md:block md:w-64 md:shrink-0 md:border-r md:border-b-0',
            !sidebarOpen && 'hidden',
          )}
        >
          <h2 id="applications-heading" className="text-sm font-semibold">
            Applications
          </h2>
          <div className="mt-3">
            <ApplicationsSidebar />
          </div>
        </aside>
        <main data-slot="app-main" className="min-w-0 max-w-7xl flex-1 px-4 py-6">
          <h1 className="text-2xl font-semibold">Resources</h1>
          <div className="mt-4">
            <ResourcesView resources={RESOURCES} />
          </div>
        </main>
      </div>
      <ApplicationDrawer resources={RESOURCES} />
      <Toaster />
    </div>
  );
}
