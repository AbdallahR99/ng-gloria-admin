import { importProvidersFrom, TransferState } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { APP_SETTINGS } from '@core/constants/app-settings.constants';
import { TranslateBrowserLoader } from '@core/utils/i18n-browser-loader';

export const provideClientTranslatorModule = () =>
  importProvidersFrom(
    TranslateModule.forRoot({
      defaultLanguage: APP_SETTINGS.defaultLanguage,
      loader: {
        provide: TranslateLoader,
        useClass: TranslateBrowserLoader,

        // useFactory: translateBrowserLoaderFactory,
        // useFactory: createTranslateLoader,
        deps: [HttpClient, TransferState],
        // deps: [HttpClient],
      },
    })
  );
