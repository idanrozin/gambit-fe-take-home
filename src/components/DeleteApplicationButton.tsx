import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useApplicationActions } from '@/components/ApplicationsProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@/components/ui';
import type { Application } from '@/domain';

/** An icon button that asks for confirmation before deleting; Radix returns focus to it on cancel. */
export function DeleteApplicationButton({ application }: { application: Application }) {
  const { remove } = useApplicationActions();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          aria-label={`Delete ${application.name}`}
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {application.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the Application only. Its resources aren't affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              remove(application.id);
              toast.success(`Deleted ${application.name}`);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
