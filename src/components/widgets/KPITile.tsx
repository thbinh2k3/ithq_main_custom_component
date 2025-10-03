import { MouseEvent } from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WidgetContainer } from './WidgetGrid';
import { WidgetSize, widgetBaseStyles, widgetContentStyles, widgetInteractiveStyles, drillDownIndicatorStyles } from './widget-styles';

interface SparklineData {
  value: number;
  timestamp: string;
}

interface KPITileProps {
  size?: WidgetSize;
  title: string;
  value: string | number;
  previousValue?: string | number;
  changePercentage?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparklineData?: SparklineData[];
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  isDrillDownEnabled?: boolean;
}

// Simple sparkline component using SVG
const Sparkline = ({ data, className }: { data: SparklineData[]; className?: string }) => {
  if (!data || data.length < 2) return null;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const width = 120;
  const height = 32;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={`M0,${height} L${points} L${width},${height} Z`}
        fill="url(#sparkline-gradient)"
        className="text-ithq-teal-500"
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ithq-teal-600"
      />
      
      {/* Last point indicator */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={height - ((values[values.length - 1] - minValue) / range) * height}
          r="3"
          fill="currentColor"
          className="text-ithq-teal-600"
        />
      )}
    </svg>
  );
};

// Change indicator component
const ChangeIndicator = ({ 
  percentage, 
  trend, 
  label 
}: { 
  percentage?: number; 
  trend?: 'up' | 'down' | 'neutral';
  label?: string;
}) => {
  if (percentage === undefined && !trend) return null;

  const isPositive = percentage !== undefined ? percentage > 0 : trend === 'up';
  const isNegative = percentage !== undefined ? percentage < 0 : trend === 'down';
  const isNeutral = percentage === 0 || trend === 'neutral';

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  
  const colorClass = isPositive 
    ? 'text-green-600 bg-green-50 border-green-200' 
    : isNegative 
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-gray-600 bg-gray-50 border-gray-200';

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-lexend font-medium",
      colorClass
    )}>
      <Icon className="h-3 w-3" />
      {percentage !== undefined && (
        <span>
          {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
        </span>
      )}
      {label && (
        <span className="text-xs opacity-75">{label}</span>
      )}
    </div>
  );
};

export const KPITile = ({
  size = 'quarter',
  title,
  value,
  previousValue,
  changePercentage,
  changeLabel,
  trend,
  sparklineData,
  subtitle,
  className,
  onClick,
  isDrillDownEnabled = true
}: KPITileProps) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  const isInteractive = onClick && isDrillDownEnabled;

  return (
    <WidgetContainer size={size} className={className}>
      <div className={cn(
        widgetBaseStyles,
        isInteractive && widgetInteractiveStyles,
        isInteractive && "group relative",
        className
      )}>

        <div 
          className={cn(
            widgetContentStyles, 
            "cursor-pointer" // Always show pointer cursor for consistency
          )}
          onClick={handleClick}
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-sm font-lexend font-medium text-gray-600 mb-1">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 font-lexend">
                {subtitle}
              </p>
            )}
          </div>

          {/* Main Value */}
          <div className="mb-4">
            <div className="text-3xl font-poppins font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {/* Previous Value */}
            {previousValue && (
              <div className="text-xs text-gray-500 font-lexend">
                Previous: {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue}
              </div>
            )}
          </div>

          {/* Change Indicator & Sparkline Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              {(changePercentage !== undefined || trend) && (
                <ChangeIndicator 
                  percentage={changePercentage} 
                  trend={trend}
                  label={changeLabel}
                />
              )}
            </div>
            
            {/* Sparkline */}
            {sparklineData && sparklineData.length > 1 && (
              <div className="flex-shrink-0">
                <Sparkline data={sparklineData} className="opacity-75" />
              </div>
            )}
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
};
