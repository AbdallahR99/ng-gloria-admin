import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-header-banner',
  imports: [SHARED_MODULES],
  templateUrl: './header-banner.component.html',
  styleUrl: './header-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderBannerComponent {}
