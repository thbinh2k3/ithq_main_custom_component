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

// ================== DATA TYPES (Giữ nguyên) ==================
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
  // Props mới cho Trục giá trị
  showYAxis?: boolean;
  showXAxis?: boolean;
  yAxisUnit?: string;
}

const SERIES_COLORS = [
  '#007D8E', '#F46235', '#FFB000', '#28627B', '#40A4B1',
  '#F6815A', '#375623', '#997300', '#264478', '#843C0C',
];

// ================== HELPER FUNCTIONS ==================
const calculateYAxisTicks = (rawMaxValue: number, tickCount = 5) => {
  const maxVal = Math.max(1, rawMaxValue);
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  let roundedMax = Math.ceil(maxVal / magnitude) * magnitude;

  if (roundedMax - maxVal < 0.1 * roundedMax) {
    roundedMax += magnitude;
  }

  const step = roundedMax / (tickCount - 1);

  const tickValues = Array.from({ length: tickCount }, (_, i) => {
    const value = i * step;
    const factor = 10 ** Math.max(0, Math.floor(Math.log10(magnitude)) - 1);
    const roundedValue = Math.round(value / factor) * factor;
    return parseFloat(roundedValue.toFixed(2));
  });

  tickValues[tickCount - 1] = roundedMax;

  return {
    tickValues,
    roundedMax,
    step
  };
};

const formatValue = (value: number) => {
  return value.toLocaleString();
};


// ================== TOOLTIP & VALUE AXIS ==================
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
    </div>
  );
};

interface ValueAxisProps {
  orientation: 'vertical' | 'horizontal';
  tickValues: number[];
  maxValue: number;
  unit?: string;
  showAxis: boolean;
}

const ValueAxis = ({ orientation, tickValues, maxValue, unit, showAxis }: ValueAxisProps) => {
  if (!showAxis) return null;

  const isVertical = orientation === 'vertical';

  if (isVertical) {
    // Trục Y (Dọc)
    const verticalTransformStyle = 'translateY(-12px)';

    return (
      <div className="relative h-full w-full flex flex-col-reverse pr-2 pointer-events-none">
        {tickValues.map((value, index) => {
          const isZeroTick = index === 0;

          return (
            <div
              key={`y-tick-${index}`}
              className="relative"
              style={{
                height: index === 0 ? '0' : `${100 / (tickValues.length - 1)}%`,
              }}
            >
              {/* Đường lưới ngang */}
              {index > 0 && (
                <div
                  className="absolute w-full h-[1px] bg-gray-200 right-[-8px] top-0"
                  style={{ width: `calc(100% + 8px)` }}
                />
              )}

              {/* Nhãn giá trị và đơn vị */}
              <div
                className={cn(
                  "absolute right-0 text-xs font-lexend text-gray-500 whitespace-nowrap text-right",
                  isZeroTick ? "bottom-0" : "top-0"
                )}
                style={{
                  transform: isZeroTick ? 'none' : verticalTransformStyle,
                }}
              >
                <span className="block text-gray-700 font-medium leading-none">
                  {isZeroTick ? 0 : value.toLocaleString()}
                </span>
                {unit && (
                  <span className="block text-gray-500 text-[10px] mt-1 leading-none">
                    {unit}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Trục X (Ngang) - Đặt dưới cùng
  return (
    <div
      className="absolute inset-x-0 bottom-[-2.25rem] h-8 flex justify-between items-start pt-2 text-xs font-lexend text-gray-500"
      style={{ marginLeft: '6rem' }}
    >
      {tickValues.map((value, index) => {
        const isLastTick = index === tickValues.length - 1;
        const position = `${(value / maxValue) * 100}%`;

        let transformStyle = 'translateX(-50%)';
        if (isLastTick) {
          transformStyle = 'translateX(-100%)';
        }

        return (
          <div
            key={`x-tick-${index}`}
            className="absolute"
            style={{
              left: position,
              transform: transformStyle,
            }}
          >
            {value.toLocaleString()}
            <div className="absolute top-[-0.5rem] left-1/2 -translate-x-1/2 w-[1px] h-1 bg-gray-300" />
          </div>
        );
      })}
    </div>
  );
};

// ================== BAR (CỘT ĐƠN) ==================
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

  const safeMaxValue = maxValue === 0 ? 1 : maxValue;
  const percentage = (data.value / safeMaxValue) * 100;
  const isVertical = orientation === 'vertical';
  const threshold = 95;
  const isLongEnough = percentage >= threshold;

  const handleMouseEnter = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${data.label}: ${formatValue(data.value)}`
    });
  };

  const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, content: '' });
  const handleClick = () => onBarClick && onBarClick(data);
  const barColor = data.color || 'bg-ithq-teal-600';

  return (
    <>
      <div className={cn("group relative", isVertical ? "flex flex-col items-center h-full min-w-[8rem]" : "flex items-center gap-3")}>

        {/* VỊ TRÍ 1: Cột biểu đồ */}
        <div className={cn(
          "relative",
          onBarClick && "cursor-pointer",
          // Dùng flex-1 để thanh ngang kéo dài hết mức
          isVertical
            ? "w-12 flex-1 bg-gray-100 rounded-t"
            : "h-10 flex-1 bg-gray-100 rounded-r"
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
                "absolute text-xs font-lexend font-medium z-10",
                isVertical
                  ? (isLongEnough
                    ? "top-1 left-1/2 -translate-x-1/2 text-white"
                    : "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 text-gray-900")
                  : (isLongEnough
                    ? "right-2 top-1/2 -translate-y-1/2 text-white"
                    : "right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+6px)] text-gray-900") // Đẩy ra ngoài
              )}
            >
              {formatValue(data.value)}
            </div>
          )}
        </div>

        {/* VỊ TRÍ 2: Label (Tên danh mục) */}
        <div className={cn("text-xs font-lexend text-gray-600 flex-shrink-0", isVertical ? "mt-2 text-center w-[8rem]" : "w-20 text-right")}>
          {data.label}
        </div>
      </div>
      <Tooltip {...tooltip} />
    </>
  );
};

// ================== STACKED BAR (CỘT XẾP CHỒNG) ==================
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

  const safeMaxValue = maxValue === 0 ? 1 : maxValue;
  const totalValue = data.segments.reduce((sum, segment) => sum + segment.value, 0);
  const totalPercentage = (totalValue / safeMaxValue) * 100;
  const isVertical = orientation === 'vertical';
  const threshold = 95;
  const isLongEnough = totalPercentage >= threshold;

  const handleSegmentHover = (e: MouseEvent, segment: StackedBarDataPoint['segments'][0]) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${segment.name}: ${formatValue(segment.value)}`
    });
  };

  const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, content: '' });

  // Tính toán lại màu sắc dựa trên SERIES_COLORS
  let cumulativeOffset = 0;

  return (
    <>
      <div className={cn("group relative", isVertical ? "flex flex-col items-center h-full min-w-[8rem]" : "flex items-center gap-3")}>

        {/* VỊ TRÍ 1: Cột biểu đồ */}
        <div className={cn(
          "relative",
          isVertical ? "w-12 flex-1 bg-gray-100 rounded-t" : "h-10 flex-1 bg-gray-100 rounded-r"
        )}>
          {data.segments.map((segment, segmentIndex) => {
            const segmentValue = segment.value;
            const segmentPercentage = (segmentValue / safeMaxValue) * 100;

            const segmentColor = segment.color || SERIES_COLORS[segmentIndex % SERIES_COLORS.length];
            const isLastSegment = segmentIndex === data.segments.length - 1;
            const segmentRoundedClass = isLastSegment ? (isVertical ? "rounded-t" : "rounded-r") : "";

            const offsetPercentage = (cumulativeOffset / safeMaxValue) * 100;
            cumulativeOffset += segmentValue;

            // Bỏ qua phân đoạn có giá trị 0
            if (segmentValue === 0) return null;

            return (
              <div
                key={segmentIndex}
                className={cn(
                  `bg-[${segmentColor}]`, // Dùng CSS Variable hoặc kiểu inline cho màu
                  "absolute transition-all duration-300 hover:opacity-80 cursor-pointer",
                  segmentRoundedClass
                )}
                style={{
                  backgroundColor: segmentColor, // Áp dụng màu sắc cụ thể
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
                "absolute text-xs font-lexend font-medium z-10",
                isVertical
                  ? (isLongEnough
                    ? "top-1 left-1/2 -translate-x-1/2 text-white"
                    : "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 text-gray-900")
                  : (isLongEnough
                    ? "right-2 top-1/2 -translate-y-1/2 text-white"
                    : "right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+6px)] text-gray-900")
              )}
            >
              {formatValue(totalValue)}
            </div>
          )}
        </div>

        {/* VỊ TRÍ 2: Label (Tên danh mục) */}
        <div className={cn("text-xs font-lexend text-gray-600 flex-shrink-0", isVertical ? "mt-2 text-center w-[8rem]" : "w-20 text-right")}>
          {data.label}
        </div>
      </div>
      <Tooltip {...tooltip} />
    </>
  );
};
// ================== MAIN CHART COMPONENT ==================
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
  isDrillDownEnabled = true,
  showYAxis = true, // Mặc định hiển thị trục Y
  showXAxis = true, // Mặc định hiển thị trục X
  yAxisUnit = '', // Đơn vị trục Y/X
}: BarChartProps) => {

  const autoIsStacked = Array.isArray(data) && data.length > 0 && 'segments' in data[0];
  const useStacked = isStacked ?? autoIsStacked;
  const isVertical = orientation === 'vertical';

  const displayData = data;

  // Tính rawMaxValue, sử dụng 1 làm giá trị tối thiểu để tránh chia cho 0
  const rawMaxValue = Math.max(...displayData.map(d =>
    'segments' in d ? d.segments.reduce((sum, s) => sum + s.value, 0) : 'value' in d ? d.value : 0
  ), 1);

  // Tính toán tickValues và maxValue đã làm tròn
  const { tickValues, roundedMax: maxValue } = calculateYAxisTicks(rawMaxValue, 5);

  const isInteractive = onBarClick && isDrillDownEnabled;

  /*
   * Logic Padding và Cuộn
   */
  let contentPaddingClass = "p-4";
  const barSpacingClass = isVertical ? "gap-4" : "gap-4"; // Dãn cách bar

  if (isVertical && showYAxis) {
    // Cần padding bên trái cho Trục Y (20 cho trục Y + 4 cho khoảng cách)
    contentPaddingClass = "py-4 pr-4 pl-20 pb-10";
  } else if (isVertical && !showYAxis) {
    // Không có trục Y, chỉ cần padding thông thường
    contentPaddingClass = "pt-4 pb-10 px-4";
  } else if (!isVertical) {
    // Biểu đồ ngang, cần padding bên trái cho label danh mục
    contentPaddingClass = "py-4 pl-4 pr-8 pb-10";
  }

  const chartAreaMarginLeft = (isVertical && showYAxis) ? '5rem' : '0';


  return (
    <WidgetContainer
      size={size}
      className={cn(responsiveSizeClasses[size], className, "bg-transparent shadow-none border-none", isVertical && "h-full")}
    >
      <div
        className={cn(
          widgetBaseStyles,
          isVertical ? "h-full flex flex-col" : "flex flex-col",
          isInteractive && "group relative"
        )}
      >
        {/* Header (Giữ nguyên) */}
        <div className={cn(
          widgetHeaderStyles,
          "bg-transparent border-none rounded-none overflow-hidden px-6 pt-4 pb-2"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-ithq-teal-600" />
            <h3 className="text-lg font-poppins font-semibold text-gray-900">{title}</h3>
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

        {/* Content Container (Áp dụng padding mới) */}
        <div className={cn(
          widgetContentStyles,
          "bg-transparent flex flex-col rounded-none",
          contentPaddingClass, // Áp dụng padding mới
          "flex-1 overflow-hidden"
        )}>
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-lexend">No data available</p>
            </div>
          ) : (
            <div className="relative flex-1 overflow-auto"> {/* <-- Container cuộn */}

              {/* Bọc Trục Y (Dọc) trong 1 div tuyệt đối */}
              {isVertical && showYAxis && (
                <div
                  className="absolute left-0 w-20"
                  style={{ top: '1rem', bottom: '2.5rem' }}
                >
                  <ValueAxis
                    orientation='vertical'
                    tickValues={tickValues}
                    maxValue={maxValue}
                    unit={yAxisUnit}
                    showAxis={true}
                  />
                </div>
              )}

              {/* Chart Area */}
              <div
                className={cn(
                  "bg-transparent h-full",
                  // Biểu đồ dọc: Cuộn ngang, thanh đứng, có đường baseline (border-l)
                  isVertical
                    ? `flex justify-between items-start min-h-[12rem] ${barSpacingClass} border-l border-gray-200 min-w-full`
                    // Biểu đồ ngang: Cuộn dọc, thanh ngang, có đường baseline (border-b)
                    : `flex flex-col justify-start min-h-[16rem] pt-4 border-b border-gray-200 ${barSpacingClass}`
                )}
                style={{ marginLeft: chartAreaMarginLeft }}
              >
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

              {/* X-Axis (Ngang) */}
              <ValueAxis
                orientation='horizontal'
                tickValues={tickValues}
                maxValue={maxValue}
                unit={yAxisUnit}
                showAxis={!isVertical && showXAxis}
              />
            </div>
          )}
        </div>
      </div>
    </WidgetContainer>
  );
};