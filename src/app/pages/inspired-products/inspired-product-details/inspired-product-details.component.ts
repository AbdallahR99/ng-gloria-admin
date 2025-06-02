import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-inspired-product-details',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-product-details.component.html',
  styleUrl: './inspired-product-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductDetailsComponent {}
