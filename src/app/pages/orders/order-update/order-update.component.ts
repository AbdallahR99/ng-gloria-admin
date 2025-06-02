import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-order-update',
  imports: [SHARED_MODULES],
  templateUrl: './order-update.component.html',
  styleUrl: './order-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderUpdateComponent {}
