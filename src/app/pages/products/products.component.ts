import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { ProductsService } from '@app/core/services/repository/products.service';
import { CategoriesService } from '@app/core/services/repository/categories.service';
import { Product, ProductQuery } from '@app/core/models/product.model';
import { Category } from '@app/core/models/category.model';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Signals for component state
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly sortBy = signal<keyof Product>('createdAt');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly searchQuery = signal('');
  readonly selectedCategoryId = signal<string | undefined>(undefined);
  readonly minPrice = signal<number | undefined>(undefined);
  readonly maxPrice = signal<number | undefined>(undefined);
  readonly selectedProducts = signal<string[]>([]);
  readonly isDeleting = signal(false);
  readonly showDeleted = signal(false);

  // Computed query for rxResource
  private readonly query = computed(
    (): ProductQuery => ({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      queryString: this.searchQuery() || undefined,
      categoryId: this.selectedCategoryId(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      showDeleted: this.showDeleted(),
    })
  );

  // rxResource for loading products
  readonly productsResource = rxResource({
    request: this.query,
    loader: ({ request }) => this.productsService.filter(request),
  });

  // rxResource for loading categories
  readonly categoriesResource = rxResource({
    loader: () =>
      this.categoriesService.filter({
        page: 1,
        pageSize: 100,
        sortBy: 'nameEn',
        sortOrder: 'asc',
      }),
  });

  // Computed properties
  readonly products = computed(() => this.productsResource.value()?.data || []);
  readonly totalItems = computed(
    () => this.productsResource.value()?.total || 0
  );
  readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.pageSize())
  );
  readonly isLoading = computed(() => this.productsResource.isLoading());
  readonly error = computed(() => this.productsResource.error());
  readonly hasProducts = computed(() => this.products().length > 0);
  readonly categories = computed(
    () => this.categoriesResource.value()?.data || []
  );
  readonly allSelected = computed(
    () =>
      this.products().length > 0 &&
      this.products().every((product) =>
        this.selectedProducts().includes(product.id)
      )
  );
  readonly hasSelection = computed(() => this.selectedProducts().length > 0);

  // Search form
  readonly searchForm = this.fb.group({
    search: [''],
    categoryId: [''],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
  });

  constructor() {
    // Effect to handle search form changes
    effect(() => {
      const formValue = this.searchForm.value;
      this.searchQuery.set(formValue.search || '');
      this.selectedCategoryId.set(formValue.categoryId || undefined);
      this.minPrice.set(formValue.minPrice || undefined);
      this.maxPrice.set(formValue.maxPrice || undefined);
      this.currentPage.set(1); // Reset to first page on search
    });
  }

  // Event handlers
  onSearch(): void {
    const formValue = this.searchForm.value;
    this.searchQuery.set(formValue.search || '');
    this.selectedCategoryId.set(formValue.categoryId || undefined);
    this.minPrice.set(formValue.minPrice || undefined);
    this.maxPrice.set(formValue.maxPrice || undefined);
    this.currentPage.set(1);
  }

  onClearSearch(): void {
    this.searchForm.reset();
    this.searchQuery.set('');
    this.selectedCategoryId.set(undefined);
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
    this.currentPage.set(1);
  }

  onSort(field: keyof Product): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onToggleDeleted(): void {
    this.showDeleted.update((value) => !value);
    this.currentPage.set(1);
  }

  onSelectProduct(productId: string): void {
    this.selectedProducts.update((selected) => {
      const index = selected.indexOf(productId);
      if (index > -1) {
        return selected.filter((id) => id !== productId);
      } else {
        return [...selected, productId];
      }
    });
  }

  onSelectAll(): void {
    if (this.allSelected()) {
      this.selectedProducts.set([]);
    } else {
      this.selectedProducts.set(this.products().map((product) => product.id));
    }
  }

  async onBulkDelete(): Promise<void> {
    if (this.selectedProducts().length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${
        this.selectedProducts().length
      } products?`
    );
    if (!confirmed) return;

    this.isDeleting.set(true);
    try {
      await this.productsService.bulkDelete(this.selectedProducts());
      this.selectedProducts.set([]);
      this.productsResource.reload();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Error deleting products. Please try again.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  async onDeleteProduct(product: Product): Promise<void> {
    const confirmed = confirm(
      `Are you sure you want to delete "${product.nameEn}"?`
    );
    if (!confirmed) return;

    try {
      await this.productsService.delete(product.id);
      this.productsResource.reload();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  }

  onCreateProduct(): void {
    this.router.navigate(['/products/create']);
  }

  onEditProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  onViewProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  // Utility methods
  getCategoryName(categoryId: number): string {
    const category = this.categories().find((c) => c.id === categoryId);
    return category?.nameEn || 'Unknown Category';
  }

  getDiscountPercentage(price: number, oldPrice?: number): number {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
}
