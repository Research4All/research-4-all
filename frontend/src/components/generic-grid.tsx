import type { ReactNode } from 'react';
import type { GridCols } from '@/types';

interface GenericGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  className?: string;
  gridCols?: GridCols;
}

export function GenericGrid<T>({ 
  items, 
  renderItem, 
  emptyMessage = "No items found.", 
  className = "",
  gridCols = { sm: 1, md: 2, lg: 3, xl: 4 }
}: GenericGridProps<T>) {
  const getGridClasses = () => {
    const classes = [
      'grid gap-4 m-4',
      `grid-cols-${gridCols.sm || 1}`,
    ];
    
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`);
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`);
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={className}>
      {items.length > 0 ? (
        <div className={getGridClasses()}>
          {items.map((item, index) => renderItem(item, index))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-lg text-gray-600 mb-4">{emptyMessage}</div>
        </div>
      )}
    </div>
  );
} 