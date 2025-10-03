import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { 
  WidgetSize, 
  responsiveSizeClasses, 
  widgetBaseStyles, 
  widgetHeaderStyles, 
  widgetContentStyles 
} from './widget-styles';

interface WidgetContainerProps {
  size: WidgetSize;
  children: ReactNode;
  className?: string;
}

interface WidgetGridProps {
  children: ReactNode;
  className?: string;
}

export const WidgetContainer = ({ size, children, className }: WidgetContainerProps) => {
  return (
    <div className={cn(
      responsiveSizeClasses[size],
      "transition-all duration-200",
      className
    )}>
      {children}
    </div>
  );
};

export const WidgetGrid = ({ children, className }: WidgetGridProps) => {
  return (
    <div className={cn(
      "grid grid-cols-4 gap-6 w-full",
      "auto-rows-min", // Ensures rows size to content
      className
    )}>
      {children}
    </div>
  );
};

// Widget loading state
export const WidgetSkeleton = ({ size }: { size: WidgetSize }) => {
  return (
    <WidgetContainer size={size}>
      <div className={cn(widgetBaseStyles, "animate-pulse")}>
        <div className={widgetHeaderStyles}>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-3/4"></div>
        </div>
        <div className={widgetContentStyles}>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    </WidgetContainer>
  );
};

// Widget error state
export const WidgetError = ({ size, message }: { size: WidgetSize; message?: string }) => {
  return (
    <WidgetContainer size={size}>
      <div className={cn(widgetBaseStyles, "border-red-200 bg-red-50")}>
        <div className={widgetContentStyles}>
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">⚠️</div>
            <p className="text-sm text-red-700 font-lexend">
              {message || "Failed to load widget data"}
            </p>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
};
