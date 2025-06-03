import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Location } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { InspiredProductsService } from '@app/core/services/repository/inspired-products.service';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';

@Component({
  selector: 'app-inspired-product-details',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-product-details.component.html',
  styleUrl: './inspired-product-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductDetailsComponent {
  private readonly inspiredProductsService = inject(InspiredProductsService);
  private readonly location = inject(Location);

  readonly routes = APP_ROUTES;

  // Input signal for product ID from route
  readonly id = input.required<string>();

  // Resource for fetching product details
  readonly productResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params: { id } }) =>
      this.inspiredProductsService.getById(id),
  });

  /**
   * Navigate back using browser history
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Reload the product data
   */
  refreshData(): void {
    this.productResource.reload();
  }
}
