import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/repository/auth.service';
import { TranslatorService } from '@core/services/translate/translator.service';
import { IconService } from '@core/services/utils/icon.service';
import { provideClientTranslatorModule } from '@core/shared/modules/translator/translator.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideClientTranslatorModule(),
    MatIconModule,
    provideAppInitializer(() => {
      inject(IconService).registerIcons();
      inject(TranslatorService).setCurrentLang();
      inject(AuthService).init();
    }),
  ],
};
