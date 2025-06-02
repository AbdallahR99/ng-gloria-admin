import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-inspired-product-update',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-product-update.component.html',
  styleUrl: './inspired-product-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductUpdateComponent {}
