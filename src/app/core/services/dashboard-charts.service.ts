import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DASHBOARD_CHARTS_FALLBACK } from '../data/dashboard-charts.fallback';
import { DashboardChartsJson } from '../models/dashboard-charts.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardChartsService {
  private readonly url = 'assets/data/dashboard-charts.json';

  constructor(private http: HttpClient) {}

  loadCharts$(): Observable<DashboardChartsJson> {
    return this.http.get<DashboardChartsJson>(this.url).pipe(
      catchError(() => of(DASHBOARD_CHARTS_FALLBACK))
    );
  }
}
