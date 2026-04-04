import { DashboardViewModel } from '../models/dashboard-view.model';

/** Default dashboard payload when the API is unavailable — tune copy and figures for your tenant. */
export const DASHBOARD_VIEW_DATA: DashboardViewModel = {
  ui: {
    missionPills: ['Payroll integrations', 'Payslip intelligence', 'AI assistant'],
    heroTaxTip: {
      headline: 'Did you know?',
      quote:
        'Many employers offer pre-tax retirement contributions, commuter benefits, or health premiums that lower taxable income before withholding is calculated. Eligibility and limits depend on your plan and location—your HR or payroll team can confirm what applies to you.',
    },
    heroQuote:
      'See your compensation in one place: year-to-date earnings, estimated tax posture, and your latest payslip—plus answers from your assistant when you need them.',
    promo: {
      subtitle:
        'Explore how structured payroll data and payslip documents work together for clearer take-home insight. Open the assistant anytime for grounded Q&A on your numbers.',
      cta: 'Learn more',
    },
    section: {
      eyebrow: 'Overview',
      title: 'Salary clarity & tax snapshot',
      meta: 'Figures reflect your connected payroll period · refreshed with each pay run',
    },
    cards: {
      salaryClarity: {
        title: 'Salary clarity',
        leadPrefix: 'Totals from your ',
        leadEmphasis: 'connected payroll',
        leadSuffix: ' feed (year-to-date through the current period).',
        metrics: [
          { label: 'YTD gross', field: 'ytdGross' },
          { label: 'YTD tax withheld', field: 'ytdTaxWithheld' },
          { label: 'Last pay net', field: 'lastPayNet' },
        ],
      },
      taxSim: {
        title: 'Tax posture',
        effectiveRateLabel: 'Estimated effective rate',
      },
      payslip: {
        title: 'Latest payslip',
        metaPrefix: 'Breakdown aligns with ',
        metaEmphasis: 'your last pay cycle',
        metaSuffix: ' — gross, deductions, and net before optional perks.',
        paidDaysLabel: 'Paid days in period',
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
        bodyLead: 'Ask about line items, codes, or net-vs-gross differences using ',
        bodyEmphasis: 'your uploaded payslips',
        bodyTail: ' as context—powered by the in-app assistant.',
        badge: 'Assistant',
      },
    },
    charts: {
      withholding: {
        title: 'Withholding vs gross pay (YTD)',
        legend: 'Indexed to your strongest pay month',
      },
      spark: {
        title: 'Net pay trend',
        legend: 'Last 12 pay periods',
      },
    },
    chat: {
      fabLabel: 'Assistant',
    },
    quickLinks: [
      {
        label: 'Payroll & YTD composition',
        href: '#erp-dash-anchor-salary-ytd',
        scrollTarget: 'erp-dash-anchor-salary-ytd',
      },
      {
        label: 'Latest payslip',
        href: '#erp-dash-anchor-payslip',
        scrollTarget: 'erp-dash-anchor-payslip',
      },
      {
        label: 'Tax parameters & withholding',
        href: '#erp-dash-anchor-tax',
        scrollTarget: 'erp-dash-anchor-tax',
      },
    ],
  },
  data: {
    salaryClarity: {
      ytdGross: 6872400,
      ytdTaxWithheld: 1547120,
      lastPayNet: 507375,
    },
    taxSim: {
      scenarioLabel: 'Married filing jointly · standard deduction (example)',
      effectiveRatePct: 19.4,
      headline: 'Withholding is tracking close to the model',
      detail:
        'We compare year-to-date withholding to a simplified annual liability estimate. Actual taxes depend on filing status, credits, and other income—this is guidance, not advice.',
    },
    payslip: {
      monthLabel: 'Mar',
      year: 2026,
      paidDays: 22,
      totalDaysInMonth: 31,
      grossPay: 636195,
      deductions: 127820,
      netPay: 507375,
      currency: 'INR',
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
