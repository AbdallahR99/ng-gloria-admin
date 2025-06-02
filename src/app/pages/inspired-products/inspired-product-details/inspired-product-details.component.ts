import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { InspiredProductsService } from '@app/core/services/repository/inspired-products.service';
import { InspiredProduct } from '@app/core/models/inspired-product.model';
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
  private readonly router = inject(Router);
  routes = APP_ROUTES;
  // Input signal for product ID from route
  readonly id = input.required<string>();

  // Resource for fetching product details
  readonly productResource = rxResource({
    request: this.id,
    loader: ({ request: id }) =>
      this.inspiredProductsService.getById(id).pipe(takeUntilDestroyed()),
  });

  // Computed properties for template
  readonly product = computed(() => this.productResource.value());
  readonly loading = computed(() => this.productResource.isLoading());
  readonly error = computed(() => this.productResource.error());

  /**
   * Navigate back to products list
   */
  goBack(): void {
    this.router.navigate(['/inspired-products']);
  }

  /**
   * Navigate to edit product
   */
  editProduct(): void {
    const productId = this.id();
    if (productId) {
      this.router.navigate(['/inspired-products', productId, 'update']);
    }
  }

  /**
   * Delete product with confirmation
   */
  async deleteProduct(): Promise<void> {
    const product = this.product();
    if (!product) return;

    const confirmed = confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      await this.inspiredProductsService
        .delete(product.id)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => {
            this.goBack();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
          },
        });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  /**
   * Get full image URL
   */
  getImageUrl(imagePath: string | null): string {
    if (!imagePath) return 'https://picsum.photos/400/300';
    return imagePath.startsWith('http')
      ? imagePath
      : `assets/images/${imagePath}`;
  }
}
