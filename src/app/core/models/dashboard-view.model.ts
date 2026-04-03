/** View model for dashboard — UI copy + data payload (mock or API). */

export interface SalaryClarityData {
  ytdGross: number;
  ytdTaxWithheld: number;
  lastPayNet: number;
}

export interface TaxSimulationData {
  scenarioLabel: string;
  effectiveRatePct: number;
  headline: string;
  detail: string;
}

export interface PayslipData {
  monthLabel: string;
  year: number;
  paidDays: number;
  totalDaysInMonth: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  currency: string;
}

export interface YtdBar {
  label: string;
  pct: number;
}

export interface SalaryMetricRow {
  label: string;
  field: keyof SalaryClarityData;
}

export interface PayslipLineRow {
  label: string;
  variant: 'gross' | 'ded' | 'net';
  field: keyof Pick<PayslipData, 'grossPay' | 'deductions' | 'netPay'>;
}

/** Two-line callout under the greeting in the hero card. */
export interface HeroTaxTipUi {
  headline: string;
  quote: string;
}

export interface DashboardUiStrings {
  missionPills: string[];
  heroQuote: string;
  /** Optional “Did you know?” + tax-saving line (educational, not advice). */
  heroTaxTip?: HeroTaxTipUi;
  promo: { subtitle: string; cta: string };
  section: { eyebrow: string; title: string; meta: string };
  cards: {
    salaryClarity: {
      title: string;
      leadPrefix: string;
      leadEmphasis: string;
      leadSuffix: string;
      metrics: SalaryMetricRow[];
    };
    taxSim: {
      title: string;
      effectiveRateLabel: string;
    };
      payslip: {
        title: string;
        metaPrefix: string;
        metaEmphasis: string;
        metaSuffix: string;
        paidDaysLabel: string;
      lines: PayslipLineRow[];
      downloadLabel: string;
      showLabel: string;
      hideLabel: string;
    };
    docQa: {
      title: string;
      bodyLead: string;
      bodyEmphasis: string;
      bodyTail: string;
      badge: string;
    };
  };
  charts: {
    withholding: { title: string; legend: string };
    spark: { title: string; legend: string };
  };
  chat: {
    fabLabel: string;
    fabTitle: string;
    panelTitle: string;
    placeholderTitle: string;
    placeholderBody: string;
    placeholderHint: string;
  };
  quickLinks: { label: string; href: string }[];
}

export interface DashboardViewModel {
  ui: DashboardUiStrings;
  data: {
    salaryClarity: SalaryClarityData;
    taxSim: TaxSimulationData;
    payslip: PayslipData;
    ytdBars: YtdBar[];
    sparkPcts: number[];
  };
}
