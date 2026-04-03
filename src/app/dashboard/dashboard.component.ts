import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { APP_NAME, APP_TAGLINE } from '../app.constants';
import { DASHBOARD_VIEW_DATA } from '../core/data/dashboard-view.data';
import { DashboardChartsJson } from '../core/models/dashboard-charts.model';
import { ApiService } from '../core/services/api.service';
import { DashboardChartsService } from '../core/services/dashboard-charts.service';
import { FormatService } from '../core/services/format.service';
import { NetworkStatusService } from '../core/services/network-status.service';
import { DashboardViewModel, PayslipData, SalaryClarityData } from '../core/models/dashboard-view.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [],
})
export class DashboardComponent implements OnInit {
  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;

  /** Bound view model — populated from API service (falls back to mock). */
  vm: DashboardViewModel = DASHBOARD_VIEW_DATA;

  todayLabel: string;

  showSalary = false;
  showChatPanel = false;
  /** Promo “Learn more” explainer dialog. */
  showLearnMorePanel = false;

  /** Subtitle under net-pay line chart (from JSON). */
  netPayTrendSubtitle = '';
  salaryChartFootnote = '';
  chartsReady = false;

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
    private api: ApiService,
    private format: FormatService,
    private dashboardCharts: DashboardChartsService,
    readonly networkStatus: NetworkStatusService
  ) {
    this.todayLabel = this.format.formatLongDate(new Date());
    this.refreshVmBoundCharts();
  }

  ngOnInit(): void {
    this.dashboardCharts.loadCharts$().subscribe((json) => {
      this.applyJsonCharts(json);
      this.chartsReady = true;
    });

    this.api.getDashboardView$().subscribe((d) => {
      this.vm = d;
      this.refreshVmBoundCharts();
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

  toggleChatPanel(): void {
    this.showChatPanel = !this.showChatPanel;
  }

  downloadPayslip(): void {
    console.warn('Download payslip (stub)');
  }

  explorePromo(): void {
    this.showLearnMorePanel = true;
  }

  closeLearnMorePanel(): void {
    this.showLearnMorePanel = false;
  }

  /** Close learn-more and open the assistant shell (same as FAB). */
  openAssistantFromLearnMore(): void {
    this.showLearnMorePanel = false;
    this.showChatPanel = true;
  }

  @HostListener('document:keydown.escape')
  onLearnMoreEscape(): void {
    if (this.showLearnMorePanel) {
      this.closeLearnMorePanel();
    }
  }

  signOut(): void {
    this.router.navigate(['/auth/login']);
  }

  private applyJsonCharts(json: DashboardChartsJson): void {
    this.netPayTrendSubtitle = json.netPayTrend.subtitle;
    this.salaryChartFootnote = json.salaryComposition.footnote;

    const w = json.withholdingVsGross;
    this.withholdingChartData = {
      labels: [...w.labels],
      datasets: w.datasets.map((ds, i) => ({
        label: ds.label,
        data: [...ds.data],
        backgroundColor: i === 0 ? 'rgba(14, 125, 63, 0.88)' : 'rgba(5, 150, 105, 0.55)',
        borderRadius: 8,
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
          label: 'USD (demo)',
          data: [...s.data],
          backgroundColor: ['rgba(14, 125, 63, 0.92)', 'rgba(5, 150, 105, 0.75)', 'rgba(110, 231, 183, 0.85)'],
          borderRadius: 10,
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
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 28,
        },
        {
          label: 'Tax outflow',
          data: [...c.outflowTax],
          backgroundColor: 'rgba(220, 38, 38, 0.45)',
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 28,
        },
      ],
    };
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
      labels: ['Effective rate', 'Remainder (illustrative)'],
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
            font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
            color: '#64748b',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 12 },
          bodyFont: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 12 },
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
              return ` Net pay: $${v.toLocaleString('en-US')}`;
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
            callback: (val) => '$' + Number(val).toLocaleString('en-US'),
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
              return ` $${v.toLocaleString('en-US')}`;
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
            callback: (val) => '$' + Number(val).toLocaleString('en-US'),
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
            font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
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
              return ` ${ds}: $${v.toLocaleString('en-US')}`;
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
            callback: (val) => '$' + Number(val).toLocaleString('en-US'),
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
            font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
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
            font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 10 },
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
