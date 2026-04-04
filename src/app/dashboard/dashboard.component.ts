import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { BizzyBotComponent, BizzyBotWidgetConfig } from 'bot-lib-v1';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { APP_CURRENCY_CODE, APP_NAME, APP_TAGLINE, BRAND_LOGO_DATA_URI } from '../app.constants';
import { AUTH_ACCESS_TOKEN_KEY, AUTH_USER_KEY } from '../core/constants/auth-storage.constants';
import { AuthUser } from '../core/models/auth-api.model';
import { DASHBOARD_VIEW_DATA } from '../core/data/dashboard-view.data';
import { DashboardChartsJson } from '../core/models/dashboard-charts.model';
import { DashboardChartsService } from '../core/services/dashboard-charts.service';
import { ApiService } from '../core/services/api.service';
import { FormatService } from '../core/services/format.service';
import { NetworkStatusService } from '../core/services/network-status.service';
import { DashboardViewModel, PayslipData, SalaryClarityData } from '../core/models/dashboard-view.model';
import {
  mapSalaryMetricsApiPayload,
  salaryMetricsPatchIsEmpty,
} from '../core/utils/salary-metrics-api.mapper';
import { environment } from '../../environments/environment';

/** KPI rows for cards that summarize `DashboardChartsJson` from the charts API. */
interface DashboardChartsApiCardRow {
  label: string;
  value: string;
}

interface DashboardChartsApiCard {
  title: string;
  eyebrow?: string;
  rows: DashboardChartsApiCardRow[];
  note?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [],
})
export class DashboardComponent implements OnInit {
  @ViewChild(BizzyBotComponent) private bizzyBot?: BizzyBotComponent;

  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;
  readonly brandLogoSrc = BRAND_LOGO_DATA_URI;

  /** Current calendar year for copyright (updates if the view is refreshed after year change). */
  get copyrightYear(): number {
    return new Date().getFullYear();
  }

  /** Smooth-scroll to a dashboard chart block; optional `href` fallback for non-JS. */
  scrollToDashboardSection(targetId: string, event?: Event): void {
    event?.preventDefault();
    const el = document.getElementById(targetId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onQuickLinkClick(event: Event, link: { href: string; scrollTarget?: string }): void {
    if (link.scrollTarget) {
      this.scrollToDashboardSection(link.scrollTarget, event);
    }
  }

  /** Real widget handles its own open/close (launcher + panel). */
  readonly bizzyBotPanelConfig: BizzyBotWidgetConfig = {
    brandName: APP_NAME,
    brandTagline: APP_TAGLINE,
  };

  /** Bound view model — populated from API service (falls back to mock). */
  vm: DashboardViewModel = DASHBOARD_VIEW_DATA;

  todayLabel: string;

  showSalary = false;
  /** Promo “Learn more” explainer dialog. */
  showLearnMorePanel = false;

  /** Subtitle under net-pay line chart (from JSON). */
  netPayTrendSubtitle = '';
  salaryChartFootnote = '';
  chartsReady = false;

  /** Derived from charts API JSON — surfaced as summary cards above the main quad grid. */
  chartApiCards: DashboardChartsApiCard[] = [];

  withholdingChartType = 'bar' as const;
  withholdingChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  withholdingChartOptions: ChartConfiguration<'bar'>['options'] = this.buildWithholdingOptions();

  netPayChartType = 'line' as const;
  netPayChartData: ChartData<'line'> = { labels: [], datasets: [] };
  netPayChartOptions: ChartConfiguration<'line'>['options'] = this.buildNetPayOptions();

  salaryBarChartType = 'bar' as const;
  salaryBarChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  salaryBarChartOptions: ChartConfiguration<'bar'>['options'] = this.buildSalaryBarOptions();

  cashflowChartType = 'bar' as const;
  cashflowChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  cashflowChartOptions: ChartConfiguration<'bar'>['options'] = this.buildCashflowOptions();

  payslipChartType = 'doughnut' as const;
  payslipChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  payslipChartOptions: ChartConfiguration<'doughnut'>['options'] = this.buildPayslipDoughnutOptions();

  taxChartType = 'doughnut' as const;
  taxChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  taxChartOptions: ChartConfiguration<'doughnut'>['options'] = this.buildTaxDoughnutOptions();

  constructor(
    private router: Router,
    private format: FormatService,
    private dashboardCharts: DashboardChartsService,
    private api: ApiService,
    readonly networkStatus: NetworkStatusService
  ) {
    this.todayLabel = this.format.formatLongDate(new Date());
    this.refreshVmBoundCharts();
  }

  ngOnInit(): void {
    this.api.getDashboardView$().subscribe((vm) => {
      this.vm = vm;
      this.refreshVmBoundCharts();
    });

    this.dashboardCharts.loadCharts$().subscribe((json) => {
      this.applyJsonCharts(json);
      this.chartsReady = true;
    });

    this.api.getSalaryMetrics$().subscribe({
      next: (raw) => {
        const patch = mapSalaryMetricsApiPayload(raw);
        if (salaryMetricsPatchIsEmpty(patch)) {
          return;
        }
        this.applySalaryClarityPatch(patch);
        this.refreshVmBoundCharts();
      },
      error: (err: unknown) => {
        if (!environment.production) {
          console.warn('[Dashboard] GET /dashboard/salary-metrics failed; using mock salary clarity', err);
        }
      },
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) {
      return 'Good morning';
    }
    if (h < 17) {
      return 'Good afternoon';
    }
    return 'Good evening';
  }

  /** Time-based greeting plus first name when the login API stored `auth_user`. */
  get greetingLine(): string {
    const u = this.sessionUser;
    if (!u?.name?.trim()) {
      return this.greeting;
    }
    const first = u.name.trim().split(/\s+/)[0];
    return `${this.greeting}, ${first}`;
  }

  get payslip(): PayslipData {
    return this.vm.data.payslip;
  }

  salaryMetricAmount(field: keyof SalaryClarityData): number {
    return this.vm.data.salaryClarity[field];
  }

  payslipLineAmount(field: keyof Pick<PayslipData, 'grossPay' | 'deductions' | 'netPay'>): number {
    return this.vm.data.payslip[field];
  }

  displayAmount(amount: number): string {
    return this.format.displayCurrencyOrMasked(amount, this.payslip.currency, this.showSalary);
  }

  get effectiveRateFormatted(): string {
    return this.format.formatPercent(this.vm.data.taxSim.effectiveRatePct);
  }

  toggleShowSalary(): void {
    this.showSalary = !this.showSalary;
    this.refreshVmBoundCharts();
  }

  downloadPayslip(): void {
    console.warn('Download payslip (stub)');
  }

  explorePromo(): void {
    this.bizzyBot?.closeChat();
    this.showLearnMorePanel = true;
  }

  closeLearnMorePanel(): void {
    this.showLearnMorePanel = false;
  }

  /** Close promo and open the embedded assistant (widget’s own UI). */
  openAssistantFromLearnMore(): void {
    this.showLearnMorePanel = false;
    this.scheduleBizzyChatOpen();
  }

  /** Payslip document Q&A card: icon opens the same embedded AI assistant (Bizzy). */
  openAssistantFromPayslipDocQa(): void {
    this.showLearnMorePanel = false;
    this.scheduleBizzyChatOpen();
  }

  private scheduleBizzyChatOpen(): void {
    setTimeout(() => this.ensureBizzyChatOpen(), 0);
  }

  private ensureBizzyChatOpen(): void {
    const bot = this.bizzyBot;
    if (bot && !bot.isChatOpen) {
      bot.toggleChat();
    }
  }

  @HostListener('document:keydown.escape')
  onOverlayEscape(): void {
    if (this.showLearnMorePanel) {
      this.closeLearnMorePanel();
      return;
    }
    if (this.bizzyBot?.isChatOpen) {
      this.bizzyBot.closeChat();
    }
  }

  signOut(): void {
    sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  /** Logged-in user from session after successful login API. */
  get sessionUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(AUTH_USER_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private applySalaryClarityPatch(patch: Partial<SalaryClarityData>): void {
    const prev = this.vm.data.salaryClarity;
    const next: SalaryClarityData = { ...prev };
    (['ytdGross', 'ytdTaxWithheld', 'lastPayNet'] as const).forEach((k) => {
      const v = patch[k];
      if (v !== undefined && Number.isFinite(v)) {
        next[k] = v;
      }
    });
    this.vm = {
      ...this.vm,
      data: { ...this.vm.data, salaryClarity: next },
    };
  }

  private applyJsonCharts(json: DashboardChartsJson): void {
    this.chartApiCards = this.buildChartApiCards(json);
    this.netPayTrendSubtitle = json.netPayTrend.subtitle;
    this.salaryChartFootnote = json.salaryComposition.footnote;

    const w = json.withholdingVsGross;
    this.withholdingChartData = {
      labels: [...w.labels],
      datasets: w.datasets.map((ds, i) => ({
        label: ds.label,
        data: [...ds.data],
        backgroundColor: i === 0 ? 'rgba(14, 125, 63, 0.88)' : 'rgba(5, 150, 105, 0.55)',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 36,
      })),
    };

    const n = json.netPayTrend;
    this.netPayChartData = {
      labels: [...n.labels],
      datasets: [
        {
          label: 'Net pay',
          data: [...n.data],
          borderColor: '#0a5c2e',
          backgroundColor: 'rgba(14, 125, 63, 0.14)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#0e7d3f',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    };

    const s = json.salaryComposition;
    this.salaryBarChartData = {
      labels: [...s.labels],
      datasets: [
        {
          label: `Compensation (${APP_CURRENCY_CODE})`,
          data: [...s.data],
          backgroundColor: ['rgba(14, 125, 63, 0.92)', 'rgba(5, 150, 105, 0.75)', 'rgba(110, 231, 183, 0.85)'],
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 22,
        },
      ],
    };

    const c = json.ytdCashflow;
    this.cashflowChartData = {
      labels: [...c.labels],
      datasets: [
        {
          label: 'Gross inflow',
          data: [...c.inflow],
          backgroundColor: 'rgba(14, 125, 63, 0.85)',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 28,
        },
        {
          label: 'Tax outflow',
          data: [...c.outflowTax],
          backgroundColor: 'rgba(220, 38, 38, 0.45)',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 28,
        },
      ],
    };
  }

  private buildChartApiCards(json: DashboardChartsJson): DashboardChartsApiCard[] {
    const cards: DashboardChartsApiCard[] = [
      {
        title: json.meta.title,
        rows: [],
        note: json.meta.description,
      },
    ];

    const w = json.withholdingVsGross;
    const grossDs = w.datasets[0];
    const taxDs = w.datasets[1];
    if (w.labels.length && grossDs?.data?.length && taxDs?.data?.length) {
      const gi = Math.min(w.labels.length, grossDs.data.length, taxDs.data.length) - 1;
      const month = w.labels[gi] ?? `M${gi + 1}`;
      cards.push({
        title: 'Withholding vs gross',
        eyebrow: 'Latest period (indexed)',
        rows: [
          { label: `${month} · ${grossDs.label}`, value: String(grossDs.data[gi]) },
          { label: `${month} · ${taxDs.label}`, value: String(taxDs.data[gi]) },
        ],
        note: 'Indexed series for shape comparison — replace with currency from payroll when live.',
      });
    }

    const n = json.netPayTrend;
    if (n.data.length) {
      const last = n.data[n.data.length - 1];
      const first = n.data[0];
      const delta = last - first;
      const deltaLabel =
        (delta >= 0 ? '+' : '') + this.format.formatCurrency(delta, APP_CURRENCY_CODE);
      cards.push({
        title: 'Net pay (trail)',
        eyebrow: n.subtitle,
        rows: [
          { label: 'Latest pay period', value: this.format.formatCurrency(last, APP_CURRENCY_CODE) },
          { label: 'Change vs first period', value: deltaLabel },
        ],
      });
    }

    const s = json.salaryComposition;
    if (s.labels.length && s.data.length) {
      const len = Math.min(s.labels.length, s.data.length);
      const rows: DashboardChartsApiCardRow[] = [];
      for (let i = 0; i < len; i++) {
        rows.push({
          label: s.labels[i],
          value: this.format.formatCurrency(s.data[i], APP_CURRENCY_CODE),
        });
      }
      cards.push({
        title: 'Salary composition (YTD)',
        rows,
        note: s.footnote,
      });
    }

    const c = json.ytdCashflow;
    if (c.labels.length && c.inflow.length && c.outflowTax.length) {
      const qi = Math.min(c.labels.length, c.inflow.length, c.outflowTax.length) - 1;
      const inflow = c.inflow[qi];
      const outTax = c.outflowTax[qi];
      cards.push({
        title: 'Cashflow snapshot',
        eyebrow: c.labels[qi],
        rows: [
          { label: 'Gross inflow', value: this.format.formatCurrency(inflow, APP_CURRENCY_CODE) },
          { label: 'Tax outflow', value: this.format.formatCurrency(outTax, APP_CURRENCY_CODE) },
          {
            label: 'Net (inflow − tax)',
            value: this.format.formatCurrency(inflow - outTax, APP_CURRENCY_CODE),
          },
        ],
      });
    }

    return cards;
  }

  private refreshVmBoundCharts(): void {
    const p = this.vm.data.payslip;
    const currency = p.currency;
    this.payslipChartData = {
      labels: ['Net pay', 'Deductions'],
      datasets: [
        {
          data: [p.netPay, p.deductions],
          backgroundColor: ['#0a5c2e', '#6ee7b7'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
    const base = this.buildPayslipDoughnutOptions() ?? {};
    this.payslipChartOptions = {
      ...base,
      plugins: {
        ...base.plugins,
        tooltip: {
          ...base.plugins?.tooltip,
          callbacks: {
            ...base.plugins?.tooltip?.callbacks,
            label: (ctx) => {
              const v = ctx.raw as number;
              const label = ctx.label || '';
              return ` ${label}: ${this.format.displayCurrencyOrMasked(v, currency, this.showSalary)}`;
            },
          },
        },
      },
    };

    const rate = this.vm.data.taxSim.effectiveRatePct;
    const rest = Math.max(0, 100 - rate);
    this.taxChartData = {
      labels: ['Effective rate (est.)', 'Remaining pay slice'],
      datasets: [
        {
          data: [rate, rest],
          backgroundColor: ['#0e7d3f', '#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }

  private buildWithholdingOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#64748b',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: "'Inter', sans-serif", size: 12 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10, weight: '600' } },
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(100, 116, 139, 0.12)' },
          ticks: { color: '#94a3b8', font: { size: 10 } },
        },
      },
    };
  }

  private buildNetPayOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw as number;
              return ` Net pay: ${this.format.formatCurrency(v, APP_CURRENCY_CODE)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 9, weight: '600' } },
        },
        y: {
          grid: { color: 'rgba(100, 116, 139, 0.1)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10 },
            callback: (val) => this.format.formatCurrency(Number(val), APP_CURRENCY_CODE),
          },
        },
      },
    };
  }

  private buildSalaryBarOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw as number;
              return ` ${this.format.formatCurrency(v, APP_CURRENCY_CODE)}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(100, 116, 139, 0.1)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10 },
            callback: (val) => this.format.formatCurrency(Number(val), APP_CURRENCY_CODE),
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#475569', font: { size: 10, weight: '600' } },
        },
      },
    };
  }

  private buildCashflowOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 14,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#64748b',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw as number;
              const ds = ctx.dataset.label || '';
              return ` ${ds}: ${this.format.formatCurrency(v, APP_CURRENCY_CODE)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10, weight: '600' } },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(100, 116, 139, 0.12)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10 },
            callback: (val) => this.format.formatCurrency(Number(val), APP_CURRENCY_CODE),
          },
        },
      },
    };
  }

  private buildPayslipDoughnutOptions(): ChartConfiguration<'doughnut'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 14,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#64748b',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: 12,
          cornerRadius: 10,
        },
      },
    };
  }

  private buildTaxDoughnutOptions(): ChartConfiguration<'doughnut'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 12,
            font: { family: "'Inter', sans-serif", size: 10 },
            color: '#64748b',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw as number;
              return ` ${(ctx.label || '').trim()}: ${v.toFixed(1)}%`;
            },
          },
        },
      },
    };
  }
}
