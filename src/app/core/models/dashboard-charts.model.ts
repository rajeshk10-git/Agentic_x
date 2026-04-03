/** Shape of `assets/data/dashboard-charts.json`. */

export interface DashboardChartsJsonMeta {
  title: string;
  description: string;
}

export interface DashboardChartsWithholding {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

export interface DashboardChartsNetPayTrend {
  labels: string[];
  data: number[];
  subtitle: string;
}

export interface DashboardChartsSalaryComposition {
  labels: string[];
  data: number[];
  footnote: string;
}

export interface DashboardChartsYtdCashflow {
  labels: string[];
  inflow: number[];
  outflowTax: number[];
}

export interface DashboardChartsJson {
  meta: DashboardChartsJsonMeta;
  withholdingVsGross: DashboardChartsWithholding;
  netPayTrend: DashboardChartsNetPayTrend;
  salaryComposition: DashboardChartsSalaryComposition;
  ytdCashflow: DashboardChartsYtdCashflow;
}
