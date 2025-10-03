import { useState, MouseEvent } from 'react';
import { ExternalLink, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WidgetContainer } from '../widgets/WidgetGrid';
import { WidgetSize, widgetBaseStyles, widgetHeaderStyles, widgetContentStyles, drillDownIndicatorStyles } from '../widgets/widget-styles';

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

// Tooltip component
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

  // Giới hạn tooltip trong màn hình
  const padding = 8; // khoảng cách tối thiểu với mép
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024; // Thêm check window
  const tooltipWidth = 150; // ước lượng width tooltip (px)

  let left = x;
  let transform = "translateX(-50%)";

  if (x - tooltipWidth / 2 < padding) {
    // Nếu tooltip vượt bên trái
    left = padding;
    transform = "translateX(0)";
  } else if (x + tooltipWidth / 2 > screenWidth - padding) {
    // Nếu tooltip vượt bên phải
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


// Pie chart SVG component
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

  // Calculate percentages and cumulative angles
  const dataWithAngles = data.map((item, index) => {
    const percentage = total === 0 ? 0 : (item.value / total) * 100; // Ngăn chia cho 0
    return {
      ...item,
      percentage,
      startAngle: 0,
      endAngle: 0,
      index
    };
  });

  // Calculate cumulative angles
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

  // Create path for pie slice
  const createPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
    const startAngleRadians = startAngle - Math.PI / 2;
    const endAngleRadians = endAngle - Math.PI / 2;

    const x1 = centerX + outerRadius * Math.cos(startAngleRadians);
    const y1 = centerY + outerRadius * Math.sin(startAngleRadians);
    const x2 = centerX + outerRadius * Math.cos(endAngleRadians);
    const y2 = centerY + outerRadius * Math.sin(endAngleRadians);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

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

  // Calculate label position
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
          const color = slice.color || defaultColors[index % defaultColors.length];
          const isHovered = hoveredSlice === index;
          const currentRadius = isHovered ? radius + 5 : radius;

          const path = createPath(slice.startAngle, slice.endAngle, currentRadius, innerRadius);
          const labelPos = getLabelPosition(slice.startAngle, slice.endAngle);

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

              {showPercentages && slice.percentage >= 5 && (
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
    <div className="space-y-2">
      {data.map((item, index) => {
        const color = item.color || defaultColors[index % defaultColors.length];

        return (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between gap-3 p-2 rounded-lg transition-colors",
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
  const chartSize = size === 'quarter' ? 150 : 200;

  return (
    // Giữ nguyên cấu trúc
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
          {subtitle && (
            <p className="text-sm text-gray-600 font-lexend">
              {subtitle}
            </p>
          )}
        </div>

        <div className={widgetContentStyles}>
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-lexend">No data available</p>
            </div>
          ) : (
            <div className={cn(
              "flex gap-6 w-full h-full",
              size === 'quarter' ? "flex-col items-center" : "items-center"
            )}>
              <div className="relative flex-shrink-0" style={{ width: chartSize, height: chartSize }}>
                <PieChartSVG
                  data={dataWithPercentages}
                  variant={variant}
                  onSliceClick={onSliceClick}
                  size={chartSize}
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

              {showLegend && (
                <div className="flex-1 min-w-0">
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