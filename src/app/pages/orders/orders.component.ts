import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-orders',
  imports: [SHARED_MODULES],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {}
