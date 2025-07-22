import type { ReactNode } from 'react';
import type { GridCols } from '@/types';
import { useState, useEffect } from 'react';

interface GenericGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  className?: string;
  gridCols?: GridCols;
  itemsPerPage?: number;
  showLoadMore?: boolean;
}

export function GenericGrid<T>({ 
  items, 
  renderItem, 
  emptyMessage = "No items found.", 
  className = "",
  gridCols = { sm: 1, md: 2, lg: 3, xl: 4 },
  itemsPerPage = 12,
  showLoadMore = true
}: GenericGridProps<T>) {
  const [displayedItems, setDisplayedItems] = useState(itemsPerPage);

  useEffect(() => {
    setDisplayedItems(itemsPerPage);
  }, [items, itemsPerPage]);

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

  const handleLoadMore = () => {
    setDisplayedItems(prev => Math.min(prev + itemsPerPage, items.length));
  };

  const hasMoreItems = displayedItems < items.length;
  const itemsToShow = items.slice(0, displayedItems);

  return (
    <div className={className}>
      {items.length > 0 ? (
        <>
          <div className={getGridClasses()}>
            {itemsToShow.map((item, index) => renderItem(item, index))}
          </div>
          
          {showLoadMore && hasMoreItems && (
            <div className="flex justify-center mt-6 mb-4">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Load More ({items.length - displayedItems} remaining)
              </button>
            </div>
          )}
          
          {showLoadMore && !hasMoreItems && items.length > itemsPerPage && (
            <div className="flex justify-center mt-6 mb-4">
              <div className="text-gray-500 text-sm">
                All items loaded ({items.length} total)
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-lg text-gray-600 mb-4">{emptyMessage}</div>
        </div>
      )}
    </div>
  );
} 