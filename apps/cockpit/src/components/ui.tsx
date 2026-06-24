import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/* ---- Card ---------------------------------------------------------------- */
export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-md border border-line bg-surface shadow-sm', className)} {...p} />
  );
}
export function CardHeader({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-2 px-4 pb-2 pt-4', className)}
      {...p}
    />
  );
}
export function CardTitle({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold tracking-tight', className)} {...p} />;
}
export function CardContent({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4', className)} {...p} />;
}

/* ---- Badge --------------------------------------------------------------- */
export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-none',
  {
    variants: {
      tone: {
        neutral: 'border-line bg-subtle text-muted',
        accent: 'border-accent/30 bg-accent/10 text-accent',
        on_track: 'border-status-on_track/30 bg-status-on_track/10 text-status-on_track',
        at_risk: 'border-status-at_risk/30 bg-status-at_risk/10 text-status-at_risk',
        blocked: 'border-status-blocked/30 bg-status-blocked/10 text-status-blocked',
        not_started:
          'border-status-not_started/30 bg-status-not_started/10 text-status-not_started',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;
export function Badge({ className, tone, ...p }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...p} />;
}

/* ---- Button -------------------------------------------------------------- */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent/90',
        outline: 'border border-line bg-surface hover:bg-subtle',
        ghost: 'text-muted hover:bg-subtle hover:text-ink',
      },
      size: { sm: 'h-8 px-3', md: 'h-9 px-4', icon: 'h-8 w-8' },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...p },
  ref,
) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...p} />;
});

/* ---- Progress ------------------------------------------------------------ */
export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-line', className)}>
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}

/* ---- Separator ----------------------------------------------------------- */
export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-line', className)} />;
}

/* ---- Sheet (right-side panel over Radix Dialog) -------------------------- */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-xl focus:outline-none">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted hover:bg-subtle" aria-label="Fermer">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ---- Field helpers ------------------------------------------------------- */
export function Label({ className, ...p }: HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1 block text-xs font-medium text-muted', className)} {...p} />;
}
export function selectClass(className?: string) {
  return cn(
    'h-8 w-full rounded-md border border-line bg-surface px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
    className,
  );
}
export function inputClass(className?: string) {
  return cn(
    'h-8 w-full rounded-md border border-line bg-surface px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
    className,
  );
}
