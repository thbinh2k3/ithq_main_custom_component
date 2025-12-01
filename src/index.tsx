import React, { useEffect } from 'react'
import { type FC } from 'react'
import './base.css'
import { Retool } from '@tryretool/custom-component-support'
import { Button } from './components/ui/button'
import { BarChart, PieChart } from './components/widgets'
import { BarDataPoint, StackedBarDataPoint } from './components/ui/BarChart'
import { PieDataPoint } from './components/ui/PieChart'
import { LineChart, LineDataPoint } from './components/ui/LineChart'
import { Gauge } from './components/ui/Gauge'
import { StackedBarChart, StackedBarChartDataPoint } from './components/ui/StackBarChart'
import { Activity, GaugeCircle } from 'lucide-react'


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


// export const RetoolBarChart: FC = () => {
//   const [title, _setTitle] = Retool.useStateString({
//     name: "title",
//     label: "Title",
//     initialValue: "Chart Title",
//     description: "The main title of the chart.",
//   });

//   const [subtitle, _setSubtitle] = Retool.useStateString({
//     name: "subtitle",
//     label: "Subtitle",
//     initialValue: "Chart subtitle",
//     description: "A short description appearing below the title.",
//   });

//   const [data, _setData] = Retool.useStateArray({
//     name: "data",
//     label: "Chart Data",
//     description: "Array of data points to display. E.g., {{ query1.data }}",
//     initialValue: [
//       { label: "Jan", value: 120 },
//       { label: "Feb", value: 250 },
//       { label: "Mar", value: 180 },
//     ],
//   });

//   const [orientation, _setOrientation] = Retool.useStateEnumeration({
//     name: "orientation",
//     label: "Orientation",
//     enumDefinition: ["vertical", "horizontal"],
//     initialValue: "vertical",
//     inspector: "segmented",
//   });

//   const [showValues, _setShowValues] = Retool.useStateBoolean({
//     name: "showValues",
//     label: "Show Values on Bars",
//     initialValue: true,
//     inspector: "checkbox",
//   });

//   const [clickedBarData, setClickedBarData] = Retool.useStateObject({
//     name: "clickedBarData",
//     inspector: "hidden",
//   });

//   const onBarClickEvent = Retool.useEventCallback({ name: "barClick" });

//   const handleBarClick = (
//     dataPoint: BarDataPoint | StackedBarDataPoint,
//     segmentIndex?: number
//   ) => {
//     const clickedData = {
//       ...dataPoint,
//       clickedSegmentIndex: segmentIndex,
//     };
//     setClickedBarData(clickedData);
//     onBarClickEvent();
//   };

//   Retool.useComponentSettings({
//     defaultWidth: 12,
//     defaultHeight: 8,
//   });

//   return (
//     <WrapperComponent cssVariables={cssVariables}>
//       <BarChart
//         title={title}
//         subtitle={subtitle}
//         data={Array.isArray(data) ? data : []}
//         orientation={orientation as "vertical" | "horizontal"}
//         showValues={showValues}
//         onBarClick={handleBarClick}
//       />
//     </WrapperComponent>
//   );
// };


// const WrapperComponent = ({
//   cssVariables,
//   children
// }: {
//   cssVariables: Record<string, string>
//   children: React.ReactNode
// }) => {
//   useEffect(() => {
//     document.body.style.background = "transparent"
//     Object.entries(cssVariables).forEach(([key, value]) => {
//       document.body.style.setProperty(key, value)
//     })
//   }, [])
//   return (
//     <div
//       style={{
//         backgroundColor: "transparent",
//         ...Object.fromEntries(
//           Object.entries(cssVariables).map(([k, v]) => [k, v])
//         )
//       }}
//     >
//       {children}
//     </div>
//   )
// }


export const RetoolBarChart: FC = () => {
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

  // 💡 THÊM INPUT MỚI CHO NHÃN TRỤC Y/GIÁ TRỊ
  const [metricLabel, _setMetricLabel] = Retool.useStateString({
    name: "metricLabel",
    label: "Metric Axis Label (Y/X)",
    initialValue: "Value", // Đặt giá trị mặc định, ví dụ: "hours" hoặc "revenue"
    description: "Label displayed on the value axis (Y for vertical, X for horizontal).",
  });
  // ---

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

  const [showValues, _setShowValues] = Retool.useStateBoolean({
    name: "showValues",
    label: "Show Values on Bars",
    initialValue: true,
    inspector: "checkbox",
  });

  const [clickedBarData, setClickedBarData] = Retool.useStateObject({
    name: "clickedBarData",
    inspector: "hidden",
  });

  const onBarClickEvent = Retool.useEventCallback({ name: "barClick" });

  const handleBarClick = (
    dataPoint: BarDataPoint | StackedBarDataPoint,
    segmentIndex?: number
  ) => {
    const clickedData = {
      ...dataPoint,
      clickedSegmentIndex: segmentIndex,
    };
    setClickedBarData(clickedData);
    onBarClickEvent();
  };

  Retool.useComponentSettings({
    defaultWidth: 12,
    defaultHeight: 8,
  });

  return (
    <WrapperComponent cssVariables={cssVariables}>
      <BarChart
        title={title}
        subtitle={subtitle}
        data={Array.isArray(data) ? data : []}
        orientation={orientation as "vertical" | "horizontal"}
        // 💡 TRUYỀN PROP VÀO COMPONENT BARCHART
        yAxisUnit={metricLabel}
        // ---
        showValues={showValues}
        onBarClick={handleBarClick}
      />
    </WrapperComponent>
  );
};


// (WrapperComponent giữ nguyên)
const WrapperComponent = ({
  cssVariables,
  children
}: {
  cssVariables: Record<string, string>
  children: React.ReactNode
}) => {
  useEffect(() => {
    document.body.style.background = "transparent"
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.body.style.setProperty(key, value)
    })
  }, [])
  return (
    <div
      style={{
        backgroundColor: "transparent",
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

  const [clickedSliceData, setClickedSliceData] = Retool.useStateObject({
    name: "clickedSliceData",
    inspector: "hidden",
  });

  const onSliceClickEvent = Retool.useEventCallback({ name: "sliceClick" });

  const handleSliceClick = (dataPoint: PieDataPoint) => {
    setClickedSliceData(dataPoint);
    onSliceClickEvent();
  };

  Retool.useComponentSettings({
    defaultWidth: 6,
    defaultHeight: 8,
  });

  return (
    <WrapperComponent cssVariables={cssVariables}>
      <PieChart
        title={title}
        subtitle={subtitle}
        data={Array.isArray(data) ? (data as PieDataPoint[]) : []}
        variant={variant as "pie" | "doughnut"}
        showPercentages={showPercentages}
        showLegend={showLegend}
        centerLabel={centerLabel}
        centerValue={centerValue}
        onSliceClick={handleSliceClick}
      />
    </WrapperComponent>
  );
};

export const RetoolLineChart: FC = () => {
  Retool.useComponentSettings({
    defaultWidth: 12,
    defaultHeight: 20,
  });

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

  const [multiLineData] = Retool.useStateObject({
    name: "multiLineData",
    initialValue: {},
    label: "Multi-line Data",
    description: "Object with series names as keys and data arrays as values",
  });

  const [showArea] = Retool.useStateBoolean({
    name: "showArea",
    initialValue: false,
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

  const onPointClick = Retool.useEventCallback({
    name: "pointClick"
  });

  const onRangeSelect = Retool.useEventCallback({
    name: "rangeSelect"
  });

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

  const valueFormatter = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const handlePointClick = (dataPoint: LineDataPoint, seriesName?: string) => {
    setClickedPoint({
      timestamp: dataPoint.timestamp,
      value: dataPoint.value,
      label: dataPoint.label || '',
      seriesName: seriesName || '',
      metadata: dataPoint.metadata || {}
    });
    onPointClick();
  };

  const handleRangeSelect = (startDate: string, endDate: string) => {
    setSelectedRange({
      startDate,
      endDate
    });
    onRangeSelect();
  };

  const chartData: LineDataPoint[] = Array.isArray(data)
    ? data.map((item: any) => ({
      timestamp: item.timestamp || item.date || item.time,
      value: Number(item.value) || 0,
      label: item.label,
      metadata: item.metadata
    }))
    : [];

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

  const chartTimeFormat = timeFormat as "date" | "datetime" | "time";

  return (
    <WrapperComponent cssVariables={cssVariables}>
      <LineChart
        title={title}
        subtitle={subtitle || undefined}
        data={chartData}
        multiLine={chartMultiLineData}
        showArea={showArea}
        showPoints={showPoints}
        timeFormat={chartTimeFormat}
        valueFormatter={valueFormatter}
        onPointClick={handlePointClick}
        onRangeSelect={handleRangeSelect}
      />
    </WrapperComponent>
  );
};

// ========================================
// NEW COMPONENT 1: StackedBarChart
// ========================================
export const RetoolStackedBarChart: FC = () => {
  Retool.useComponentSettings({
    defaultWidth: 12,
    defaultHeight: 10,
  });

  const [title] = Retool.useStateString({
    name: "title",
    label: "Title",
    initialValue: "Billable/Non-billable time cards by Person", // Cập nhật theo requirement
    description: "The main title of the stacked bar chart.",
  });

  const [subtitle] = Retool.useStateString({
    name: "subtitle",
    label: "Subtitle",
    initialValue: "Tracks billable and non-billable time cards by Person.", // Cập nhật theo requirement
    description: "Optional subtitle for the chart.",
  });

  const [data] = Retool.useStateArray({
    name: "data",
    label: "Chart Data",
    description: "Array of objects with category and series data. E.g. {{ query1.data }}",
    // Cập nhật Dữ liệu Mẫu (Mở rộng từ dữ liệu bạn cung cấp)
    initialValue: [
      { "full_name": "Alice", "billable_flag_TRUE": 15, "billable_flag_FALSE": 5 },
      { "full_name": "Bob", "billable_flag_TRUE": 18, "billable_flag_FALSE": 2 },
      { "full_name": "Charlie", "billable_flag_TRUE": 12, "billable_flag_FALSE": 8 },
      { "full_name": "Diana", "billable_flag_TRUE": 20, "billable_flag_FALSE": 0 },
      { "full_name": "Eve", "billable_flag_TRUE": 10, "billable_flag_FALSE": 10 },
      { "full_name": "Frank", "billable_flag_TRUE": 16, "billable_flag_FALSE": 4 },
    ],
  });

  const [categoryKey] = Retool.useStateString({
    name: "categoryKey",
    label: "Category Key",
    initialValue: "full_name",
    description: "The key in data objects that represents categories (e.g., 'full_name')",
  });

  const [seriesKeys] = Retool.useStateArray({
    name: "seriesKeys",
    label: "Series Keys",
    description: "Array of keys that represent the stacked segments",
    // Cập nhật Keys theo logic Billable/Non-billable: TRUE/FALSE
    initialValue: ["billable_flag_TRUE", "billable_flag_FALSE"],
  });

  const [orientation] = Retool.useStateEnumeration({
    name: "orientation",
    label: "Orientation",
    enumDefinition: ["vertical", "horizontal"],
    initialValue: "vertical",
    inspector: "segmented",
  });

  const [showLegend] = Retool.useStateBoolean({
    name: "showLegend",
    label: "Show Legend",
    initialValue: true,
    inspector: "checkbox",
  });

  const [showTooltips] = Retool.useStateBoolean({
    name: "showTooltips",
    label: "Show Tooltips",
    initialValue: true,
    inspector: "checkbox",
  });

  // CHỈNH SỬA: Đặt giá trị mặc định là TRUE theo yêu cầu Trục Y
  const [showYAxis] = Retool.useStateBoolean({
    name: "showYAxis",
    label: "Show Y-Axis",
    initialValue: true,
    inspector: "checkbox",
    description: "Display the numerical axis on the left of the chart."
  });

  // CHỈNH SỬA: Đặt giá trị mặc định là 'hours' theo yêu cầu đơn vị giờ
  const [yAxisUnit] = Retool.useStateString({
    name: "yAxisUnit",
    label: "Y-Axis Unit",
    initialValue: "hours",
    description: "The unit label for the Y-Axis (e.g., 'hours', '$', 'count')."
  });

  const [clickedSegment, setClickedSegment] = Retool.useStateObject({
    name: "clickedSegment",
    inspector: "hidden",
    description: "Data of the last clicked segment",
  });

  const onSegmentClickEvent = Retool.useEventCallback({ name: "segmentClick" });

  const handleSegmentClick = (dataPoint: { category: string; series: string; value: number }) => {
    setClickedSegment(dataPoint);
    onSegmentClickEvent();
  };

  return (
    <WrapperComponent cssVariables={cssVariables}>
      <StackedBarChart
        title={title}
        subtitle={subtitle}
        data={Array.isArray(data) ? (data as StackedBarChartDataPoint[]) : []}
        categoryKey={categoryKey}
        seriesKeys={Array.isArray(seriesKeys) ? seriesKeys.map(String) : []}
        orientation={orientation as "vertical" | "horizontal"}
        showLegend={showLegend}
        showTooltips={showTooltips}
        showYAxis={showYAxis}
        yAxisUnit={yAxisUnit}
        onSegmentClick={handleSegmentClick}
      />
    </WrapperComponent>
  );
};
// ========================================
// NEW COMPONENT 2: Gauge
// ========================================
export const RetoolGauge: FC = () => {
  Retool.useComponentSettings({
    defaultWidth: 6,
    defaultHeight: 10,
  });

  const [title] = Retool.useStateString({
    name: "title",
    label: "Title",
    initialValue: "Outstanding Value",
    description: "Optional title displayed above the gauge.",
  });

  const [subtitle] = Retool.useStateString({
    name: "subtitle",
    label: "Subtitle",
    initialValue: "Key performance indicator",
    description: "Optional subtitle displayed below the title.",
  });

  const [value] = Retool.useStateNumber({
    name: "value",
    label: "Current Value",
    initialValue: 65,
    description: "The current value to display on the gauge.",
  });

  const [maxValue] = Retool.useStateNumber({
    name: "maxValue",
    label: "Max Value",
    initialValue: 100,
    description: "The maximum value of the gauge scale.",
  });

  const [label] = Retool.useStateString({
    name: "label",
    label: "Label",
    initialValue: "Progress",
    description: "Descriptive label displayed below the value.",
  });

  const [showPercentage] = Retool.useStateBoolean({
    name: "showPercentage",
    label: "Show Percentage",
    initialValue: true,
    inspector: "checkbox",
    description: "Display the value as a percentage of max value.",
  });

  const [colorThresholds] = Retool.useStateArray({
    name: "colorThresholds",
    label: "Color Thresholds",
    description: "Array of threshold objects with 'value' and 'color' properties. E.g. [{ value: 50, color: '#FF0000' }]",
    initialValue: [
      { value: 0, color: "#DC2626" },
      { value: 50, color: "#FFB000" },
      { value: 75, color: "#16A34A" },
    ],
  });

  const [useSolidColor] = Retool.useStateBoolean({
    name: "useSolidColor",
    label: "Use Solid Colors",
    initialValue: false,
    inspector: "checkbox",
    description: "Enable solid colors mode. When OFF: smooth gradient transition. When ON: discrete solid colors.",
  });

  const colorMode = useSolidColor ? "solid" : "gradient";

  const [showCheckpoints] = Retool.useStateBoolean({
    name: "showCheckpoints",
    label: "Show Checkpoints",
    initialValue: true,
    inspector: "checkbox",
    description: "Display threshold lines on the gauge arc for overview.",
  });

  const [clickedGauge, setClickedGauge] = Retool.useStateObject({
    name: "clickedGauge",
    inspector: "hidden",
    description: "Data captured when gauge is clicked",
  });

  const onGaugeClickEvent = Retool.useEventCallback({ name: "gaugeClick" });

  const handleGaugeClick = () => {
    setClickedGauge({
      value,
      maxValue,
      percentage: (value / maxValue) * 100,
      timestamp: new Date().toISOString(),
    });
    onGaugeClickEvent();
  };

  return (
    <WrapperComponent cssVariables={cssVariables}>
      <Gauge
        title={title}
        subtitle={subtitle}
        value={value}
        maxValue={maxValue}
        label={label}
        showPercentage={showPercentage}
        colorThresholds={Array.isArray(colorThresholds) ? colorThresholds : []}
        colorMode={colorMode}
        onClick={handleGaugeClick}
        showCheckpoints={showCheckpoints}
      />
    </WrapperComponent>
  );
};