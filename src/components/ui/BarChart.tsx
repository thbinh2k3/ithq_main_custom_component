import { useState, MouseEvent } from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WidgetContainer } from '../widgets/WidgetGrid';
import {
  WidgetSize,
  widgetBaseStyles,
  widgetHeaderStyles,
  widgetContentStyles,
  responsiveSizeClasses
} from '../widgets/widget-styles';

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
  maxBars?: number;
  className?: string;
  onBarClick?: (dataPoint: BarDataPoint | StackedBarDataPoint, segmentIndex?: number) => void;
  isDrillDownEnabled?: boolean;
}

// 🔹 Helper: chọn màu chữ tương phản với nền (Giữ nguyên logic)
const getTextColorForBackground = (bgColor: string): string => {
  if (bgColor.startsWith("bg-")) {
    if (
      bgColor.includes("-600") ||
      bgColor.includes("-700") ||
      bgColor.includes("-800") ||
      bgColor.includes("-900")
    ) {
      return "text-white";
    }
    return "text-gray-900";
  }

  if (bgColor.startsWith("#") && bgColor.length === 7) {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128 ? "text-white" : "text-gray-900";
  }

  return "text-gray-900";
};

// Tooltip component (Giữ nguyên)
const Tooltip = ({
  show,
  x,
  y,
  content
}: {
  show: boolean;
  x: number;
  y: number;
  content: string;
}) => {
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
    </div>
  );
};

// Bar component
const Bar = ({
  data,
  maxValue,
  orientation,
  showValues,
  onBarClick,
  index
}: {
  data: BarDataPoint;
  maxValue: number;
  orientation: 'vertical' | 'horizontal';
  showValues: boolean;
  onBarClick?: (dataPoint: BarDataPoint | StackedBarDataPoint, segmentIndex?: number) => void;
  index: number;
}) => {
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false, x: 0, y: 0, content: ''
  });

  const percentage = (data.value / maxValue) * 100;
  const isVertical = orientation === 'vertical';
  const threshold = 20; // % tối thiểu để text nằm trong bar
  const isShort = percentage < threshold;

  const handleMouseEnter = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${data.label}: ${data.value?.toLocaleString()}`
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  const handleClick = () => {
    if (onBarClick) onBarClick(data);
  };

  const barColor = data.color || 'bg-ithq-teal-600';

  // 🔴 ĐIỀU CHỈNH: Đặt text value luôn là màu đen (text-gray-900)
  const valueTextColorClass = "text-gray-900";

  // vị trí text đã được chỉnh sửa để sử dụng màu đen cố định và tạo khoảng cách top
  const labelClass = isVertical
    ? isShort
      ? "bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 " + valueTextColorClass // Ngoài bar: màu đen
      // 🔴 SỬA: Đặt top-[2px] để tạo khoảng cách (thay cho bottom-1)
      : "top-[5px] left-1/2 -translate-x-1/2 " + valueTextColorClass
    : isShort
      ? "left-[calc(100%+8px)] top-1/2 -translate-y-1/2 " + valueTextColorClass // Ngoài bar: màu đen
      : "right-2 top-1/2 -translate-y-1/2 " + valueTextColorClass; // Trong bar ngang: màu đen

  return (
    <>
      <div className={cn(
        "group relative",
        isVertical ? "flex flex-col items-center" : "flex items-center gap-3"
      )}>
        <div className={cn(
          "text-xs font-lexend text-gray-600 flex-shrink-0",
          isVertical ? "mb-2 text-center" : "w-20 text-right"
        )}>
          {data.label}
        </div>

        <div className={cn(
          "relative",
          onBarClick && "cursor-pointer",
          isVertical ? "w-12 h-32 bg-gray-100 rounded-t" : "h-6 flex-1 bg-gray-100 rounded-r"
        )}>
          <div
            className={cn(
              barColor,
              "rounded transition-all duration-300 hover:opacity-80",
              isVertical
                ? "w-full absolute bottom-0 rounded-t"
                : "h-full absolute left-0 rounded-r"
            )}
            style={{ [isVertical ? 'height' : 'width']: `${percentage}%` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          />

          {showValues && (
            <div className={cn(
              "absolute text-xs font-lexend font-medium",
              labelClass
            )}>
              {data.value?.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <Tooltip {...tooltip} />
    </>
  );
};

// Stacked bar component
const StackedBar = ({
  data,
  maxValue,
  orientation,
  showValues,
  onBarClick,
  index
}: {
  data: StackedBarDataPoint;
  maxValue: number;
  orientation: 'vertical' | 'horizontal';
  showValues: boolean;
  onBarClick?: (dataPoint: BarDataPoint | StackedBarDataPoint, segmentIndex?: number) => void;
  index: number;
}) => {
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false, x: 0, y: 0, content: ''
  });

  const totalValue = data.segments.reduce((sum, segment) => sum + segment.value, 0);
  const totalPercentage = (totalValue / maxValue) * 100;
  const isVertical = orientation === 'vertical';
  const isShort = totalPercentage < 20;

  const handleSegmentHover = (e: MouseEvent, segment: StackedBarDataPoint['segments'][0]) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${segment.name}: ${segment.value?.toLocaleString()}`
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  return (
    <>
      <div className={cn(
        "group relative",
        isVertical ? "flex flex-col items-center" : "flex items-center gap-3"
      )}>
        <div className={cn(
          "text-xs font-lexend text-gray-600 flex-shrink-0",
          isVertical ? "mb-2 text-center" : "w-20 text-right"
        )}>
          {data.label}
        </div>

        <div className={cn(
          "relative",
          isVertical ? "w-12 h-32 bg-gray-100 rounded-t" : "h-6 flex-1 bg-gray-100 rounded-r"
        )}>
          {data.segments.map((segment, segmentIndex) => {
            const segmentPercentage = (segment.value / totalValue) * totalPercentage;
            const segmentColor = segment.color || `bg-ithq-teal-${600 - segmentIndex * 100}`;

            return (
              <div
                key={segmentIndex}
                className={cn(
                  segmentColor,
                  "absolute transition-all duration-300 hover:opacity-80 cursor-pointer"
                )}
                style={{
                  [isVertical ? 'height' : 'width']: `${segmentPercentage}%`,
                  [isVertical ? 'bottom' : 'left']:
                    data.segments.slice(0, segmentIndex).reduce((sum, s) =>
                      sum + ((s.value / totalValue) * totalPercentage), 0
                    ) + '%'
                }}
                onMouseEnter={(e) => handleSegmentHover(e, segment)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onBarClick && onBarClick(data, segmentIndex)}
              />
            );
          })}

          {showValues && (
            <div className={cn(
              "absolute text-xs font-lexend font-medium",
              isVertical
                ? isShort
                  ? "bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 text-gray-900" // Ngoài bar: màu đen
                  // 🔴 SỬA: Đặt top-[2px] để tạo khoảng cách (thay cho bottom-1/text-black)
                  : "top-[2px] left-1/2 -translate-x-1/2 text-gray-900"
                : isShort
                  ? "left-[calc(100%+8px)] top-1/2 -translate-y-1/2 text-gray-900" // Ngoài bar: màu đen
                  // 🔴 SỬA: Trong bar ngang: màu đen (thay cho text-black)
                  : "right-2 top-1/2 -translate-y-1/2 text-gray-900"
            )}>
              {totalValue?.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <Tooltip {...tooltip} />
    </>
  );
};


export const BarChart = ({
  size = 'half',
  title,
  subtitle,
  data,
  orientation = 'vertical',
  isStacked = false,
  showValues = true,
  showTooltips = true,
  maxBars = 10,
  className,
  onBarClick,
  isDrillDownEnabled = true
}: BarChartProps) => {
  const displayData = data.slice(0, maxBars);

  const maxValue = Math.max(...displayData.map(d =>
    isStacked && 'segments' in d
      ? d.segments.reduce((sum, segment) => sum + segment.value, 0)
      : 'value' in d ? d.value : 0
  ));

  const isInteractive = onBarClick && isDrillDownEnabled;

  return (
    <WidgetContainer
      size={size}
      className={cn(responsiveSizeClasses[size], className)}
    >
      <div className={cn(
        widgetBaseStyles,
        isInteractive && "group relative"
      )}>
        <div className={widgetHeaderStyles}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-ithq-teal-600" />
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

        <div className={widgetContentStyles}>
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-lexend">No data available</p>
            </div>
          ) : (
            <div className={cn(
              "space-y-4",
              orientation === 'vertical'
                ? "flex justify-between items-end h-40" // 👈 SỬA: items-end để căn bar về đáy
                : "space-y-3"
            )}>
              {displayData.map((dataPoint, index) =>
                isStacked && 'segments' in dataPoint ? (
                  <StackedBar
                    key={index}
                    data={dataPoint as StackedBarDataPoint}
                    maxValue={maxValue}
                    orientation={orientation}
                    showValues={showValues}
                    onBarClick={onBarClick}
                    index={index}
                  />
                ) : (
                  <Bar
                    key={index}
                    data={dataPoint as BarDataPoint}
                    maxValue={maxValue}
                    orientation={orientation}
                    showValues={showValues}
                    onBarClick={onBarClick}
                    index={index}
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