import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { rxResource } from '@ngneat/rx-resource'; // Make sure this is installed
import { InspiredProductsService } from '@app/core/services/repository/inspired-products.service';
import { InspiredProduct } from '@app/core/models/inspired-product.model';
import { switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-inspired-products',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './inspired-products.component.html',
  styleUrls: ['./inspired-products.component.scss'],
})
export class InspiredProductsComponent {
  private readonly inspiredProductsService = inject(InspiredProductsService);
  private readonly router = inject(Router);

  readonly itemsPerPage = signal(10);
  readonly currentPage = signal(1);
  private readonly refreshSignal = signal(0);

  private readonly productsSource$ = computed(() => {
    const page = this.currentPage();
    const limit = this.itemsPerPage();
    this.refreshSignal(); // Depend on refreshSignal

    // Use postFilter as it expects pagination parameters in the body
    return this.inspiredProductsService.postFilter({ page, limit });
  });

  readonly productsResource = rxResource(
    toObservable(this.productsSource$).pipe(switchMap((obs) => obs)),
    {
      // Service returns PaginatedResponse<InspiredProduct> which has { data: T[], total: number }
      initialValue: { data: [], total: 0 },
    }
  );

  readonly paginatedProducts = computed(() => {
    const resourceState = this.productsResource();
    // The structure from PaginatedResponse is { data: InspiredProduct[], total: number }
    // So, resourceState.data is PaginatedResponse<InspiredProduct>
    return resourceState.data?.data ?? [];
  });

  readonly totalItems = computed(() => {
    const resourceState = this.productsResource();
    return resourceState.data?.total ?? 0;
  });

  readonly paginationInfo = computed(() => {
    const page = this.currentPage();
    const itemsPerPage = this.itemsPerPage();
    const total = this.totalItems();
    const totalPages = Math.ceil(total / itemsPerPage) || 1;
    const startItem = total > 0 ? (page - 1) * itemsPerPage + 1 : 0;
    const endItem = total > 0 ? Math.min(page * itemsPerPage, total) : 0;

    return {
      currentPage: page,
      itemsPerPage,
      totalItems: total,
      totalPages,
      startItem,
      endItem,
    };
  });

  readonly isLoading = computed(() => this.productsResource().isLoading);
  readonly error = computed(() => this.productsResource().error);

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage() < this.paginationInfo().totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  addProduct(): void {
    this.router.navigate(['/admin/inspired-products/new']);
  }

  editProduct(product: InspiredProduct): void {
    this.router.navigate(['/admin/inspired-products/edit', product.id]);
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      // Use the 'delete' method from the service
      this.inspiredProductsService.delete(productId).subscribe({
        next: () => {
          console.log('Product deleted successfully');
          const currentPageItems = this.paginatedProducts().length;
          const currentTotalItems = this.totalItems();
          // Check if it was the last item on a page that\'s not the first
          if (
            currentPageItems === 1 &&
            this.currentPage() > 1 &&
            currentTotalItems ===
              (this.currentPage() - 1) * this.itemsPerPage() + 1
          ) {
            this.currentPage.set(this.currentPage() - 1); // Go to previous page
          } else {
            this.triggerRefresh(); // Refresh current page
          }
        },
        error: (err: HttpErrorResponse) => {
          // Added HttpErrorResponse type
          console.error('Error deleting product:', err);
          // Handle error (e.g., show toast message)
        },
      });
    }
  }

  retryFetch(): void {
    this.triggerRefresh();
  }

  private triggerRefresh(): void {
    this.refreshSignal.set(this.refreshSignal() + 1);
  }
}
