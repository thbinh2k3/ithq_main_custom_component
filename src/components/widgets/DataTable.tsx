import { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  TableIcon,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { WidgetContainer } from './WidgetGrid';
import { WidgetSize, widgetBaseStyles, widgetHeaderStyles, widgetContentStyles, drillDownIndicatorStyles } from './widget-styles';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
  searchable?: boolean;
}

interface TableRow {
  id: string | number;
  [key: string]: unknown;
}

interface DataTableProps {
  size?: WidgetSize;
  title: string;
  subtitle?: string;
  data: TableRow[];
  columns: TableColumn[];
  pageSize?: number;
  searchable?: boolean;
  onRowClick?: (row: TableRow) => void;
  onRowSelect?: (selectedRows: TableRow[]) => void;
  isDrillDownEnabled?: boolean;
  className?: string;
  showDetailPanel?: boolean;
  detailPanelRenderer?: (row: TableRow) => React.ReactNode;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pageNumbers = useMemo(() => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always show first page
    pages.push(1);
    
    if (currentPage <= 4) {
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600 font-lexend">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pageNumbers.map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={cn(
              "min-w-[2rem]",
              page === currentPage && "bg-ithq-teal-600 hover:bg-ithq-teal-700"
            )}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Sort icon component
const SortIcon = ({ 
  column, 
  sortConfig 
}: { 
  column: TableColumn; 
  sortConfig: SortConfig;
}) => {
  if (!column.sortable) return null;
  
  const isActive = sortConfig?.key === column.key;
  
  if (!isActive) {
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  }
  
  return sortConfig.direction === 'asc' 
    ? <ArrowUp className="h-4 w-4 text-ithq-teal-600" />
    : <ArrowDown className="h-4 w-4 text-ithq-teal-600" />;
};

// Detail panel component
const DetailPanel = ({ 
  row, 
  columns,
  detailRenderer 
}: { 
  row: TableRow; 
  columns: TableColumn[];
  detailRenderer?: (row: TableRow) => React.ReactNode;
}) => {
  if (detailRenderer) {
    return <div>{detailRenderer(row)}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {columns.map((column) => {
          const value = row[column.key];
          const displayValue = column.render ? column.render(value, row) : value;
          
          return (
            <div key={column.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-600 font-lexend">
                {column.header}
              </label>
              <div className="text-sm text-gray-900 font-poppins">
                {displayValue ? String(displayValue) : '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DataTable = ({
  size = 'full',
  title,
  subtitle,
  data,
  columns,
  pageSize = 10,
  searchable = true,
  onRowClick,
  onRowSelect,
  isDrillDownEnabled = true,
  className,
  showDetailPanel = true,
  detailPanelRenderer
}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = data.filter(row => {
        return columns.some(column => {
          if (column.searchable === false) return false;
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [data, columns, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (column: TableColumn) => {
    if (!column.sortable) return;
    
    setSortConfig(current => {
      if (current?.key === column.key) {
        return current.direction === 'asc' 
          ? { key: column.key, direction: 'desc' }
          : null;
      }
      return { key: column.key, direction: 'asc' };
    });
  };

  const handleRowClick = (row: TableRow) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const isInteractive = (onRowClick && isDrillDownEnabled) || showDetailPanel;

  return (
    <WidgetContainer size={size} className={className}>
      <div className={cn(
        widgetBaseStyles,
        isInteractive && "group relative"
      )}>

        {/* Header */}
        <div className={widgetHeaderStyles}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TableIcon className="h-5 w-5 text-ithq-teal-600" />
                <h3 className="text-lg font-poppins font-semibold text-gray-900">
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p className="text-sm text-gray-600 font-lexend">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Search */}
            {searchable && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className={widgetContentStyles}>
          {processedData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TableIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-lexend">
                {searchTerm ? 'No results found' : 'No data available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={cn(
                            "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-lexend",
                            column.sortable && "cursor-pointer hover:bg-gray-100 select-none",
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}
                          style={{ width: column.width }}
                          onClick={() => handleSort(column)}
                        >
                          <div className="flex items-center gap-2">
                            <span>{column.header}</span>
                            <SortIcon column={column} sortConfig={sortConfig} />
                          </div>
                        </th>
                      ))}
                      {showDetailPanel && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-lexend w-16">
                          Details
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((row) => (
                      <tr
                        key={row.id}
                        className={cn(
                          "hover:bg-gray-50 transition-colors",
                          onRowClick && "cursor-pointer"
                        )}
                        onClick={() => handleRowClick(row)}
                      >
                        {columns.map((column) => {
                          const value = row[column.key];
                          const displayValue = column.render ? column.render(value, row) : value;
                          
                          return (
                            <td
                              key={column.key}
                              className={cn(
                                "px-4 py-3 text-sm text-gray-900 font-poppins",
                                column.align === 'center' && "text-center",
                                column.align === 'right' && "text-right"
                              )}
                            >
                              {displayValue ? String(displayValue) : ''}
                            </td>
                          );
                        })}
                        {showDetailPanel && (
                          <td className="px-4 py-3 text-center">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="right" className="w-[600px]">
                                <SheetHeader>
                                  <SheetTitle className="font-poppins">
                                    Row Details
                                  </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                  <DetailPanel 
                                    row={row} 
                                    columns={columns}
                                    detailRenderer={detailPanelRenderer}
                                  />
                                </div>
                              </SheetContent>
                            </Sheet>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              {/* Summary */}
              <div className="text-xs text-gray-500 font-lexend">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedData.length)} of {processedData.length} entries
                {searchTerm && ` (filtered from ${data.length} total entries)`}
              </div>
            </div>
          )}
        </div>
      </div>
    </WidgetContainer>
  );
};
