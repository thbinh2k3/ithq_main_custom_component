  import { cn } from '../../lib/utils';

  // Widget base styles for consistency
  export const widgetBaseStyles = cn(
    "bg-white rounded-2xl border border-gray-200 shadow-sm",
    "hover:shadow-md hover:border-gray-300 transition-all duration-200",
    "overflow-hidden h-full"
  );

  // Widget header styles
  export const widgetHeaderStyles = cn(
    "p-6 pb-4 border-b border-gray-100"
  );

  // Widget content styles
  export const widgetContentStyles = cn(
    "p-6 h-auto"
  );

  // Widget interactive styles
  export const widgetInteractiveStyles = cn(
    "cursor-pointer hover:bg-gray-50 active:bg-gray-100"
  );

  // Widget drill-down indicator
  export const drillDownIndicatorStyles = cn(
    "absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
    "text-ithq-teal-600 hover:text-ithq-teal-700"
  );

  export type WidgetSize = 'quarter' | 'half' | 'three-quarters' | 'full';

  // Widget size mappings for 4-column grid
  export const sizeClasses: Record<WidgetSize, string> = {
    'quarter': 'col-span-1',        // 1 column
    'half': 'col-span-2',           // 2 columns
    'three-quarters': 'col-span-3', // 3 columns
    'full': 'col-span-4'            // 4 columns
  };

  // Responsive size mappings
  export const responsiveSizeClasses: Record<WidgetSize, string> = {
    'quarter': 'col-span-4 sm:col-span-2 lg:col-span-1 h-full',        // Mobile: full, Tablet: half, Desktop: quarter
    'half': 'col-span-4 sm:col-span-4 lg:col-span-2 h-full',           // Mobile: full, Tablet: full, Desktop: half
    'three-quarters': 'col-span-4 sm:col-span-4 lg:col-span-3 h-full', // Mobile: full, Tablet: full, Desktop: 3/4
    'full': 'col-span-4 h-full'                                         // Full width on all devices
  };
