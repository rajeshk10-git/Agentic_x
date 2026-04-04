import { DashboardChartsJson } from '../models/dashboard-charts.model';

/** Used when `assets/data/dashboard-charts.json` fails to load. */
export const DASHBOARD_CHARTS_FALLBACK: DashboardChartsJson = {
  meta: {
    title: 'Dashboard chart fixtures',
    description: 'Inline fallback',
  },
  withholdingVsGross: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      { label: 'Gross (indexed to peak month)', data: [62, 78, 55, 88, 70, 92, 68, 85] },
      { label: 'Withholding (indexed)', data: [14, 18, 12, 20, 16, 21, 15, 19] },
    ],
  },
  netPayTrend: {
    labels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12'],
    data: [568550, 574360, 579830, 577340, 590960, 600920, 595940, 605070, 607730, 610880, 609220, 612540],
    subtitle: 'Last 12 pay periods · illustrative INR',
  },
  salaryComposition: {
    labels: ['YTD gross', 'YTD tax withheld', 'Benefits & other'],
    data: [2290800, 515430, 263940],
    footnote: 'Structured payroll aggregates (demo)',
  },
  ytdCashflow: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4 (proj.)'],
    inflow: [2058400, 2166300, 2265900, 2365500],
    outflowTax: [463140, 491360, 506300, 521240],
  },
};
