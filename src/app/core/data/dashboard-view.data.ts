import { DashboardViewModel } from '../models/dashboard-view.model';

/** Mock dashboard payload — replace with API response shape later. */
export const DASHBOARD_VIEW_DATA: DashboardViewModel = {
  ui: {
    missionPills: ['Structural payroll data', 'Unstructured payslip PDFs', 'Multimodal AI agent'],
    heroTaxTip: {
      headline: 'Did you know?',
      quote:
        'Most countries encourage long-term savings through registered pensions, provident funds, superannuation, or similar plans—often with a tax break when you contribute, while funds grow, or when you withdraw. Names, caps, and timing differ everywhere, so checking your local rules is how you capture the benefit.',
    },
    heroQuote:
      'Securely combine payroll tables and payslip documents for personalized salary clarity, tax simulations, and instant Q&A — your hackathon agent, in one place.',
    promo: {
      subtitle:
        'Interrogate structured compensation data alongside uploaded payslips. Simulate tax outcomes and ask document-grounded questions — widget integration coming next.',
      cta: 'Learn more',
    },
    section: {
      eyebrow: 'MVP dashboard',
      title: 'Salary clarity & tax snapshot',
      meta: 'Illustrative data · agent widget plugs in below',
    },
    cards: {
      salaryClarity: {
        title: 'Salary clarity',
        leadPrefix: 'From ',
        leadEmphasis: 'structured',
        leadSuffix: ' payroll feeds (YTD aggregates).',
        metrics: [
          { label: 'YTD gross', field: 'ytdGross' },
          { label: 'YTD tax withheld', field: 'ytdTaxWithheld' },
          { label: 'Last pay net', field: 'lastPayNet' },
        ],
      },
      taxSim: {
        title: 'Tax simulation',
        effectiveRateLabel: 'Effective rate (sample)',
      },
      payslip: {
        title: 'Latest payslip',
        metaPrefix: 'Net vs. deductions from ',
        metaEmphasis: 'document-aligned',
        metaSuffix: ' figures (demo).',
        paidDaysLabel: 'Paid days',
        lines: [
          { label: 'Gross pay', variant: 'gross', field: 'grossPay' },
          { label: 'Deductions', variant: 'ded', field: 'deductions' },
          { label: 'Net pay', variant: 'net', field: 'netPay' },
        ],
        downloadLabel: 'Download PDF',
        showLabel: 'Show amounts',
        hideLabel: 'Hide amounts',
      },
      docQa: {
        title: 'Payslip Q&A',
        bodyLead: 'Ask line-item questions grounded in uploaded payslips — powered by your ',
        bodyEmphasis: 'multimodal agent',
        bodyTail: ' (separate service).',
        badge: 'Widget slot reserved',
      },
    },
    charts: {
      withholding: {
        title: 'Withholding vs gross (YTD sample)',
        legend: 'Indexed to max month (demo)',
      },
      spark: {
        title: 'Net pay trajectory (sample)',
        legend: 'Last 12 pay periods (illustrative)',
      },
    },
    chat: {
      fabLabel: 'Assistant',
      fabTitle: 'Open AI assistant (embed your widget here)',
      panelTitle: 'Bizzy',
      placeholderTitle: 'Embed your chat widget here',
      placeholderBody:
        'This shell uses Bizzy brand colors (--chat-brand). Drop in your multimodal agent widget here when ready.',
      placeholderHint: 'Secure · document-aware · same theme',
    },
    quickLinks: [
      { label: 'Payroll data sources', href: '#' },
      { label: 'Uploaded payslips', href: '#' },
      { label: 'Tax assumptions (sample)', href: '#' },
    ],
  },
  data: {
    salaryClarity: {
      ytdGross: 27600,
      ytdTaxWithheld: 6210,
      lastPayNet: 7360,
    },
    taxSim: {
      scenarioLabel: 'Illustrative scenario · any jurisdiction',
      effectiveRatePct: 18.2,
      headline: 'Est. balance vs. withholding (sample)',
      detail: 'Based on YTD pay and withholding vs. a simple projected liability model. Rules vary by country—not tax advice.',
    },
    payslip: {
      monthLabel: 'Mar',
      year: 2026,
      paidDays: 31,
      totalDaysInMonth: 31,
      grossPay: 9200,
      deductions: 1840,
      netPay: 7360,
      currency: 'USD',
    },
    ytdBars: [
      { label: 'Jan', pct: 62 },
      { label: 'Feb', pct: 78 },
      { label: 'Mar', pct: 55 },
      { label: 'Apr', pct: 88 },
      { label: 'May', pct: 70 },
      { label: 'Jun', pct: 92 },
    ],
    sparkPcts: [40, 52, 45, 60, 58, 72, 68, 85, 80, 95, 88, 100],
  },
};
