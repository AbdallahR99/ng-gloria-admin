// shared/loaders/translate-server.loader.ts
import { join } from 'path';
import { Observable } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { inject, makeStateKey, StateKey, TransferState } from '@angular/core';
import * as fs from 'fs';

export class TranslateServerLoader implements TranslateLoader {
  // transferState = inject(TransferState);
  constructor(
    private transferState: TransferState,
    private prefix: string = 'i18n',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    return new Observable((observer) => {
      const assets_folder = join(
        process.cwd(),
        'public',
        // 'ssr', // Your project name here
        // 'i18n',
        // 'assets',
        this.prefix,
        `${lang}${this.suffix}`
      );
      // const jsonData = JSON.parse(
      //   fs.readFileSync(`./${lang}${this.suffix}`, 'utf8')
      // );
      const jsonData = JSON.parse(fs.readFileSync(assets_folder, 'utf8'));

      // Here we save the translations in the transfer-state
      const key: StateKey<number> = makeStateKey<number>(
        'transfer-translate-' + lang
      );
      this.transferState.set(key, jsonData);

      observer.next(jsonData);
      observer.complete();
    });
  }
}

export function translateServerLoaderFactory(transferState: TransferState) {
  transferState = inject(TransferState);

  return new TranslateServerLoader(transferState);
}
