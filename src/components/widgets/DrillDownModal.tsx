import { ReactNode } from 'react';
import { X, ExternalLink, Filter, Download, Calendar, Users, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { KPITile } from './KPITile';
import { BarChart } from '../ui/BarChart';
import { LineChart } from '../ui/LineChart';
import { PieChart } from '../ui/PieChart';
import { DataTable } from './DataTable';
import type { DrillDownContext, DrillDownContent, DrillDownSummary } from './drill-down-utils';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: DrillDownContext;
  content: DrillDownContent;
  onExport?: () => void;
  onApplyFilters?: (filters: Record<string, unknown>) => void;
  className?: string;
}

// Summary section component
const DrillDownSummary = ({
  summary
}: {
  summary: DrillDownSummary;
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-poppins font-bold text-gray-900 mb-2">
          {summary.title}
        </h2>
        {summary.description && (
          <p className="text-sm text-gray-600 font-lexend">
            {summary.description}
          </p>
        )}
      </div>

      {/* Applied Filters */}
      {summary.filters.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 font-lexend">
              Applied Filters
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.filters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="font-lexend">
                {filter.label}: {filter.value}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 font-lexend mb-3">
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.kpis.map((kpi, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-lexend text-gray-600">
                  {kpi.label}
                </span>
                {kpi.icon && (
                  <div className="text-gray-400">
                    {kpi.icon}
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between">
                <span className="text-lg font-poppins font-bold text-gray-900">
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </span>

                {kpi.change !== undefined && (
                  <Badge
                    variant={kpi.trend === 'up' ? 'default' : kpi.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Chart section component
const DrillDownCharts = ({
  charts
}: {
  charts: DrillDownContent['charts'];
}) => {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-gray-700 font-lexend">
        Detailed Analysis
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => {
          const commonProps = {
            title: chart.title,
            data: chart.data,
            size: 'half' as const,
            isDrillDownEnabled: false
          };

          switch (chart.type) {
            case 'bar':
              return (
                <BarChart
                  key={chart.id}
                  {...commonProps}
                  data={chart.data as Array<{ label: string; value: number; }>}
                />
              );
            case 'line':
              return (
                <LineChart
                  key={chart.id}
                  {...commonProps}
                  data={chart.data as Array<{ timestamp: string; date: string; value: number; }>}
                />
              );
            case 'pie':
              return (
                <PieChart
                  key={chart.id}
                  {...commonProps}
                  data={chart.data as Array<{ label: string; value: number; }>}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

// Table section component
const DrillDownTable = ({
  table
}: {
  table: DrillDownContent['table'];
}) => {
  if (!table) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 font-lexend">
        Detailed Data
      </h3>

      <DataTable
        title={table.title}
        data={table.data as Array<{ id: string | number;[key: string]: unknown; }>}
        columns={table.columns}
        size="full"
        isDrillDownEnabled={false}
        showDetailPanel={false}
        pageSize={5}
      />
    </div>
  );
};

export const DrillDownModal = ({
  isOpen,
  onClose,
  context,
  content,
  onExport,
  onApplyFilters,
  className
}: DrillDownModalProps) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-6xl max-h-[90vh] overflow-y-auto",
        className
      )}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-poppins font-bold text-gray-900">
              {context.widget.title} - Drill Down
            </DialogTitle>
            <DialogDescription className="font-lexend">
              Detailed view for "{context.filter.label}: {context.filter.value}"
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Context Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-lexend">
              <Calendar className="h-4 w-4" />
              Generated: {context.timestamp.toLocaleString()}
            </div>

            <Separator orientation="vertical" className="h-4" />

          </div>

          {/* Summary Section */}
          <DrillDownSummary summary={content.summary} />

          {/* Charts Section */}
          {content.charts && content.charts.length > 0 && (
            <>
              <Separator />
              <DrillDownCharts charts={content.charts} />
            </>
          )}

          {/* Table Section */}
          {content.table && (
            <>
              <Separator />
              <DrillDownTable table={content.table} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
