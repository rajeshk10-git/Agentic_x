import { SalaryClarityData } from '../models/dashboard-view.model';

export type SalaryMetricsApiPatch = Partial<SalaryClarityData>;

function readFiniteNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (v === null || v === undefined) {
      continue;
    }
    if (typeof v === 'number' && Number.isFinite(v)) {
      return v;
    }
    if (typeof v === 'string') {
      const n = parseFloat(v.replace(/,/g, ''));
      if (Number.isFinite(n)) {
        return n;
      }
    }
  }
  return undefined;
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  return raw as Record<string, unknown>;
}

export function mapSalaryMetricsApiPayload(raw: unknown): SalaryMetricsApiPatch {
  const root = asRecord(raw);
  if (!root) {
    return {};
  }
  const inner = asRecord(root['data']);
  const src = inner ?? root;

  const ytdGross = readFiniteNumber(src, ['ytdGross', 'ytd_gross', 'ytdGrossPay', 'ytd_gross_pay']);
  const ytdTaxWithheld = readFiniteNumber(src, [
    'ytdTaxWithheld',
    'ytd_tax_withheld',
    'ytdWithholding',
    'ytd_withholding',
  ]);
  const lastPayNet = readFiniteNumber(src, [
    'lastPayNet',
    'last_pay_net',
    'latestNetPay',
    'latest_net_pay',
    'netPayLast',
    'net_pay_last',
  ]);

  const out: SalaryMetricsApiPatch = {};
  if (ytdGross !== undefined) {
    out.ytdGross = ytdGross;
  }
  if (ytdTaxWithheld !== undefined) {
    out.ytdTaxWithheld = ytdTaxWithheld;
  }
  if (lastPayNet !== undefined) {
    out.lastPayNet = lastPayNet;
  }
  return out;
}

export function salaryMetricsPatchIsEmpty(patch: SalaryMetricsApiPatch): boolean {
  const keys: (keyof SalaryClarityData)[] = ['ytdGross', 'ytdTaxWithheld', 'lastPayNet'];
  return !keys.some((k) => patch[k] !== undefined && Number.isFinite(patch[k]!));
}
