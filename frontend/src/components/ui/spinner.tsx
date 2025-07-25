// Majority of code comes from shadcn component
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  showText?: boolean;
}

interface LoadingGridProps {
  className?: string;
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export function Spinner({ size = 'md', className, text, showText = false }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
      {showText && text && (
        <p className="text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  );
}

export function LoadingGrid({ className, text, showText = false }: LoadingGridProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-blue-600 rounded animate-pulse"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      {showText && text && (
        <p className="text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  );
}

export function LoadingDots({ className, text, showText = false }: LoadingGridProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="flex space-x-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
      {showText && text && (
        <p className="text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
} 