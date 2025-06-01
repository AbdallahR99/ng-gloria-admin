import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  platformId = inject(PLATFORM_ID);
  isServer = isPlatformServer(this.platformId);
  isBrowser = isPlatformBrowser(this.platformId);

  runIfBrowser(callback: () => void): void {
    if (this.isBrowser) {
      callback();
    }
  }

  runIfServer(callback: () => void): void {
    if (this.isServer) {
      callback();
    }
  }
}
