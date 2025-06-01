import { PlatformService } from './../platform/platform.service';

import { EventEmitter, inject, Injectable, DOCUMENT } from '@angular/core';
import { APP_SETTINGS } from '@app/core/constants/app-settings.constants';
import { LocalStorageKeys } from '@app/core/constants/local_storage';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslatorService {
  private readonly PlatformService = inject(PlatformService);
  private readonly translate = inject<TranslateService>(TranslateService);
  private readonly document = inject<Document>(DOCUMENT);

  private static readonly LANG_AR = 'ar';
  private static readonly LANG_EN = 'en';

  get localStorage(): Storage | any | null {
    if (this.PlatformService.isServer) {
      return null;
    }
    return localStorage;
  }

  onLangChange(): EventEmitter<LangChangeEvent> {
    return this.translate.onLangChange;
  }

  langOb = this.translate.onLangChange.asObservable();

  getCurrentLang(): string | null {
    const urlParams = new URLSearchParams(this.document.location?.search || '');
    const langParam = urlParams.get('lang');
    if (langParam) {
      return langParam;
    }
    if (this.PlatformService.isServer) return APP_SETTINGS.defaultLanguage;

    if (typeof localStorage === 'undefined') {
      return APP_SETTINGS.defaultLanguage;
    }

    return (
      this.localStorage?.getItem(LocalStorageKeys.LANG) ||
      APP_SETTINGS.defaultLanguage
    );
  }

  setCurrentLang(lang?: string): void {
    // if (this.PlatformService.isServer) return;
    lang ??= this.getCurrentLang() || APP_SETTINGS.defaultLanguage;
    lang = lang;

    this.translate.use(lang);
    this.translate.setDefaultLang(lang);
    this.translate.currentLang = lang;

    this.localStorage?.setItem(LocalStorageKeys.LANG, lang);

    this.updateDocumentAttributes(lang);
  }

  private updateDocumentAttributes(lang: string): void {
    const isArabic = lang === TranslatorService.LANG_AR;
    const dir = isArabic ? 'rtl' : 'ltr';

    this.document.documentElement.setAttribute('dir', dir);
    this.document.documentElement.lang = lang;

    const htmlElement = this.document.getElementsByTagName('html')[0];
    const bodyElement = this.document.getElementsByTagName('body')[0];

    htmlElement?.setAttribute(LocalStorageKeys.LANG, lang);
    htmlElement?.setAttribute('dir', dir);
    bodyElement?.setAttribute('dir', dir);

    if (isArabic) {
      bodyElement?.setAttribute('class', 'rtl');
    } else {
      bodyElement?.removeAttribute('class');
    }
  }

  translateWord(key: string): string {
    return this.translate.instant(key || '');
  }

  get isEn(): boolean {
    return this.getCurrentLang() === TranslatorService.LANG_EN;
  }
}
