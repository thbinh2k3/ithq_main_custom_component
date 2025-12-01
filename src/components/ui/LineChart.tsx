import { useState, MouseEvent, useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
//import ''

// Dù các styles gốc bị loại bỏ, tôi giữ lại định nghĩa cn đơn giản vì nó vẫn được sử dụng.
// Các classes như widgetBaseStyles, widgetHeaderStyles, v.v. đã được thay thế bằng cấu trúc div/class cứng trong file chỉnh sửa, tôi sẽ giữ cấu trúc đó.
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface LineDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface LineChartProps {
  size?: 'quarter' | 'half' | 'three-quarters' | 'full';
  title: string;
  subtitle?: string;
  data: LineDataPoint[];
  multiLine?: {
    [seriesName: string]: LineDataPoint[];
  };
  showArea?: boolean;
  showPoints?: boolean;
  timeFormat?: 'date' | 'datetime' | 'time';
  valueFormatter?: (value: number) => string;
  className?: string;
  onPointClick?: (dataPoint: LineDataPoint, seriesName?: string) => void;
  onRangeSelect?: (startDate: string, endDate: string) => void;
  isDrillDownEnabled?: boolean;
}

// Format timestamp based on timeFormat prop
const formatTimestamp = (timestamp: string, format: 'date' | 'datetime' | 'time') => {
  const date = new Date(timestamp);

  switch (format) {
    case 'date':
      return date.toLocaleDateString();
    case 'time':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'datetime':
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    default:
      return date.toLocaleDateString();
  }
};

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
  const padding = 18; // khoảng cách tối thiểu với mép
  const screenWidth = window.innerWidth;
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


// Line chart SVG component
const LineChartSVG = ({
  data,
  multiLine,
  showArea,
  showPoints,
  timeFormat,
  valueFormatter,
  onPointClick,
  containerWidth,
  containerHeight
}: {
  data: LineDataPoint[];
  multiLine?: { [seriesName: string]: LineDataPoint[] };
  showArea: boolean;
  showPoints: boolean;
  timeFormat: 'date' | 'datetime' | 'time';
  valueFormatter?: (value: number) => string;
  onPointClick?: (dataPoint: LineDataPoint, seriesName?: string) => void;
  containerWidth: number;
  containerHeight: number;
}) => {
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false, x: 0, y: 0, content: ''
  });

  const width = Math.max(containerWidth - 40, 200);
  const height = Math.max(containerHeight - 40, 150);

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Get all data points for scaling
  const allDataPoints = multiLine
    ? Object.values(multiLine).flat()
    : data;

  const allValues = allDataPoints.map(d => d.value);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  // Time scaling
  const allTimestamps = allDataPoints.map(d => new Date(d.timestamp).getTime());
  const minTime = Math.min(...allTimestamps);
  const maxTime = Math.max(...allTimestamps);
  const timeRange = maxTime - minTime || 1;

  // Convert data point to SVG coordinates
  const getPointCoords = (point: LineDataPoint) => {
    const x = ((new Date(point.timestamp).getTime() - minTime) / timeRange) * chartWidth + padding;
    const y = height - (((point.value - minValue) / valueRange) * chartHeight + padding);
    return { x, y };
  };

  // Generate path string for line
  const generateLinePath = (lineData: LineDataPoint[]) => {
    if (lineData.length === 0) return '';

    const sortedData = [...lineData].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const pathCommands = sortedData.map((point, index) => {
      const { x, y } = getPointCoords(point);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    return pathCommands.join(' ');
  };

  // Generate area path string
  const generateAreaPath = (lineData: LineDataPoint[]) => {
    if (lineData.length === 0) return '';

    const linePath = generateLinePath(lineData);
    const sortedData = [...lineData].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (sortedData.length === 0) return '';

    const firstPoint = getPointCoords(sortedData[0]);
    const lastPoint = getPointCoords(sortedData[sortedData.length - 1]);

    return `${linePath} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
  };

  const handlePointClick = (point: LineDataPoint, seriesName?: string) => {
    if (onPointClick) {
      onPointClick(point, seriesName);
    }
  };

  const handlePointHover = (e: MouseEvent, point: LineDataPoint, seriesName?: string) => {
    const formattedValue = valueFormatter ? valueFormatter(point.value) : point.value.toLocaleString();
    const seriesLabel = seriesName ? ` (${seriesName})` : '';
    const formattedTime = formatTimestamp(point.timestamp, timeFormat);

    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      content: `${formattedTime}: ${formattedValue}${seriesLabel}`
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  // KHÔI PHỤC: Sử dụng các lớp màu Tailwind CSS tùy chỉnh cho LineChartSVG
  const colors = [
    'text-ithq-teal-600',
    'text-ithq-orange-600',
    'text-ithq-yellow-600',
    'text-blue-600',
    'text-purple-600',
    'text-green-600'
  ];

  const fillColors = [
    'fill-ithq-teal-500', // Dùng 500 cho fill, 600 cho line/point theo file gốc
    'fill-ithq-orange-600',
    'fill-ithq-yellow-600',
    'fill-blue-600',
    'fill-purple-600',
    'fill-green-600'
  ];

  const renderSingleLine = () => {
    const linePath = generateLinePath(data);
    const areaPath = generateAreaPath(data);

    return (
      <g>
        {/* Area fill - KHÔI PHỤC: fill-ithq-teal-500 opacity-20 */}
        {showArea && (
          <path
            d={areaPath}
            className="fill-ithq-teal-500 opacity-20"
          />
        )}

        {/* Line - KHÔI PHỤC: text-ithq-teal-600 */}
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ithq-teal-600"
        />

        {/* Points - KHÔI PHỤC: text-ithq-teal-600 */}
        {showPoints && data.map((point, index) => {
          const { x, y } = getPointCoords(point);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="currentColor"
              className="text-ithq-teal-600 cursor-pointer hover:r-6 transition-all"
              onClick={() => handlePointClick(point)}
              onMouseEnter={(e) => handlePointHover(e, point)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </g>
    );
  };

  const renderMultiLine = () => {
    return (
      <g>
        {Object.entries(multiLine!).map(([seriesName, seriesData], seriesIndex) => {
          const linePath = generateLinePath(seriesData);
          const colorClass = colors[seriesIndex % colors.length];
          // const fillClass = fillColors[seriesIndex % fillColors.length]; // Không sử dụng vì chỉ series 0 có area

          return (
            <g key={seriesName}>
              {/* Area fill for first series only - KHÔI PHỤC: sử dụng fillClass và opacity */}
              {showArea && seriesIndex === 0 && (
                <path
                  d={generateAreaPath(seriesData)}
                  className={`${fillColors[0]} opacity-20`} // Chỉ dùng fill-ithq-teal-500 cho series 0
                />
              )}

              {/* Line - KHÔI PHỤC: sử dụng colorClass */}
              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={colorClass}
              />

              {/* Points - KHÔI PHỤC: sử dụng colorClass */}
              {showPoints && seriesData.map((point, pointIndex) => {
                const { x, y } = getPointCoords(point);
                return (
                  <circle
                    key={`${seriesName}-${pointIndex}`}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="currentColor"
                    className={`${colorClass} cursor-pointer hover:r-5 transition-all`}
                    onClick={() => handlePointClick(point, seriesName)}
                    onMouseEnter={(e) => handlePointHover(e, point, seriesName)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          {/* Grid lines (Giữ nguyên) */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" opacity="0.5" />

        {/* Chart content */}
        {multiLine ? renderMultiLine() : renderSingleLine()}

        {/* Axes (Giữ nguyên) */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d1d5db"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#d1d5db"
          strokeWidth="2"
        />
      </svg>

      <Tooltip {...tooltip} />
    </>
  );
};

export const LineChart = ({
  size = 'half',
  title,
  subtitle,
  data,
  multiLine,
  showArea = true,
  showPoints = true,
  timeFormat = 'date',
  valueFormatter,
  className,
  onPointClick,
  onRangeSelect,
  isDrillDownEnabled = true
}: LineChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const hasData = data.length > 0 || (multiLine && Object.keys(multiLine).length > 0);

  // KHÔI PHỤC: Các lớp màu Tailwind CSS tùy chỉnh cho Legend
  const legendColors = ['bg-ithq-teal-600', 'bg-ithq-orange-600', 'bg-ithq-yellow-600', 'bg-blue-600', 'bg-purple-600', 'bg-green-600'];

  return (
    // Giữ nguyên cấu trúc/class của widget container
    <div className={cn("w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm", className)}>
      <div className="h-full flex flex-col p-6">

        {/* Header - Ở trên cùng */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center gap-2 mb-2">
            {/* KHÔI PHỤC: class màu Tailwind cho icon */}
            <TrendingUp className="h-5 w-5 text-ithq-teal-600" />
            {/* KHÔI PHỤC: font-poppins và font-semibold */}
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          {subtitle && (
            // KHÔI PHỤC: font-lexend
            <p className="text-sm text-gray-600 font-lexend">
              {subtitle}
            </p>
          )}
        </div>

        {/* Chart Content - Ở giữa, chiếm không gian còn lại (flex-1) */}
        <div ref={containerRef} className="flex-1 min-h-0">
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
              <div>
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                {/* KHÔI PHỤC: font-lexend */}
                <p className="text-sm font-lexend">No trend data available</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LineChartSVG
                data={data}
                multiLine={multiLine}
                showArea={showArea}
                showPoints={showPoints}
                timeFormat={timeFormat}
                valueFormatter={valueFormatter}
                onPointClick={onPointClick}
                containerWidth={dimensions.width}
                containerHeight={dimensions.height}
              />
            </div>
          )}
        </div>

        {/* Legend - Di chuyển xuống dưới cùng của flex container */}
        {multiLine && (
          // Đảm bảo div này không co lại khi không cần thiết, và tạo khoảng cách
          <div className="w-full flex-shrink-0 mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {Object.keys(multiLine).map((seriesName, index) => {
                const colorClass = legendColors[index % legendColors.length];

                return (
                  <div key={seriesName} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", colorClass)} />
                    <span className="text-xs font-lexend text-gray-600">{seriesName}</span>
                  </div>
                );
              })}
            </div>
            {/* Đã loại bỏ divider cũ, thay bằng border-t trên div cha và pt-4 */}
          </div>
        )}

      </div>
    </div>
  );
};