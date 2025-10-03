import React from 'react';

// Base interfaces for drill-down data
export interface DrillDownContext {
  widget: {
    title: string;
    type: 'kpi' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'data-table';
    originalData?: unknown;
  };
  filter: {
    label: string;
    value: string | number;
    context?: Record<string, unknown>;
  };
  timestamp: Date;
}

export interface DrillDownSummary {
  title: string;
  description?: string;
  kpis: Array<{
    label: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  filters: Array<{
    label: string;
    value: string;
  }>;
}

export interface DrillDownContent {
  summary: DrillDownSummary;
  charts?: Array<{
    id: string;
    type: 'bar' | 'line' | 'pie';
    title: string;
    data: unknown[];
    config?: Record<string, unknown>;
  }>;
  table?: {
    title: string;
    data: unknown[];
    columns: Array<{
      key: string;
      header: string;
      sortable?: boolean;
      render?: (value: unknown) => React.ReactNode;
    }>;
  };
}

// Utility function to create drill-down context
export const createDrillDownContext = (
  widget: DrillDownContext['widget'],
  filter: DrillDownContext['filter']
): DrillDownContext => ({
  widget,
  filter,
  timestamp: new Date()
});

// Sample data generators for demonstration
export const generateDrillDownContent = (
  context: DrillDownContext
): DrillDownContent => {
  const baseTitle = `${context.filter.label}: ${context.filter.value}`;
  
  // Generate sample KPIs based on widget type
  const generateKPIs = (): DrillDownSummary['kpis'] => {
    return [
      {
        label: 'Total Value',
        value: Math.floor(Math.random() * 1000000),
        change: Math.floor(Math.random() * 20) - 10,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      {
        label: 'Count',
        value: Math.floor(Math.random() * 5000),
        change: Math.floor(Math.random() * 15) - 7,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }
    ];
  };

  // Generate sample charts
  const generateCharts = () => {
    return [
      {
        id: 'trend',
        type: 'line' as const,
        title: 'Trend Over Time',
        data: Array.from({ length: 12 }, (_, i) => ({
          timestamp: new Date(2024, i, 1).toISOString(),
          date: new Date(2024, i, 1).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 1000) + 500
        }))
      },
      {
        id: 'breakdown',
        type: 'pie' as const,
        title: 'Breakdown by Category',
        data: [
          { label: 'Category A', value: Math.floor(Math.random() * 100) + 50 },
          { label: 'Category B', value: Math.floor(Math.random() * 100) + 30 },
          { label: 'Category C', value: Math.floor(Math.random() * 100) + 20 }
        ]
      }
    ];
  };

  // Generate sample table data
  const generateTable = () => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 10000),
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      status: ['Active', 'Pending', 'Completed'][Math.floor(Math.random() * 3)]
    }));

    const columns = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'value', header: 'Value', sortable: true, render: (value: unknown) => `$${Number(value).toLocaleString()}` },
      { key: 'category', header: 'Category', sortable: true },
      { key: 'date', header: 'Date', sortable: true },
      { key: 'status', header: 'Status', sortable: true }
    ];

    return { title: 'Detailed Data', data, columns };
  };

  return {
    summary: {
      title: `Analysis: ${baseTitle}`,
      description: `Detailed breakdown and analysis for the selected ${context.filter.label.toLowerCase()}.`,
      kpis: generateKPIs(),
      filters: [
        { label: context.filter.label, value: String(context.filter.value) },
        { label: 'Time Period', value: 'Last 12 months' },
        { label: 'Status', value: 'All' }
      ]
    },
    charts: generateCharts(),
    table: generateTable()
  };
};
