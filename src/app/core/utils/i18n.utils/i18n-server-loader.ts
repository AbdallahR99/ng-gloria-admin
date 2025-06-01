// shared/loaders/translate-server.loader.ts
import { join } from 'path';
import { Observable } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { inject, makeStateKey, StateKey, TransferState } from '@angular/core';
import * as fs from 'fs';
import { HttpClient } from '@angular/common/http';
import { PlatformService } from '@core/services/platform/platform.service';
import { pathLocator } from './i18-path-locator';

export class TranslateServerLoader implements TranslateLoader {
  // transferState = inject(TransferState);
  constructor(
    // private httpClient: HttpClient,
    private transferState: TransferState,
    private platformService: PlatformService,
    private prefix: string = 'i18n',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    return new Observable((observer) => {
      if (this.platformService.isBrowser) {
        observer.complete();
        return;
      }
      const filePath = pathLocator(lang, this.prefix, this.suffix);
      try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const key: StateKey<number> = makeStateKey<number>(
          'transfer-translate-' + lang
        );
        this.transferState.set(key, jsonData);
        observer.next(jsonData);
        observer.complete();
      } catch (err) {
        observer.error(err);
      }
      // Return a teardown logic (noop, since no async subscription)
      return () => {};
    });
  }
}

export function translateServerLoaderFactory(
  transferState: TransferState,
  platformService: PlatformService
) {
  return new TranslateServerLoader(transferState, platformService);
}
