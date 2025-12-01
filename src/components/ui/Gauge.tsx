import React, { useEffect, useState, useRef, FC } from 'react';
import { Activity, BarChart3, GaugeCircle } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho Thresholds
interface ColorThreshold {
    value: number;
    color: string;
}

// Định nghĩa Props cho component Gauge
interface GaugeProps {
    value: number;
    maxValue?: number;
    label?: string;
    title?: string;
    subtitle?: string;
    colorThresholds?: ColorThreshold[];
    colorMode?: 'gradient' | 'solid';
    showPercentage?: boolean;
    showCheckpoints?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    icon?: React.ReactElement;
}

// Hàm hỗ trợ tính toán tọa độ
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians)),
    };
};

// Hàm hỗ trợ nội suy màu
const interpolateColor = (color1: string, color2: string, progress: number) => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;

    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return `rgb(${r}, ${g}, ${b})`;
};

export const Gauge: FC<GaugeProps> = ({
    value,
    maxValue = 100,
    label = '',
    title = '',
    subtitle = '',
    colorThresholds = [
        { value: 0, color: '#FF0000' },
        { value: 33, color: '#FFA500' },
        { value: 66, color: '#22B14C' }, // Đổi màu này để phù hợp với "On Target" cuối cùng
        { value: 100, color: '#22B14C' } // Giữ màu này là màu cuối cùng
    ],
    colorMode = 'gradient',
    showPercentage = true,
    showCheckpoints = false,
    onClick,
    className,
    style,
    icon,
}) => {
    const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    const roundedValueForCalc = Math.round(numericValue * 100) / 100;
    const clampedValue = Math.min(Math.max(roundedValueForCalc, 0), maxValue);
    const percentage = clampedValue / maxValue;
    const targetAngle = percentage * 180;

    const [animatedAngle, setAnimatedAngle] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    // Animation Effect
    useEffect(() => {
        isMountedRef.current = true;

        if (numericValue === 0 && targetAngle === 0) {
            setAnimatedAngle(0);
            return;
        }

        let current = 0;
        const duration = 800; // ms
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            if (!isMountedRef.current) return;

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutCubic)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            current = targetAngle * easedProgress;

            setAnimatedAngle(current);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setAnimatedAngle(targetAngle);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            isMountedRef.current = false;
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [targetAngle, numericValue]);

    // Fallback Effect
    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            if (Math.abs(animatedAngle - targetAngle) > 0.1) {
                setAnimatedAngle(targetAngle);
            }
        }, 1000);

        return () => clearTimeout(fallbackTimer);
    }, [targetAngle, animatedAngle]);

    // Hàm lấy màu gradient
    const getColorAtValueGradient = (val: number) => {
        if (colorThresholds.length === 0) return '#007D8E';
        const sorted = [...colorThresholds].sort((a, b) => a.value - b.value);

        for (let i = 0; i < sorted.length - 1; i++) {
            if (val >= sorted[i].value && val <= sorted[i + 1].value) {
                const range = sorted[i + 1].value - sorted[i].value;
                const progress = range === 0 ? 0 : (val - sorted[i].value) / range;
                return interpolateColor(sorted[i].color, sorted[i + 1].color, progress);
            }
        }

        return val < sorted[0].value ? sorted[0].color : sorted[sorted.length - 1].color;
    };

    // Hàm lấy màu solid
    const getColorAtValueSolid = (val: number) => {
        if (colorThresholds.length === 0) return '#007D8E';
        const sorted = [...colorThresholds].sort((a, b) => a.value - b.value);

        for (let i = 0; i < sorted.length - 1; i++) {
            if (val >= sorted[i].value && val < sorted[i + 1].value) {
                return sorted[i].color;
            }
        }

        return sorted[sorted.length - 1].color;
    };

    const getColorAtValue = colorMode === 'solid' ? getColorAtValueSolid : getColorAtValueGradient;

    // Tạo gradient segments
    const createGradientSegments = () => {
        const segments = [];
        const segmentCount = 36;
        const radius = 40;
        const innerRadius = 32;

        const effectiveAngle = Math.max(animatedAngle, numericValue > 0 ? 1 : 0);

        for (let i = 0; i < segmentCount; i++) {
            const startAngle = (i / segmentCount) * 180;
            const endAngle = ((i + 1) / segmentCount) * 180;

            if (startAngle > effectiveAngle) break;

            const segmentEndAngle = Math.min(endAngle, effectiveAngle);
            const midAngle = (startAngle + segmentEndAngle) / 2;
            const normalizedPos = midAngle / 180;
            const segmentValue = normalizedPos * maxValue;

            const color = getColorAtValue(segmentValue);

            const startPoint = polarToCartesian(50, 50, radius, startAngle);
            const endPoint = polarToCartesian(50, 50, radius, segmentEndAngle);
            const innerStartPoint = polarToCartesian(50, 50, innerRadius, startAngle);
            const innerEndPoint = polarToCartesian(50, 50, innerRadius, segmentEndAngle);

            const largeArcFlag = (segmentEndAngle - startAngle) > 90 ? '1' : '0';

            const pathData = `
                M ${startPoint.x} ${startPoint.y}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}
                L ${innerEndPoint.x} ${innerEndPoint.y}
                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartPoint.x} ${innerStartPoint.y}
                Z
            `;

            segments.push(
                <path key={`segment-${i}`} d={pathData} fill={color} stroke="none" />
            );
        }

        return segments;
    };

    // Tạo background segments
    const createBackgroundSegments = () => {
        const segments = [];
        const segmentCount = 36;
        const radius = 40;
        const innerRadius = 32;

        for (let i = 0; i < segmentCount; i++) {
            const fullStartAngle = (i / segmentCount) * 180;
            const fullEndAngle = ((i + 1) / segmentCount) * 180;

            if (fullEndAngle <= animatedAngle) continue;

            const startAngle = Math.max(fullStartAngle, animatedAngle);
            const endAngle = fullEndAngle;

            if (startAngle >= endAngle) continue;

            const startPoint = polarToCartesian(50, 50, radius, startAngle);
            const endPoint = polarToCartesian(50, 50, radius, endAngle);
            const innerStartPoint = polarToCartesian(50, 50, innerRadius, startAngle);
            const innerEndPoint = polarToCartesian(50, 50, innerRadius, endAngle);

            const largeArcFlag = (endAngle - startAngle) > 90 ? '1' : '0';

            const pathData = `
                M ${startPoint.x} ${startPoint.y}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}
                L ${innerEndPoint.x} ${innerEndPoint.y}
                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartPoint.x} ${innerStartPoint.y}
                Z
            `;

            segments.push(
                <path key={`bg-segment-${i}`} d={pathData} fill="#E5E7EB" stroke="none" />
            );
        }

        return segments;
    };

    // Render checkpoints
    const renderCheckpoints = () => {
        if (!showCheckpoints || colorThresholds.length === 0) return null;

        return colorThresholds
            .filter(t => t.value > 0 && t.value < maxValue)
            .map((threshold, index) => {
                const thresholdNumericValue = typeof threshold.value === 'number' && !isNaN(threshold.value) ? threshold.value : 0;
                const displayValue = thresholdNumericValue.toFixed(1);
                const thresholdPercentage = threshold.value / maxValue;
                const thresholdAngle = thresholdPercentage * 180;

                const outerPoint = polarToCartesian(50, 50, 42, thresholdAngle);
                const innerPoint = polarToCartesian(50, 50, 30, thresholdAngle);
                const textPoint = polarToCartesian(50, 50, 26, thresholdAngle);

                let textAnchor = "middle";
                if (thresholdAngle < 85) textAnchor = "start";
                else if (thresholdAngle > 95) textAnchor = "end";

                return (
                    <React.Fragment key={`checkpoint-group-${index}`}>
                        <line
                            x1={innerPoint.x}
                            y1={innerPoint.y}
                            x2={outerPoint.x}
                            y2={outerPoint.y}
                            stroke={threshold.color}
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                        <text
                            x={textPoint.x}
                            y={textPoint.y}
                            fill={threshold.color}
                            fontSize="5"
                            fontWeight="600"
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            style={{ fontFamily: `'Lexend Deca', sans-serif` }}
                        >
                            {displayValue}
                        </text>
                    </React.Fragment>
                );
            });
    };

    const currentColor = getColorAtValue(clampedValue);

    // Chuẩn bị dữ liệu cho Legend
    const sortedThresholds = [...colorThresholds].sort((a, b) => a.value - b.value);

    // Nhãn cố định theo thứ tự: Ngưỡng 0 (hoặc thấp nhất), Ngưỡng 1, Ngưỡng 2, Ngưỡng 3
    const fixedLabels = ["High Risk", "Medium", "On Target", "Max Value"];
    // Nếu chỉ có 3 ngưỡng (0, 33, 66) thì label sẽ là "High Risk", "Medium", "On Target" (từ 66 trở lên)
    const labelMapping = ["High Risk", "Medium", "On Target"];

    const legendItems: { color: string, label: string }[] = [];

    // Áp dụng logic chung cho cả solid và gradient để có nhãn cố định
    for (let i = 0; i < sortedThresholds.length; i++) {
        const threshold = sortedThresholds[i];
        const nextThreshold = sortedThresholds[i + 1];
        const color = threshold.color;

        let labelText = '';

        // Gán nhãn cố định nếu có
        if (i < labelMapping.length) {
            labelText = labelMapping[i];
        }

        // Thêm thông tin về phạm vi giá trị
        let valueRangeText = '';
        if (i === sortedThresholds.length - 1) {
            // Ngưỡng cuối cùng: >= value
            valueRangeText = `>= ${threshold.value.toFixed(1)}`;
        } else if (nextThreshold) {
            // Phạm vi: value - < next_value
            valueRangeText = `${threshold.value.toFixed(1)} - < ${nextThreshold.value.toFixed(1)}`;
        }

        // Kết hợp nhãn cố định và phạm vi giá trị
        if (labelText && valueRangeText) {
            labelText = `${labelText} (${valueRangeText})`;
        } else if (valueRangeText) {
            // Trường hợp không có nhãn cố định (ví dụ nhiều hơn 3 ngưỡng)
            labelText = valueRangeText;
        }


        if (labelText) {
            // Nếu là gradient và không phải ngưỡng cuối, màu sẽ là màu của ngưỡng đó.
            // Nếu là solid, màu hiển thị là màu của khoảng đó. Logic lấy màu đã đúng.
            // Với solid, màu của khoảng là màu của ngưỡng bắt đầu.
            // Với gradient, ta vẫn lấy màu của mốc.

            legendItems.push({
                color: color,
                label: labelText,
            });
        }
    }

    // Xử lý lại để hiển thị nhãn và giá trị của ngưỡng bắt đầu, ngưỡng 33, và ngưỡng 66
    // Yêu cầu "Legend như nhau có thêm label bên phải các ngưỡng High Risk Medium On Target"
    const finalLegendItems: { color: string, label: string, valueRange: string }[] = [];

    for (let i = 0; i < sortedThresholds.length; i++) {
        const threshold = sortedThresholds[i];
        const nextThreshold = sortedThresholds[i + 1];
        const color = threshold.color;

        let labelName = '';
        if (i === 0) labelName = 'High Risk';
        else if (i === 1) labelName = 'Medium';
        else if (i === 2) labelName = 'On Target';

        let valueRange = '';
        if (i < sortedThresholds.length - 1 && nextThreshold) {
            valueRange = `${threshold.value.toFixed(1)} - < ${nextThreshold.value.toFixed(1)}`;
        } else if (i === sortedThresholds.length - 1) {
            valueRange = `>= ${threshold.value.toFixed(1)}`;
        }

        // Chỉ hiển thị 3 ngưỡng chính hoặc các ngưỡng có nhãn cố định (và ngưỡng cuối)
        if (labelName) {
            // Sử dụng màu của ngưỡng đó
            finalLegendItems.push({
                color: color,
                label: labelName,
                valueRange: valueRange,
            });
        }

        // Trường hợp đặc biệt nếu có nhiều hơn 3 ngưỡng và cần hiển thị ngưỡng cuối (maxValue)
        if (i === sortedThresholds.length - 1 && sortedThresholds.length > labelMapping.length) {
            if (labelMapping.length === 3 && i === 3) {
                // Nếu có 4 ngưỡng (0, 33, 66, 100), ngưỡng 3 là max value, nhưng đã được On Target bao phủ
            } else if (labelName === '') { // Thêm ngưỡng cuối nếu nó chưa được gán nhãn
                finalLegendItems.push({
                    color: color,
                    label: `Max Value`,
                    valueRange: valueRange,
                });
            }
        }
    }

    // Nếu có 4 ngưỡng (0, 33, 66, 100), ta chỉ muốn 3 dòng: High Risk (0), Medium (33), On Target (66-100).
    // Dựa vào logic Solid mode trước đó:
    // [0] -> 0 - < 33 (High Risk)
    // [1] -> 33 - < 66 (Medium)
    // [2] -> >= 66 (On Target)

    const requiredLegendItems: { color: string, label: string, valueRange: string }[] = [];
    const requiredLabels = ["High Risk", "Medium", "On Target"];

    for (let i = 0; i < sortedThresholds.length; i++) {
        if (i < requiredLabels.length) {
            const threshold = sortedThresholds[i];
            const nextThreshold = sortedThresholds[i + 1];

            let valueRange = '';
            if (nextThreshold) {
                valueRange = `(${threshold.value.toFixed(1)} - < ${nextThreshold.value.toFixed(1)})`;
            } else {
                valueRange = `(>= ${threshold.value.toFixed(1)})`;
            }

            requiredLegendItems.push({
                color: threshold.color,
                label: requiredLabels[i],
                valueRange: valueRange,
            });
        }
    }


    return (
        <div
            className={className}
            onClick={onClick}
            style={{
                borderRadius: '1rem',
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: `'Lexend Deca', sans-serif`,
                cursor: onClick ? 'pointer' : 'default',
                boxSizing: 'border-box',
                fontSize: '16px',
                ...style
            }}
        >
            {/* PHẦN HEADER (TITLE/SUBTITLE) */}
            {(title || subtitle) && (
                <div
                    style={{
                        padding: '1rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        {title && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <GaugeCircle className="h-5 w-5 text-ithq-teal-600" />
                                <h4 style={{
                                    margin: 0,
                                    color: '#333',
                                    fontSize: '1.125em',
                                    fontWeight: '600',
                                    textAlign: 'left',
                                    fontFamily: `'Lexend Deca', sans-serif`,
                                }}>
                                    {title}
                                </h4>
                            </div>
                        )}
                        {subtitle && (
                            <p style={{
                                margin: 0,
                                color: '#6B7280',
                                fontSize: '0.85em',
                                fontWeight: '400',
                                textAlign: 'left',
                                marginTop: title ? '0.125rem' : 0,
                                fontFamily: `'Lexend Deca', sans-serif`,
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* PHẦN CHART */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: '100px',
                padding: '1rem 0'
            }}>
                <div style={{
                    width: '90%',
                    maxWidth: '280px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <svg viewBox="0 0 100 60" style={{ width: '100%', height: 'auto', display: 'block' }}>
                        <g>{createBackgroundSegments()}</g>
                        <g>{createGradientSegments()}</g>
                        {renderCheckpoints()}
                        <text x="13" y="58" fill="#6B7280" fontSize="6" fontWeight="600" textAnchor="start" style={{ fontFamily: `'Lexend Deca', sans-serif` }}>0</text>
                        <text x="99" y="58" fill="#6B7280" fontSize="6" fontWeight="600" textAnchor="end" style={{ fontFamily: `'Lexend Deca', sans-serif` }}>{maxValue}</text>
                    </svg>

                    <div style={{
                        marginTop: '-2rem',
                        textAlign: 'center',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            lineHeight: '1',
                        }}>
                            <div style={{
                                fontSize: '1.5em',
                                fontWeight: 'bold',
                                color: currentColor,
                                lineHeight: '1',
                                fontFamily: `'Lexend Deca', sans-serif`,
                            }}>
                                {numericValue.toFixed(1)}
                            </div>
                            {showPercentage && (
                                <div style={{
                                    fontSize: '1.2em',
                                    fontWeight: '600',
                                    color: currentColor,
                                    lineHeight: '1',
                                    fontFamily: `'Lexend Deca', sans-serif`,
                                }}>
                                    / {Math.round(percentage * 100)}%
                                </div>
                            )}
                        </div>
                        {label && (
                            <div style={{
                                fontSize: '0.85em',
                                color: '#6B7280',
                                marginTop: '4px',
                                fontFamily: `'Lexend Deca', sans-serif`,
                            }}>
                                {label}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PHẦN LEGEND ĐÃ CẢI THIỆN UI VỚI NHÃN CỐ ĐỊNH */}
            {requiredLegendItems.length > 0 && (
                <div style={{
                    padding: '1rem',
                    paddingTop: '0.75rem',
                    // Thêm border top nếu có title/subtitle, nếu không thì border top luôn có
                    borderTop: (title || subtitle) ? '1px solid #E5E7EB' : '1px solid #E5E7EB',
                    marginTop: 'auto',
                }}>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875em', fontWeight: '600', color: '#333' }}>
                        Thresholds:
                    </p>
                    <div style={{
                        // SỬ DỤNG GRID ĐỂ TẠO CỘT VÀ CẢI THIỆN UI
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(requiredLegendItems.length, 3)}, 1fr)`, // Chia tối đa 3 cột
                        gap: '0.5rem 1rem', // Khoảng cách giữa các item
                        alignItems: 'center',
                    }}>
                        {requiredLegendItems.map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '1em',
                                color: '#4B5563',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: item.color,
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{ fontWeight: '500' }}>
                                    {item.label}
                                </span>
                                <span style={{
                                    fontSize: '0.8em', color: '#6B7280',
                                    marginRight: '20px'
                                }}>
                                    {item.valueRange}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* KẾT THÚC PHẦN LEGEND */}
        </div>
    );
};