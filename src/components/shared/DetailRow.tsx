import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
  copyable?: boolean;
  highlight?: boolean;
  className?: string;
}

export function DetailRow({ label, value, icon, highlight, className }: DetailRowProps) {
  return (
    <div className={cn('flex items-start gap-3 py-2.5 border-b last:border-0', className)}>
      {icon && (
        <div className="w-7 h-7 rounded-md bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name={icon} size={13} className="text-orange-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <div className={cn('text-sm mt-0.5', highlight ? 'font-semibold text-orange-500' : 'text-foreground')}>
          {value}
        </div>
      </div>
    </div>
  );
}

interface DetailGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}

export function DetailGrid({ children, cols = 2 }: DetailGridProps) {
  return (
    <div className={cn('grid gap-x-6 px-1', cols === 2 && 'grid-cols-1 md:grid-cols-2', cols === 1 && 'grid-cols-1', cols === 3 && 'grid-cols-1 md:grid-cols-3')}>
      {children}
    </div>
  );
}
