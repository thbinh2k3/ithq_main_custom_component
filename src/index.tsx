import React from 'react'
import { type FC } from 'react'
import './base.css'
import { Retool } from '@tryretool/custom-component-support'
import { Button } from './components/ui/button'
import { BarChart, PieChart } from './components/widgets'
import { BarDataPoint, StackedBarDataPoint } from './components/ui/BarChart'
import { PieDataPoint } from './components/ui/PieChart'
import { LineChart, LineDataPoint } from './components/ui/LineChart'


const cssVariables = {
  "height": "100%",
  "--background": "#ffffff",
  "--foreground": "#161616",

  "--card": "#ffffff",
  "--card-foreground": "#161616",

  "--popover": "#ffffff",
  "--popover-foreground": "#161616",

  "--primary": "#007D8E",
  "--primary-foreground": "#ffffff",

  "--secondary": "#F46235",
  "--secondary-foreground": "#ffffff",

  "--muted": "#F3F4F6",
  "--muted-foreground": "#6B7280",

  "--accent": "#FFB000",
  "--accent-foreground": "#161616",

  "--destructive": "#DC2626",
  "--destructive-foreground": "#ffffff",

  "--border": "#E5E7EB",
  "--input": "#E5E7EB",
  "--ring": "#007D8E",

  "--radius": "1rem",

  "--ithq-teal": "#007D8E",
  "--ithq-teal-light": "#40A4B1",
  "--ithq-teal-lighter": "#80BECA",
  "--ithq-teal-lightest": "#BFD9E2",

  "--ithq-orange": "#F46235",
  "--ithq-orange-light": "#F6815A",
  "--ithq-orange-lighter": "#FAB19A",
  "--ithq-orange-lightest": "#FCD8CA",

  "--ithq-yellow": "#FFB000",
  "--ithq-yellow-light": "#FFC340",
  "--ithq-yellow-lighter": "#FFD780",
  "--ithq-yellow-lightest": "#FFEBBF",

  "--ithq-dark-teal": "#064A55",
  "--ithq-blue-grey": "#28627B",
  "--ithq-red-orange": "#F6360B",

  "--success": "#16A34A",
  "--success-foreground": "#ffffff",
  "--warning": "#FFB000",
  "--warning-foreground": "#161616",
  "--error": "#DC2626",
  "--error-foreground": "#ffffff",
  "--info": "#007D8E",
  "--info-foreground": "#ffffff"
}


export const RetoolBarChart: FC = () => {
  // --- 1. Map Props to Retool State ---
  // Các state này sẽ hiển thị trong Inspector của Retool

  const [title, _setTitle] = Retool.useStateString({
    name: "title",
    label: "Title",
    initialValue: "Chart Title",
    description: "The main title of the chart.",
  });

  const [subtitle, _setSubtitle] = Retool.useStateString({
    name: "subtitle",
    label: "Subtitle",
    initialValue: "Chart subtitle",
    description: "A short description appearing below the title.",
  });

  const [data, _setData] = Retool.useStateArray({
    name: "data",
    label: "Chart Data",
    description: "Array of data points to display. E.g., {{ query1.data }}",
    initialValue: [
      { label: "Jan", value: 120 },
      { label: "Feb", value: 250 },
      { label: "Mar", value: 180 },
    ],
  });

  const [orientation, _setOrientation] = Retool.useStateEnumeration({
    name: "orientation",
    label: "Orientation",
    enumDefinition: ["vertical", "horizontal"],
    initialValue: "vertical",
    inspector: "segmented",
  });

  // const [isStacked, _setIsStacked] = Retool.useStateBoolean({
  //   name: "isStacked",
  //   label: "Stacked Bars",
  //   initialValue: false,
  //   inspector: "checkbox",
  // });

  const [showValues, _setShowValues] = Retool.useStateBoolean({
    name: "showValues",
    label: "Show Values on Bars",
    initialValue: true,
    inspector: "checkbox",
  });

  // const [maxBars, _setMaxBars] = Retool.useStateNumber({
  //   name: "maxBars",
  //   label: "Max Bars to Display",
  //   initialValue: 10,
  // });

  // --- 2. Handle Events ---

  // State này sẽ lưu dữ liệu của thanh/cột vừa được click.
  // Nó sẽ bị ẩn khỏi Inspector, chỉ dùng để truy cập trong Retool.
  const [clickedBarData, setClickedBarData] = Retool.useStateObject({
    name: "clickedBarData",
    inspector: "hidden",
  });

  // Tạo một event handler tên là 'barClick' trong Retool.
  const onBarClickEvent = Retool.useEventCallback({ name: "barClick" });

  // Hàm này sẽ được gọi bởi component BarChart khi một thanh được click.
  const handleBarClick = (
    dataPoint: BarDataPoint | StackedBarDataPoint,
    segmentIndex?: number
  ) => {
    // Tạo một object mới chứa cả dữ liệu của điểm và chỉ số của segment (nếu có)
    const clickedData = {
      ...dataPoint,
      // Thêm segmentIndex vào object để Retool có thể truy cập
      clickedSegmentIndex: segmentIndex,
    };

    // 1. Cập nhật state `clickedBarData` với dữ liệu mới.
    setClickedBarData(clickedData);

    // 2. Kích hoạt event 'barClick' trong Retool.
    onBarClickEvent();
  };

  // --- 3. Set Default Size ---
  Retool.useComponentSettings({
    defaultWidth: 12, // Chiếm toàn bộ chiều rộng
    defaultHeight: 8,
  });


  // --- 4. Render the component ---
  return (
    <BarChart
      // Truyền các giá trị từ Retool state vào props của component
      title={title}
      subtitle={subtitle}
      data={Array.isArray(data) ? data : []} // Đảm bảo data luôn là một mảng
      orientation={orientation as "vertical" | "horizontal"}
      //isStacked={isStacked}
      showValues={showValues}
      //maxBars={maxBars}
      // Truyền hàm xử lý sự kiện của chúng ta vào prop onBarClick
      onBarClick={handleBarClick}
    />
    //</WrapperComponent>
  );
};


const WrapperComponent = ({
  cssVariables,
  children
}: {
  cssVariables: Record<string, string>
  children: React.ReactNode
}) => {
  return (
    <div
      style={{
        ...Object.fromEntries(
          Object.entries(cssVariables).map(([k, v]) => [k, v])
        )
      }}
    >
      {children}
    </div>
  )
}

export const RetoolPieChart: FC = () => {
  // --- 1. Map Props to Retool State ---
  const [title, _setTitle] = Retool.useStateString({
    name: "title",
    label: "Title",
    initialValue: "Sales by Category",
  });

  const [subtitle, _setSubtitle] = Retool.useStateString({
    name: "subtitle",
    label: "Subtitle",
    initialValue: "Current fiscal year",
  });

  const [data, _setData] = Retool.useStateArray({
    name: "data",
    label: "Chart Data",
    description: "Array of data points. Must have 'label' and 'value'. E.g. {{ query1.data }}",
    initialValue: [
      { label: "Electronics", value: 4500 },
      { label: "Clothing", value: 2700 },
      { label: "Groceries", value: 8200 },
      { label: "Books", value: 1200 },
    ],
  });

  const [variant, _setVariant] = Retool.useStateEnumeration({
    name: "variant",
    label: "Chart Type",
    enumDefinition: ["pie", "doughnut"],
    initialValue: "doughnut",
    inspector: "segmented",
  });

  // **THIẾU**: showPercentages - thêm vào
  const [showPercentages, _setShowPercentages] = Retool.useStateBoolean({
    name: "showPercentages",
    label: "Show Percentages",
    initialValue: true,
    inspector: "checkbox",
    description: "Toggles the display of percentages in tooltips or labels",
  });

  const [showLegend, _setShowLegend] = Retool.useStateBoolean({
    name: "showLegend",
    label: "Show Legend",
    initialValue: true,
    inspector: "checkbox",
  });

  const [centerLabel, _setCenterLabel] = Retool.useStateString({
    name: "centerLabel",
    label: "Center Label",
    description: "Text shown in the center of a doughnut chart."
  });

  const [centerValue, _setCenterValue] = Retool.useStateString({
    name: "centerValue",
    label: "Center Value",
    description: "Value shown in the center of a doughnut chart."
  });

  // --- 2. Handle Events ---
  const [clickedSliceData, setClickedSliceData] = Retool.useStateObject({
    name: "clickedSliceData",
    inspector: "hidden", // Ẩn khỏi Inspector
  });

  const onSliceClickEvent = Retool.useEventCallback({ name: "sliceClick" });

  const handleSliceClick = (dataPoint: PieDataPoint) => {
    // 1. Cập nhật state với dữ liệu của lát bánh vừa được click
    setClickedSliceData(dataPoint);
    // 2. Kích hoạt event 'sliceClick' trong Retool
    onSliceClickEvent();
  };

  // --- 3. Set Default Size ---
  Retool.useComponentSettings({
    defaultWidth: 6,
    defaultHeight: 8,
  });

  // --- 4. Render the component ---
  return (
    // <WrapperComponent
    //   cssVariables={cssVariables}
    // >
    <PieChart
      title={title}
      subtitle={subtitle}
      data={Array.isArray(data) ? (data as PieDataPoint[]) : []}
      variant={variant as "pie" | "doughnut"}
      showPercentages={showPercentages} // **THÊM** prop này vào
      showLegend={showLegend}
      centerLabel={centerLabel}
      centerValue={centerValue}
      onSliceClick={handleSliceClick}
    />
    //</WrapperComponent>
  );
};

export const RetoolLineChart: FC = () => {
  // Component settings - set default size when dragged onto canvas
  Retool.useComponentSettings({
    defaultWidth: 12, // Full width
    defaultHeight: 20, // Reasonable height for chart
  });

  // Chart configuration properties
  const [title] = Retool.useStateString({
    name: "title",
    initialValue: "Line Chart",
    label: "Chart Title",
    description: "The main title displayed on the chart",
  });

  const [subtitle] = Retool.useStateString({
    name: "subtitle",
    initialValue: "",
    label: "Subtitle",
    description: "Optional subtitle displayed below the title",
  });

  // Chart data - main line data
  const [data] = Retool.useStateArray({
    name: "data",
    initialValue: [
      { timestamp: "2024-01-01", value: 100 },
      { timestamp: "2024-01-02", value: 120 },
      { timestamp: "2024-01-03", value: 90 },
    ],
    label: "Chart Data",
    description: "Array of data points with timestamp and value properties",
  });

  // Multi-line data (optional)
  const [multiLineData] = Retool.useStateObject({
    name: "multiLineData",
    initialValue: {},
    label: "Multi-line Data",
    description: "Object with series names as keys and data arrays as values",
  });

  // **THỪA**: Chart size - comment lại vì LineChart không có prop size
  // const [size] = Retool.useStateEnumeration({
  //   name: "size",
  //   enumDefinition: ["half", "three-quarters", "full"],
  //   initialValue: "full",
  //   enumLabels: {
  //     "half": "Half Width",
  //     "three-quarters": "Three Quarters Width",
  //     "full": "Full Width"
  //   },
  //   inspector: "select",
  //   label: "Chart Size",
  //   description: "The width of the chart widget",
  // });

  // Visual options
  const [showArea] = Retool.useStateBoolean({
    name: "showArea",
    initialValue: true, // **SỬA**: default thành false theo specs
    label: "Show Area Fill",
    description: "Display filled area under the line",
    inspector: "checkbox",
  });

  const [showPoints] = Retool.useStateBoolean({
    name: "showPoints",
    initialValue: true,
    label: "Show Data Points",
    description: "Display individual data points on the line",
    inspector: "checkbox",
  });

  // Time format - using literal array
  const [timeFormat] = Retool.useStateEnumeration({
    name: "timeFormat",
    enumDefinition: ["date", "datetime", "time"],
    initialValue: "date",
    enumLabels: {
      "date": "Date Only",
      "datetime": "Date & Time",
      "time": "Time Only"
    },
    inspector: "select",
    label: "Time Format",
    description: "How to display time values",
  });

  // **THỪA**: Drill-down settings - comment lại vì LineChart không có prop isDrillDownEnabled
  // const [isDrillDownEnabled] = Retool.useStateBoolean({
  //   name: "isDrillDownEnabled",
  //   initialValue: true,
  //   label: "Enable Drill Down",
  //   description: "Allow clicking on data points for drill-down",
  //   inspector: "checkbox",
  // });

  // Event handlers
  const onPointClick = Retool.useEventCallback({
    name: "pointClick"
  });

  const onRangeSelect = Retool.useEventCallback({
    name: "rangeSelect"
  });

  // State to store clicked point data for access in event handlers
  const [clickedPoint, setClickedPoint] = Retool.useStateObject({
    name: "clickedPoint",
    initialValue: {},
    inspector: "hidden",
    description: "Data of the last clicked point",
  });

  const [selectedRange, setSelectedRange] = Retool.useStateObject({
    name: "selectedRange",
    initialValue: {},
    inspector: "hidden",
    description: "Selected date range data",
  });

  // Value formatter function
  const valueFormatter = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  // Handle point click events
  const handlePointClick = (dataPoint: LineDataPoint, seriesName?: string) => {
    // Store clicked point data in component state
    setClickedPoint({
      timestamp: dataPoint.timestamp,
      value: dataPoint.value,
      label: dataPoint.label || '',
      seriesName: seriesName || '',
      metadata: dataPoint.metadata || {}
    });

    // Trigger Retool event
    onPointClick();
  };

  // Handle range selection events  
  const handleRangeSelect = (startDate: string, endDate: string) => {
    // Store selected range in component state
    setSelectedRange({
      startDate,
      endDate
    });

    // Trigger Retool event
    onRangeSelect();
  };

  // Convert data to proper format
  const chartData: LineDataPoint[] = Array.isArray(data)
    ? data.map((item: any) => ({
      timestamp: item.timestamp || item.date || item.time,
      value: Number(item.value) || 0,
      label: item.label,
      metadata: item.metadata
    }))
    : [];

  // Convert multi-line data
  const chartMultiLineData = multiLineData && Object.keys(multiLineData).length > 0
    ? Object.entries(multiLineData).reduce((acc: { [key: string]: LineDataPoint[] }, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value.map((item: any) => ({
          timestamp: item.timestamp || item.date || item.time,
          value: Number(item.value) || 0,
          label: item.label,
          metadata: item.metadata
        }));
      }
      return acc;
    }, {})
    : undefined;

  // **THỪA**: Type assertion cho size - comment lại
  // const chartSize = size as "half" | "three-quarters" | "full";
  const chartTimeFormat = timeFormat as "date" | "datetime" | "time";

  return (
    <LineChart
      // **THỪA**: size prop - comment lại
      // size={chartSize}
      title={title}
      subtitle={subtitle || undefined}
      data={chartData}
      multiLine={chartMultiLineData}
      showArea={showArea}
      showPoints={showPoints}
      timeFormat={chartTimeFormat}
      valueFormatter={valueFormatter}
      // **SỬA**: Loại bỏ condition isDrillDownEnabled vì không có prop này
      onPointClick={handlePointClick}
      onRangeSelect={handleRangeSelect}
    // **THỪA**: isDrillDownEnabled prop - comment lại
    // isDrillDownEnabled={isDrillDownEnabled}
    />
  );
};
