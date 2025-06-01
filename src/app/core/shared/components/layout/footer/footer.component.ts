import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-footer',
  imports: [SHARED_MODULES],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  appRoutes = APP_ROUTES;
}
