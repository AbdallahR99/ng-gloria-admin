import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-inspired-products',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-products.component.html',
  styleUrl: './inspired-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductsComponent {}
