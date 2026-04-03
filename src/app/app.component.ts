import { Component } from '@angular/core';
import { APP_NAME, APP_TAGLINE } from './app.constants';
import { NetworkStatusService } from './core/services/network-status.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent {
  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;

  constructor(_networkStatus: NetworkStatusService) {}
}
