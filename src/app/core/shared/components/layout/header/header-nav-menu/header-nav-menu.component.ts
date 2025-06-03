import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { SHARED_MODULES } from '@core/shared/modules/shared.module';
import { HeaderComponent } from '../header.component';
import { APP_ROUTES } from '@core/constants/app-routes.enum';

@Component({
  selector: 'header-nav-menu',
  imports: [SHARED_MODULES],
  templateUrl: './header-nav-menu.component.html',
  styleUrl: './header-nav-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNavMenuComponent {
  navigated = output<void>();
  appRoutes = APP_ROUTES;
  navItems: { name: string; route: string }[] = [
    { name: 'Products', route: APP_ROUTES.PRODUCTS },
    { name: 'Inspired', route: APP_ROUTES.INSPIRED_PRODUCTS },
    { name: 'Categories', route: APP_ROUTES.CATEGORIES },
    { name: 'Orders', route: APP_ROUTES.ORDERS },
  ];
}
