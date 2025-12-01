import { useState, MouseEvent } from 'react';
import { ExternalLink, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WidgetContainer } from '../widgets/WidgetGrid';
import { widgetBaseStyles, widgetHeaderStyles, widgetContentStyles } from '../widgets/widget-styles';

export interface PieDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface PieChartProps {
  size?: 'quarter' | 'half' | 'full';
  title: string;
  subtitle?: string;
  data: PieDataPoint[];
  variant?: 'pie' | 'doughnut';
  showPercentages?: boolean;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
  onSliceClick?: (dataPoint: PieDataPoint) => void;
  isDrillDownEnabled?: boolean;
}

// Tooltip component (Không thay đổi)
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

  const padding = 8;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const tooltipWidth = 150;

  let left = x;
  let transform = "translateX(-50%)";

  if (x - tooltipWidth / 2 < padding) {
    left = padding;
    transform = "translateX(0)";
  } else if (x + tooltipWidth / 2 > screenWidth - padding) {
    left = screenWidth - padding;
    transform = "translateX(-100%)";
  }

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
      style={{
        left,
        top: y - 40,
        transform
      }}
    >
      {content}
    </div>
  );
};

// Pie chart SVG component (Không thay đổi)
const PieChartSVG = ({
  data,
  variant,
  onSliceClick,
  size = 200,
  showPercentages = true
}: {
  data: PieDataPoint[];
  variant: 'pie' | 'doughnut';
  onSliceClick?: (dataPoint: PieDataPoint) => void;
  size?: number;
  showPercentages?: boolean;
}) => {
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false, x: 0, y: 0, content: ''
  });
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const radius = size / 2;
  const innerRadius = variant === 'doughnut' ? radius * 0.5 : 0;
  const centerX = size / 2;
  const centerY = size / 2;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const dataWithAngles = data.map((item, index) => {
    const percentage = total === 0 ? 0 : (item.value / total) * 100;
    return {
      ...item,
      percentage,
      startAngle: 0,
      endAngle: 0,
      index
    };
  });

  let cumulativeAngle = 0;
  dataWithAngles.forEach((item) => {
    item.startAngle = cumulativeAngle;
    item.endAngle = cumulativeAngle + (item.percentage / 100) * 2 * Math.PI;
    cumulativeAngle = item.endAngle;
  });

  const defaultColors = [
    '#007D8E',
    '#F46235',
    '#FFB000',
    '#10B981',
    '#8B5CF6',
    '#F59E0B',
    '#EF4444',
    '#3B82F6',
  ];

  const createPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
    let endAngleToUse = endAngle;

    if (Math.abs(endAngle - startAngle - 2 * Math.PI) < 1e-6) {
      endAngleToUse = startAngle + 2 * Math.PI - 0.0001;
    }

    const startAngleRadians = startAngle - Math.PI / 2;
    const endAngleRadians = endAngleToUse - Math.PI / 2;

    const x1 = centerX + outerRadius * Math.cos(startAngleRadians);
    const y1 = centerY + outerRadius * Math.sin(startAngleRadians);
    const x2 = centerX + outerRadius * Math.cos(endAngleRadians);
    const y2 = centerY + outerRadius * Math.sin(endAngleRadians);

    const largeArcFlag = endAngleToUse - startAngle > Math.PI ? 1 : 0;

    if (innerRadius === 0) {
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    } else {
      const x3 = centerX + innerRadius * Math.cos(startAngleRadians);
      const y3 = centerY + innerRadius * Math.sin(startAngleRadians);
      const x4 = centerX + innerRadius * Math.cos(endAngleRadians);
      const y4 = centerY + innerRadius * Math.sin(endAngleRadians);

      return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3} Z`;
    }
  };

  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2 - Math.PI / 2;
    const labelRadius = variant === 'doughnut' ? (radius + innerRadius) / 2 : radius * 0.7;

    return {
      x: centerX + labelRadius * Math.cos(midAngle),
      y: centerY + labelRadius * Math.sin(midAngle)
    };
  };

  const handleSliceClick = (dataPoint: PieDataPoint) => {
    if (onSliceClick) {
      onSliceClick(dataPoint);
    }
  };

  const handleSliceHover = (e: MouseEvent, dataPoint: PieDataPoint, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${dataPoint.label}: ${dataPoint.value.toLocaleString()} (${dataPoint.percentage?.toFixed(1)}%)`
    });
    setHoveredSlice(index);
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
    setHoveredSlice(null);
  };

  return (
    <>
      <svg viewBox={`0 0 ${size} ${size}`} className="overflow-visible w-full h-full">
        {dataWithAngles.map((slice, index) => {
          if (slice.percentage === 0) return null;

          const color = slice.color || defaultColors[index % defaultColors.length];
          const isHovered = hoveredSlice === index;
          const currentRadius = isHovered ? radius + 5 : radius;

          const path = createPath(slice.startAngle, slice.endAngle, currentRadius, innerRadius);
          const labelPos = getLabelPosition(slice.startAngle, slice.endAngle);

          const activeSlices = dataWithAngles.filter(d => d.percentage > 0);
          const isSingleSlice = activeSlices.length === 1;

          const shouldShowPercentageLabel = showPercentages && (slice.percentage >= 5 || isSingleSlice);

          return (
            <g key={index}>
              <path
                d={path}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  isHovered && "drop-shadow-md"
                )}
                onClick={() => handleSliceClick(slice)}
                onMouseEnter={(e) => handleSliceHover(e, slice, index)}
                onMouseLeave={handleMouseLeave}
              />

              {shouldShowPercentageLabel && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-white pointer-events-none"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {slice.percentage.toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <Tooltip {...tooltip} />
    </>
  );
};

// Legend component
const Legend = ({
  data,
  onItemClick
}: {
  data: PieDataPoint[];
  onItemClick?: (dataPoint: PieDataPoint) => void;
}) => {
  const defaultColors = [
    '#007D8E', '#F46235', '#FFB000', '#10B981',
    '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6'
  ];

  return (
    // THAY ĐỔI 1: Tăng khoảng cách lưới từ gap-2 thành **gap-4**
    <div className="grid grid-cols-2 gap-2 max-h-full">
      {data.map((item, index) => {
        if (item.value === 0) return null;

        const color = item.color || defaultColors[index % defaultColors.length];

        return (
          <div
            key={index}
            // THAY ĐỔI 2: Tăng padding từ p-1 thành **p-2**
            className={cn(
              "flex items-center justify-between gap-2 mb-1 rounded-lg transition-colors",
              onItemClick && "cursor-pointer hover:bg-gray-50"
            )}
            onClick={() => onItemClick && onItemClick(item)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-lexend text-gray-700 truncate">
                {item.label}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-sm font-poppins font-semibold text-gray-900">
                {item.value.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">
                {item.percentage?.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Main PieChart component
export const PieChart = ({
  size = 'half',
  title,
  subtitle,
  data,
  variant = 'doughnut',
  showPercentages = true,
  showLegend = true,
  centerLabel,
  centerValue,
  className,
  onSliceClick,
  isDrillDownEnabled = true
}: PieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: total === 0 ? 0 : (item.value / total) * 100
  }));

  const isInteractive = onSliceClick && isDrillDownEnabled;

  return (
    <WidgetContainer size={size} className={className}>
      <div className={cn(
        widgetBaseStyles,
        isInteractive && "group relative"
      )}>

        <div className={widgetHeaderStyles}>
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="h-5 w-5 text-ithq-teal-600" />
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          {subtitle &&
            <p
              className="text-xs font-medium"
              style={{
                color: '#586060',
                fontFamily: `'Lexend Deca', sans-serif`
              }}
            >
              {subtitle}
            </p>
          }
        </div>

        <div className={cn(widgetContentStyles, "min-h-0", "h-full")}>
          {data.length === 0 || total === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-lexend">No data available</p>
            </div>
          ) : (
            <div className={cn(
              "flex gap-4 w-full h-full min-h-0",
              "flex-col items-center justify-start"
            )}>

              {/* Chart container (Phần trên) - Giữ nguyên flex-shrink-0 để Chart luôn giữ kích thước 180px */}
              <div className={cn(
                "flex items-center justify-center",
                "w-full flex-shrink-0"
              )}>

                <div className="relative aspect-square w-[180px] flex-shrink-0">
                  <PieChartSVG
                    data={dataWithPercentages}
                    variant={variant}
                    onSliceClick={onSliceClick}
                    size={200}
                    showPercentages={showPercentages}
                  />

                  {variant === 'doughnut' && (centerLabel || centerValue) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      {centerLabel && (
                        <div className="text-xs font-lexend text-gray-600 text-center">
                          {centerLabel}
                        </div>
                      )}
                      {centerValue && (
                        <div className="text-lg font-poppins font-bold text-gray-900 text-center">
                          {typeof centerValue === 'number' ? centerValue.toLocaleString() : centerValue}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend container (Phần dưới) - Không giới hạn chiều cao */}
              {showLegend && (
                <div className={cn(
                  "w-full mt-4",
                  size === 'quarter'
                    ? "w-full flex-shrink-0"
                    : "min-h-0"
                )}>
                  <Legend data={dataWithPercentages} onItemClick={onSliceClick} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </WidgetContainer>
  );
};