import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { SHARED_MODULES } from '../../../modules/shared.module';
import { HeaderBannerComponent } from './header-banner/header-banner.component';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { HeaderNavMenuComponent } from './header-nav-menu/header-nav-menu.component';
import { TranslatorService } from '@app/core/services/translate/translator.service';
import { LoadingService } from '@app/core/services/loading.service';
import { FacadeService } from '@app/core/services/facade-service.service';
import { environment } from '@environments/environment';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-header',
  imports: [
    SHARED_MODULES,
    HeaderBannerComponent,
    HeaderNavMenuComponent,
    MatBadgeModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  imagePath = environment.supabaseImages;
  loadingService = inject(LoadingService);
  TranslatorService = inject(TranslatorService);
  facadeService = inject(FacadeService);
  get cartCount() {
    return this.facadeService.cartService.cartCount;
  }
  get isLoggedIn() {
    return this.facadeService.authService.isLoggedIn;
  }
  get user() {
    return this.facadeService.usersService.user;
  }
  get isEn(): boolean {
    return this.TranslatorService.isEn;
  }
  menuCollapse = model(false);
  appRoutes = APP_ROUTES;
  navItems: { name: string; route: string }[] = [
    { name: 'Home', route: APP_ROUTES.HOME },
    { name: 'Shop', route: APP_ROUTES.PRODUCTS },
    { name: 'Services', route: APP_ROUTES.Services },
  ];
  setLang(lang: 'en' | 'ar') {
    this.TranslatorService.setCurrentLang(lang);
  }
  toggleLanguage() {
    this.setLang(this.isEn ? 'ar' : 'en');
  }
  logout() {}
}
