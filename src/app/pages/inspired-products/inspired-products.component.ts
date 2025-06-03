import { Component, computed, inject, model, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { InspiredProductsService } from '@app/core/services/repository/inspired-products.service';
import {
  InspiredProduct,
  InspiredProductsQuery,
} from '@app/core/models/inspired-product.model';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';

@Component({
  selector: 'app-inspired-products',
  imports: SHARED_MODULES,
  templateUrl: './inspired-products.component.html',
  styleUrl: './inspired-products.component.scss',
})
export class InspiredProductsComponent {
  private readonly inspiredProductsService = inject(InspiredProductsService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // State variables using model
  readonly currentPage = model(1);
  readonly pageSize = model(10);
  readonly sortBy = model<keyof InspiredProduct>('createdAt');
  readonly sortOrder = model<'asc' | 'desc'>('desc');
  readonly searchQuery = model('');
  readonly selectedProducts = model<string[]>([]);
  readonly isDeleting = model(false);
  readonly showDeleted = model(false);

  // Search form
  readonly searchForm = this.fb.group({
    search: [''],
  });

  // Computed query for rxResource
  private readonly query = computed(
    (): InspiredProductsQuery => ({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      queryString: this.searchQuery() || undefined,
      showDeleted: this.showDeleted(),
    })
  );

  // resource for loading products with error handling
  readonly productsResource = rxResource({
    stream: () => this.inspiredProductsService.getFilter(this.query()),
  });

  // Computed properties
  readonly products = computed(() => this.productsResource.value()?.data || []);
  readonly totalItems = computed(
    () => this.productsResource.value()?.pagination.total || 0
  );
  readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.pageSize())
  );
  readonly isLoading = computed(() => this.productsResource.isLoading());
  readonly error = computed(() => this.productsResource.error());
  readonly hasProducts = computed(() => this.products().length > 0);
  readonly isAllSelected = computed(() => {
    const products = this.products();
    return (
      products.length > 0 &&
      products.every((p: InspiredProduct) =>
        this.selectedProducts().includes(p.id!)
      )
    );
  });
  readonly isPartialSelected = computed(() => {
    const products = this.products();
    const selected = this.selectedProducts();
    return (
      selected.length > 0 &&
      products.some((p) => selected.includes(p.id!)) &&
      !this.isAllSelected()
    );
  });

  // Pagination info computed
  readonly paginationInfo = computed(() => {
    const totalItems = this.totalItems();
    const pageSize = this.pageSize();
    const currentPage = this.currentPage();
    const totalPages = this.totalPages();
    const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      startItem,
      endItem,
    };
  });

  // Visible pagination pages computed
  readonly getVisiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + maxVisible - 1);
    const adjustedStart = Math.max(1, end - maxVisible + 1);

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, i) => adjustedStart + i
    );
  });

  constructor() {
    // Effect to watch search form changes and auto-search
    effect(() => {
      const searchValue = this.searchForm.get('search')?.value;
      if (searchValue !== undefined) {
        // Debounce could be added here if needed
        const trimmedValue = searchValue?.trim() || '';
        if (trimmedValue !== this.searchQuery()) {
          this.searchQuery.set(trimmedValue);
          this.currentPage.set(1);
          this.selectedProducts.set([]);
        }
      }
    });
  }

  // Navigation methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.selectedProducts.set([]);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.selectedProducts.set([]);
  }

  // Search methods
  onSearch(): void {
    const searchValue = this.searchForm.get('search')?.value?.trim() || '';
    this.searchQuery.set(searchValue);
    this.currentPage.set(1);
    this.selectedProducts.set([]);
  }

  onClearSearch(): void {
    this.searchForm.patchValue({ search: '' });
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.selectedProducts.set([]);
  }

  // Toggle methods
  onToggleDeleted(): void {
    this.showDeleted.set(!this.showDeleted());
    this.currentPage.set(1);
    this.selectedProducts.set([]);
  }

  // Selection methods
  onToggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedProducts.set([]);
    } else {
      const allIds = this.products()
        .map((p) => p.id!)
        .filter(Boolean);
      this.selectedProducts.set(allIds);
    }
  }

  onToggleProduct(productId: string): void {
    const selected = this.selectedProducts();
    if (selected.includes(productId)) {
      this.selectedProducts.set(selected.filter((id) => id !== productId));
    } else {
      this.selectedProducts.set([...selected, productId]);
    }
  }

  // CRUD operations
  onCreateProduct(): void {
    this.router.navigate([APP_ROUTES.INSPIRED_PRODUCT_CREATE]);
  }

  onEditProduct(product: InspiredProduct): void {
    this.router.navigate([APP_ROUTES.INSPIRED_PRODUCT_UPDATE, product.id]);
  }

  onDeleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this inspired product?')) {
      this.isDeleting.set(true);
      this.inspiredProductsService
        .delete(productId)

        .subscribe({
          next: () => {
            this.isDeleting.set(false);
            this.selectedProducts.set(
              this.selectedProducts().filter((id) => id !== productId)
            );
            // Trigger refresh using rxResource reload
            this.productsResource.reload();
          },
          error: (err: HttpErrorResponse) => {
            this.isDeleting.set(false);
            console.error('Error deleting inspired product:', err);
            // TODO: Show error toast/notification
          },
        });
    }
  }

  async onBulkDelete(): Promise<void> {
    const selectedIds = this.selectedProducts();
    if (
      selectedIds.length === 0 ||
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} inspired product(s)?`
      )
    ) {
      return;
    }

    this.isDeleting.set(true);
    try {
      // Use firstValueFrom for proper async/await pattern
      await Promise.all(
        selectedIds.map((id) =>
          firstValueFrom(this.inspiredProductsService.delete(id))
        )
      );

      this.isDeleting.set(false);
      this.selectedProducts.set([]);
      this.productsResource.reload();
    } catch (err) {
      this.isDeleting.set(false);
      console.error('Error during bulk delete:', err);
      // TODO: Show error toast/notification
    }
  }

  onRestoreProduct(productId: string): void {
    // TODO: Implement restore functionality if needed
    console.log('Restore product:', productId);
  }

  // Utility methods
  onRefresh(): void {
    this.productsResource.reload();
  }

  // Sort methods
  onSort(field: keyof InspiredProduct): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
    this.selectedProducts.set([]);
  }
}
