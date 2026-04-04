import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DASHBOARD_CHARTS_FALLBACK } from '../data/dashboard-charts.fallback';
import { DashboardChartsJson } from '../models/dashboard-charts.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardChartsService {
  private readonly assetUrl = 'assets/data/dashboard-charts.json';

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  /**
   * Prefer live API (`GET /dashboard/charts`), then bundled JSON, then inline fallback.
   */
  loadCharts$(): Observable<DashboardChartsJson> {
    return this.api.getDashboardCharts$().pipe(
      catchError(() => this.http.get<DashboardChartsJson>(this.assetUrl)),
      catchError(() => of(DASHBOARD_CHARTS_FALLBACK))
    );
  }
}
