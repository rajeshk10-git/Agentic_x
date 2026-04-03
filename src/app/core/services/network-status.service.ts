import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const OFFLINE_MESSAGE =
  'No internet connection. You appear to be offline. Please check your network and try again.';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService {
  private readonly onlineSubject = new BehaviorSubject<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  /** Emits `true` when the browser reports a network connection, `false` when offline. */
  readonly online$ = this.onlineSubject.asObservable();

  constructor(private zone: NgZone) {
    if (typeof window === 'undefined') {
      return;
    }

    const goOffline = () => {
      this.onlineSubject.next(false);
      window.alert(OFFLINE_MESSAGE);
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener('offline', () => {
        this.zone.run(() => goOffline());
      });
      window.addEventListener('online', () => {
        this.zone.run(() => this.onlineSubject.next(true));
      });
    });

    if (!navigator.onLine) {
      this.zone.run(() => goOffline());
    }
  }
}
