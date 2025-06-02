import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { FacadeService } from '@app/core/services/facade-service.service';
import { Category, CategoryQuery } from '@app/core/models/category.model';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';

@Component({
  selector: 'app-categories',
  imports: [SHARED_MODULES],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  private readonly facade = inject(FacadeService);
  private readonly router = inject(Router);

  // Signals for state management
  readonly searchQuery = model<string>('');
  readonly currentPage = model<number>(1);
  readonly pageSize = model<number>(10);
  readonly sortBy = model<keyof Category>('nameEn');
  readonly sortOrder = model<'asc' | 'desc'>('asc');
  readonly showDeleted = model<boolean>(false);
  readonly selectedIds = model<string[]>([]);

  // Computed query parameters
  readonly queryParams = computed<CategoryQuery>(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize(),
    queryString: this.searchQuery(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    showDeleted: this.showDeleted(),
  }));

  // Resource for loading categories with pagination
  readonly categoriesResource = rxResource({
    params: this.queryParams,
    stream: ({ params }) => this.facade.categoryService.getFilter(params),
  });

  // Computed properties for template
  readonly categories = computed(
    () => this.categoriesResource.value()?.data ?? []
  );
  readonly pagination = computed(
    () => this.categoriesResource.value()?.pagination
  );
  readonly isLoading = computed(() => this.categoriesResource.isLoading());
  readonly error = computed(() => this.categoriesResource.error());

  // Computed properties for pagination info
  readonly totalPages = computed(() => this.pagination()?.totalPages ?? 0);
  readonly totalItems = computed(() => this.pagination()?.total ?? 0);
  readonly isFirstPage = computed(() => this.currentPage() === 1);
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages());

  // Computed property for pagination math
  readonly paginationInfo = computed(() => {
    const currentPage = this.currentPage();
    const pageSize = this.pageSize();
    const totalItems = this.totalItems();

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return { start, end, totalItems };
  });

  // Search and filter methods
  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1); // Reset to first page when searching
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when changing page size
  }

  onSort(field: keyof Category): void {
    if (this.sortBy() === field) {
      // Toggle sort order if same field
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1); // Reset to first page when sorting
  }

  onToggleDeleted(): void {
    this.showDeleted.set(!this.showDeleted());
    this.currentPage.set(1); // Reset to first page when toggling deleted
  }

  // Selection methods
  onSelectCategory(id: string): void {
    const currentSelection = this.selectedIds();
    if (currentSelection.includes(id)) {
      this.selectedIds.set(
        currentSelection.filter((selectedId) => selectedId !== id)
      );
    } else {
      this.selectedIds.set([...currentSelection, id]);
    }
  }

  onSelectAllCategories(): void {
    const allIds = this.categories().map((category) => category.id!);
    const currentSelection = this.selectedIds();

    if (currentSelection.length === allIds.length) {
      // Deselect all
      this.selectedIds.set([]);
    } else {
      // Select all visible categories
      this.selectedIds.set(allIds);
    }
  }

  isCategorySelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  isAllSelected(): boolean {
    const visibleIds = this.categories().map((category) => category.id!);
    return (
      visibleIds.length > 0 &&
      visibleIds.every((id) => this.selectedIds().includes(id))
    );
  }

  // Navigation methods
  navigateToCreate(): void {
    this.router.navigate([APP_ROUTES.CATEGORY_CREATE]);
  }

  navigateToDetails(id: string): void {
    this.router.navigate([APP_ROUTES.CATEGORY_DETAIL, id]);
  }

  navigateToEdit(id: string): void {
    this.router.navigate([APP_ROUTES.CATEGORY_UPDATE, id]);
  }

  // Bulk actions
  async onBulkDelete(): Promise<void> {
    const selected = this.selectedIds();
    if (selected.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selected.length} categories?`
    );
    if (!confirmed) return;

    try {
      await this.facade.categoryService.bulkDelete(selected);
      this.selectedIds.set([]);
      // Refresh the data by updating the query params
      this.currentPage.set(this.currentPage());
    } catch (error) {
      console.error('Error deleting categories:', error);
    }
  }

  async onDeleteCategory(id: string): Promise<void> {
    const confirmed = confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;

    try {
      await this.facade.categoryService.delete(id);
      // Refresh the data by updating the query params
      this.currentPage.set(this.currentPage());
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  // Utility methods
  getSortIcon(field: keyof Category): string {
    if (this.sortBy() !== field) return 'sort';
    return this.sortOrder() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2; // Number of pages to show on each side of current page

    const range: number[] = [];
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }
}
