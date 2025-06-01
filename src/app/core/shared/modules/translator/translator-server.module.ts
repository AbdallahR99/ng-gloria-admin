import { importProvidersFrom, TransferState } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { APP_SETTINGS } from '@core/constants/app-settings.constants';
import {
  TranslateServerLoader,
  translateServerLoaderFactory,
} from '@core/utils/i18n-server-loader';
import { PlatformService } from '@core/services/platform/platform.service';

export const provideServerTranslatorModule = () =>
  importProvidersFrom(
    TranslateModule.forRoot({
      isolate: true,
      defaultLanguage: APP_SETTINGS.defaultLanguage,
      loader: {
        provide: TranslateLoader,
        useFactory: translateServerLoaderFactory,
        deps: [TransferState, PlatformService],
      },
    })
  );
