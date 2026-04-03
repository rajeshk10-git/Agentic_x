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
    data: [6850, 6920, 7010, 6980, 7120, 7240, 7180, 7290, 7310, 7360, 7340, 7380],
    subtitle: 'Last 12 pay periods · illustrative USD',
  },
  salaryComposition: {
    labels: ['YTD gross', 'YTD tax withheld', 'Benefits & other'],
    data: [27600, 6210, 3180],
    footnote: 'Structured payroll aggregates (demo)',
  },
  ytdCashflow: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4 (proj.)'],
    inflow: [24800, 26100, 27300, 28500],
    outflowTax: [5580, 5920, 6100, 6280],
  },
};
