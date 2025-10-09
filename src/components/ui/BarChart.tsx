import { useState, MouseEvent } from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WidgetContainer } from '../widgets/WidgetGrid'; // Đã sửa WidgetContainer ở trên
import {
  WidgetSize,
  widgetBaseStyles,
  widgetHeaderStyles,
  widgetContentStyles,
  responsiveSizeClasses
} from '../widgets/widget-styles';

// ================== DATA TYPES ==================
export interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface StackedBarDataPoint {
  label: string;
  segments: {
    name: string;
    value: number;
    color?: string;
    metadata?: Record<string, string | number | boolean>;
  }[];
}

export interface BarChartProps {
  size?: WidgetSize;
  title: string;
  subtitle?: string;
  data: BarDataPoint[] | StackedBarDataPoint[];
  orientation?: 'vertical' | 'horizontal';
  isStacked?: boolean;
  showValues?: boolean;
  showTooltips?: boolean;
  className?: string;
  onBarClick?: (dataPoint: BarDataPoint | StackedBarDataPoint, segmentIndex?: number) => void;
  isDrillDownEnabled?: boolean;
}

// ================== TOOLTIP ==================
const Tooltip = ({ show, x, y, content }: { show: boolean; x: number; y: number; content: string }) => {
  if (!show) return null;
  return (
    <div
      className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
      style={{
        left: x - 10,
        top: y - 40,
        transform: 'translateX(-50%)'
      }}
    >
      {content}
      {/* Tooltip đã được sửa lại vị trí để hiển thị tốt hơn */}
    </div>
  );
};

// ================== BAR ==================
const Bar = ({
  data,
  maxValue,
  orientation,
  showValues,
  onBarClick
}: {
  data: BarDataPoint;
  maxValue: number;
  orientation: 'vertical' | 'horizontal';
  showValues: boolean;
  onBarClick?: (dataPoint: BarDataPoint | StackedBarDataPoint, segmentIndex?: number) => void;
}) => {
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false,
    x: 0,
    y: 0,
    content: ''
  });

  const percentage = (data.value / maxValue) * 100;
  const isVertical = orientation === 'vertical';
  const threshold = 95;
  const isLongEnough = percentage >= threshold;

  const handleMouseEnter = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${data.label}: ${data.value?.toLocaleString()}`
    });
  };

  const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, content: '' });
  const handleClick = () => onBarClick && onBarClick(data);
  const barColor = data.color || 'bg-ithq-teal-600';

  return (
    <>
      <div className={cn("group relative", isVertical ? "flex flex-col items-center h-full" : "flex items-center gap-3")}>
        <div className={cn("text-xs font-lexend text-gray-600 flex-shrink-0", isVertical ? "mb-2 text-center" : "w-20 text-right")}>
          {data.label}
        </div>

        <div className={cn(
          "relative",
          onBarClick && "cursor-pointer",
          isVertical
            ? "w-12 flex-1 bg-gray-100 rounded-t"
            : "min-h-[3rem] h-full flex-1 bg-gray-100 rounded-r"
        )}>
          <div
            className={cn(
              barColor,
              "transition-all duration-300 hover:opacity-80",
              isVertical ? "w-full absolute bottom-0 rounded-t" : "h-full absolute left-0 rounded-r"
            )}
            style={{ [isVertical ? 'height' : 'width']: `${percentage}%` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          />

          {showValues && (
            <div
              className={cn(
                "absolute text-xs font-lexend font-medium",
                isVertical
                  ? (isLongEnough
                    ? "top-1 left-1/2 -translate-x-1/2"
                    : "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2")
                  : "right-2 top-1/2 -translate-y-1/2",
                isLongEnough ? "text-white" : "text-gray-900"
              )}
            >
              {data.value?.toLocaleString()}
            </div>
          )}
        </div>
      </div>
      <Tooltip {...tooltip} />
    </>
  );
};

// ================== STACKED BAR ==================
const StackedBar = ({
  data,
  maxValue,
  orientation,
  showValues,
  onBarClick
}: {
  data: StackedBarDataPoint;
  maxValue: number;
  orientation: 'vertical' | 'horizontal';
  showValues: boolean;
  onBarClick?: (dataPoint: BarDataPoint | StackedBarDataPoint, segmentIndex?: number) => void;
}) => {
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false,
    x: 0,
    y: 0,
    content: ''
  });

  const totalValue = data.segments.reduce((sum, segment) => sum + segment.value, 0);
  const totalPercentage = (totalValue / maxValue) * 100;
  const isVertical = orientation === 'vertical';
  const threshold = 95;
  const isLongEnough = totalPercentage >= threshold;

  const handleSegmentHover = (e: MouseEvent, segment: StackedBarDataPoint['segments'][0]) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${segment.name}: ${segment.value?.toLocaleString()}`
    });
  };

  const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, content: '' });

  return (
    <>
      <div className={cn("group relative", isVertical ? "flex flex-col items-center h-full" : "flex items-center gap-3")}>
        <div className={cn("text-xs font-lexend text-gray-600 flex-shrink-0", isVertical ? "mb-2 text-center" : "w-20 text-right")}>
          {data.label}
        </div>

        <div className={cn(
          "relative",
          isVertical ? "w-12 flex-1 bg-gray-100 rounded-t" : "h-10 flex-1 bg-gray-100 rounded-r"
        )}>
          {data.segments.map((segment, segmentIndex) => {
            const segmentRelativePercentage = (segment.value / totalValue) * 100;
            const segmentPercentage = (segment.value / maxValue) * 100;
            const segmentColor = segment.color || `bg-ithq-teal-${600 - segmentIndex * 100}`;
            const isLastSegment = segmentIndex === data.segments.length - 1;
            const segmentRoundedClass = isLastSegment ? (isVertical ? "rounded-t" : "rounded-r") : "";

            const offsetPercentage = data.segments.slice(0, segmentIndex).reduce((sum, s) =>
              sum + ((s.value / maxValue) * 100), 0
            );

            return (
              <div
                key={segmentIndex}
                className={cn(
                  segmentColor,
                  "absolute transition-all duration-300 hover:opacity-80 cursor-pointer",
                  segmentRoundedClass
                )}
                style={{
                  [isVertical ? 'height' : 'width']: `${segmentPercentage}%`,
                  [isVertical ? 'bottom' : 'left']: `${offsetPercentage}%`
                }}
                onMouseEnter={(e) => handleSegmentHover(e, segment)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onBarClick && onBarClick(data, segmentIndex)}
              />
            );
          })}

          {showValues && (
            <div
              className={cn(
                "absolute text-xs font-lexend font-medium",
                isVertical
                  ? (isLongEnough
                    ? "top-1 left-1/2 -translate-x-1/2"
                    : "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2")
                  : "right-2 top-1/2 -translate-y-1/2",
                isLongEnough ? "text-white" : "text-gray-900"
              )}
            >
              {totalValue?.toLocaleString()}
            </div>
          )}
        </div>
      </div>
      <Tooltip {...tooltip} />
    </>
  );
};

// ================== MAIN CHART ==================
export const BarChart = ({
  size = 'half',
  title,
  subtitle,
  data,
  orientation = 'vertical',
  isStacked,
  showValues = true,
  showTooltips = true,
  className,
  onBarClick,
  isDrillDownEnabled = true
}: BarChartProps) => {

  const autoIsStacked = Array.isArray(data) && data.length > 0 && 'segments' in data[0];
  const useStacked = isStacked ?? autoIsStacked;

  const displayData = data;

  const maxValue = Math.max(...displayData.map(d =>
    'segments' in d ? d.segments.reduce((sum, s) => sum + s.value, 0) : 'value' in d ? d.value : 0
  ));
  const isInteractive = onBarClick && isDrillDownEnabled;

  return (
    <WidgetContainer size={size} className={cn(responsiveSizeClasses[size], className)}>
      <div className={cn(widgetBaseStyles, isInteractive && "group relative")}>
        <div className={cn(widgetHeaderStyles, "**border-b border-gray-200**",
          "p-6 rounded-t-2xl")}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-ithq-teal-600" />
            <h3 className="text-lg font-poppins font-semibold text-gray-900">{title}</h3>
          </div>
          {subtitle && <p className="text-sm text-gray-600 font-lexend">{subtitle}</p>}
        </div>

        <div className={cn(widgetContentStyles, "flex-1 flex flex-col")}>
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-lexend">No data available</p>
            </div>
          ) : (
            <div className={cn(
              "flex-1",
              orientation === 'vertical'
                ? "flex justify-between items-end min-h-[12rem]"
                : "flex flex-col justify-between gap-1 min-h-[16em]"
            )}>
              {displayData.map((dataPoint, index) =>
                useStacked && 'segments' in dataPoint ? (
                  <StackedBar
                    key={index}
                    data={dataPoint as StackedBarDataPoint}
                    maxValue={maxValue}
                    orientation={orientation}
                    showValues={showValues}
                    onBarClick={onBarClick}
                  />
                ) : (
                  <Bar
                    key={index}
                    data={dataPoint as BarDataPoint}
                    maxValue={maxValue}
                    orientation={orientation}
                    showValues={showValues}
                    onBarClick={onBarClick}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </WidgetContainer>
  );
};