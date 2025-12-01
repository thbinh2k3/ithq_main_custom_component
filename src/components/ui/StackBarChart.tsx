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
export interface StackedBarChartDataPoint {
    category: string;
    [seriesName: string]: string | number;
}

export interface StackedBarChartProps {
    size?: WidgetSize;
    title: string;
    subtitle?: string;
    data: StackedBarChartDataPoint[];
    categoryKey: string;
    seriesKeys: string[];
    orientation?: 'vertical' | 'horizontal';
    showLegend?: boolean;
    showTooltips?: boolean;
    className?: string;
    showYAxis?: boolean;
    showXAxis?: boolean;
    yAxisUnit?: string;
    onSegmentClick?: (dataPoint: { category: string; series: string; value: number }) => void;
}

const SERIES_COLORS = [
    '#007D8E', '#F46235', '#FFB000', '#28627B', '#40A4B1',
    '#F6815A', '#375623', '#997300', '#264478', '#843C0C',
];

// ================== HELPER FUNCTIONS (Giữ nguyên) ==================
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


// ================== TOOLTIP & LEGEND (Giữ nguyên) ==================
const Tooltip = ({ show, x, y, content }: { show: boolean; x: number; y: number; content: string }) => {
    if (!show) return null;

    const edgeBuffer = 10;
    const estimatedTooltipWidth = content.length * 6 + 24;
    let tooltipX = x;

    if (x - (estimatedTooltipWidth / 2) < edgeBuffer) {
        tooltipX = edgeBuffer;
    } else {
        tooltipX = x - 10;
    }

    const transformStyle = (tooltipX === edgeBuffer) ? 'none' : 'translateX(-50%)';

    return (
        <div
            className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none"
            style={{
                left: tooltipX,
                top: y - 40,
                transform: transformStyle,
                whiteSpace: 'nowrap'
            }}
        >
            {content}
        </div>
    );
};

interface LegendProps {
    seriesKeys: string[];
}

const Legend = ({ seriesKeys }: LegendProps) => {
    return (
        <div className="flex gap-4 flex-wrap flex-row justify-center">
            {seriesKeys.map((series, index) => (
                <div key={series} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
                    />
                    <span className="text-xs font-lexend text-gray-700">{series}</span>
                </div>
            ))}
        </div>
    );
};

// ================== STACKED BAR SEGMENT (Giữ nguyên) ==================
interface StackedBarSegmentProps {
    category: string;
    series: string;
    value: number;
    totalValue: number;
    maxValue: number;
    orientation: 'vertical' | 'horizontal';
    offset: number;
    isLastSegment: boolean;
    colorIndex: number;
    onSegmentHover: (e: MouseEvent, tooltip: string) => void;
    onSegmentLeave: () => void;
    onSegmentClick: (dataPoint: { category: string; series: string; value: number }) => void;
}

const StackedBarSegment = ({
    category,
    series,
    value,
    maxValue,
    orientation,
    offset,
    isLastSegment,
    colorIndex,
    onSegmentHover,
    onSegmentLeave,
    onSegmentClick
}: StackedBarSegmentProps) => {
    const isVertical = orientation === 'vertical';
    const safeMaxValue = maxValue === 0 ? 1 : maxValue;
    const percentage = (value / safeMaxValue) * 100;
    const offsetPercentage = (offset / safeMaxValue) * 100;

    if (value === 0 || percentage === 0) return null;

    const handleHover = (e: MouseEvent) => {
        onSegmentHover(e, `${series}: ${value?.toLocaleString()}`);
    };

    const segmentStyle: React.CSSProperties = isVertical ? {
        position: 'absolute',
        backgroundColor: SERIES_COLORS[colorIndex % SERIES_COLORS.length],
        height: `${percentage}%`,
        bottom: `${offsetPercentage}%`,
        left: 0,
        right: 0,
        width: '100%',
    } : {
        position: 'absolute',
        backgroundColor: SERIES_COLORS[colorIndex % SERIES_COLORS.length],
        width: `${percentage}%`,
        left: `${offsetPercentage}%`,
        top: 0,
        bottom: 0,
        height: '100%',
    };

    return (
        <div
            className={cn(
                "transition-all duration-300 hover:opacity-80 cursor-pointer",
                isLastSegment && (isVertical ? "rounded-t" : "rounded-r")
            )}
            style={segmentStyle}
            onMouseEnter={handleHover}
            onMouseLeave={onSegmentLeave}
            onClick={() => onSegmentClick({ category, series, value })}
        />
    );
};

// ================== STACKED BAR (Giữ nguyên) ==================
interface StackedBarProps {
    dataPoint: StackedBarChartDataPoint;
    categoryKey: string;
    seriesKeys: string[];
    maxValue: number;
    orientation: 'vertical' | 'horizontal';
    showValues: boolean;
    onSegmentClick?: (dataPoint: { category: string; series: string; value: number }) => void;
    yAxisUnit?: string;
}

const StackedBar = ({
    dataPoint,
    categoryKey,
    seriesKeys,
    maxValue,
    orientation,
    showValues,
    onSegmentClick,
}: StackedBarProps) => {
    const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
        show: false, x: 0, y: 0, content: ''
    });

    const category = String(dataPoint[categoryKey]);
    const totalValue = seriesKeys.reduce((sum, key) => sum + (Number(dataPoint[key]) || 0), 0);
    const safeMaxValue = maxValue === 0 ? 1 : maxValue;
    const totalPercentage = (totalValue / safeMaxValue) * 100;
    const isVertical = orientation === 'vertical';

    const threshold = 95;
    const isLongEnough = totalPercentage >= threshold;

    const handleSegmentHover = (e: MouseEvent, tooltipText: string) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltip({ show: true, x: rect.left + rect.width / 2, y: rect.top, content: tooltipText });
    };

    const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, content: '' });

    let cumulativeOffset = 0;

    return (
        <>
            <div className={cn(
                "group relative",
                isVertical ? "flex flex-col items-center h-full justify-end" : "flex items-center gap-6"
            )}>
                {/* Category Label - Horizontal */}
                {!isVertical && (
                    <div className={cn(
                        "text-xs font-lexend text-gray-600 flex-shrink-0",
                        "w-20 text-right"
                    )}>
                        {category}
                    </div>
                )}

                {/* Bar Container */}
                <div className={cn(
                    "relative overflow-hidden",
                    // w-12 để các thanh có độ rộng cố định khi cuộn
                    isVertical ? "w-12 h-full bg-gray-100 rounded-t" : "h-10 flex-1 bg-gray-100 rounded-r"
                )}>
                    {/* Render segments */}
                    {seriesKeys.map((series, idx) => {
                        const value = Number(dataPoint[series]) || 0;
                        const isLast = idx === seriesKeys.length - 1;
                        const offset = cumulativeOffset;
                        cumulativeOffset += value;

                        return (
                            <StackedBarSegment
                                key={`${category}-${series}-${idx}`}
                                category={category}
                                series={series}
                                value={value}
                                totalValue={totalValue}
                                maxValue={safeMaxValue}
                                orientation={orientation}
                                offset={offset}
                                isLastSegment={isLast}
                                colorIndex={idx}
                                onSegmentHover={handleSegmentHover}
                                onSegmentLeave={handleMouseLeave}
                                onSegmentClick={onSegmentClick || (() => { })}
                            />
                        );
                    })}

                    {/* Total Value Label */}
                    {showValues && totalValue > 0 && (
                        <div
                            className={cn(
                                "absolute text-xs font-lexend font-medium z-10",
                                isVertical
                                    ? (isLongEnough
                                        ? "top-1 left-1/2 -translate-x-1/2 text-white"
                                        : "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 text-gray-900")
                                    : (isLongEnough
                                        ? "right-1 top-1/2 -translate-y-1/2 text-white"
                                        : "right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+6px)] text-gray-900")
                            )}
                        >
                            {formatValue(totalValue)}
                        </div>
                    )}
                </div>

                {/* Category Label (Vertical) */}
                {isVertical && (
                    <div className={cn(
                        "text-xs font-lexend text-gray-600 flex-shrink-0",
                        "text-center mt-2"
                    )}>
                        {category}
                    </div>
                )}
            </div>
            <Tooltip {...tooltip} />
        </>
    );
};

// ================== VALUE AXIS COMPONENT (Giữ nguyên) ==================
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
                            {index > 0 && (
                                <div
                                    className="absolute w-full h-[1px] bg-gray-200 right-[-8px] top-0"
                                    style={{ width: `calc(100% + 8px)` }}
                                />
                            )}

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

    // Horizontal Axis (Giữ nguyên)
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


// ================== MAIN COMPONENT (ĐÃ SỬA LỖI LEGEND) ==================
export const StackedBarChart = ({
    size = 'half',
    title,
    subtitle,
    data,
    categoryKey,
    seriesKeys,
    orientation = 'vertical',
    showLegend = true,
    showTooltips = true,
    showYAxis = false,
    showXAxis = true,
    yAxisUnit = '',
    className,
    onSegmentClick
}: StackedBarChartProps) => {

    const rawMaxValue = Math.max(
        ...data.map(d =>
            seriesKeys.reduce((sum, key) => sum + (Number(d[key]) || 0), 0)
        ),
        1
    );

    const { tickValues, roundedMax: maxValue } = calculateYAxisTicks(rawMaxValue, 5);
    const showValues = showTooltips;
    const isVertical = orientation === 'vertical';

    // Logic padding (Giữ nguyên)
    let contentPaddingClass = "p-4";
    if (isVertical && showYAxis) {
        contentPaddingClass = "py-4 pr-4 pl-20 pb-10";
    } else if (isVertical && !showYAxis) {
        contentPaddingClass = "pt-4 pb-10 px-4";
    } else if (!isVertical) {
        contentPaddingClass = "py-4 pl-4 pr-8 pb-10";
    }

    const chartAreaMarginLeft = (isVertical && showYAxis) ? '5rem' : '0';

    return (
        <WidgetContainer
            size={size}
            className={cn(responsiveSizeClasses[size], className, "bg-transparent shadow-none border-none")}
        >
            {/* THÊM flex flex-col ĐỂ XẾP HEADER, CHART VÀ LEGEND THEO CHIỀU DỌC */}
            <div className={cn(widgetBaseStyles, "group relative", "flex flex-col")}>

                {/* Header (Giữ nguyên) */}
                <div className={cn(widgetHeaderStyles, "bg-transparent border-none rounded-none overflow-hidden px-6 pt-4 pb-2")}>
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

                {/* Chart Content (Giữ nguyên) */}
                <div className={cn(widgetContentStyles, "bg-transparent flex-1 flex flex-col rounded-none", contentPaddingClass)}>
                    {data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-lexend">No data available</p>
                        </div>
                    ) : (
                        <div className="relative flex-1 overflow-x-auto"> {/* <-- Container cuộn */}

                            {/* Bọc Trục Y trong 1 div tuyệt đối */}
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
                                    "flex-1 bg-transparent h-full",
                                    isVertical
                                        ? "flex justify-between items-end min-h-[12rem] gap-2 pl-4 border-l border-gray-200 min-w-full"
                                        : "flex flex-col justify-between gap-2 min-h-[16rem] pt-4 border-b border-gray-200"
                                )}
                                style={{ marginLeft: chartAreaMarginLeft }}
                            >
                                {data.map((dataPoint, index) => (
                                    <StackedBar
                                        key={`${dataPoint[categoryKey]}-${index}`}
                                        dataPoint={dataPoint}
                                        categoryKey={categoryKey}
                                        seriesKeys={seriesKeys}
                                        maxValue={maxValue}
                                        orientation={orientation}
                                        showValues={showValues}
                                        onSegmentClick={onSegmentClick}
                                    />
                                ))}
                            </div>

                            {/* X-Axis (Horizontal) (Giữ nguyên) */}
                            <ValueAxis
                                orientation='horizontal'
                                tickValues={tickValues}
                                maxValue={maxValue}
                                showAxis={!isVertical && showXAxis}
                            />
                        </div>
                    )}
                </div>

                {/* VỊ TRÍ MỚI VÀ AN TOÀN: Legend nằm ngay sau Chart Content, bên trong div flex-col */}
                {showLegend && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <Legend seriesKeys={seriesKeys} />
                    </div>
                )}
            </div>
        </WidgetContainer>
    );
};   