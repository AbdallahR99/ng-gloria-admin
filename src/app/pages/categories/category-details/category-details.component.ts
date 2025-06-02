import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
  signal,
} from '@angular/core';
import { input } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, catchError } from 'rxjs';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { FacadeService } from '@app/core/services/facade-service.service';
import { Category } from '@app/core/models/category.model';

@Component({
  selector: 'app-category-details',
  imports: [SHARED_MODULES],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailsComponent {
  private readonly facade = inject(FacadeService);
  private readonly router = inject(Router);

  // Input signals for route parameters
  public readonly id = input.required<string>();

  // Resource for loading category data
  public readonly categoryResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => {
      if (!params.id) {
        return EMPTY;
      }
      return this.facade.categoryService.getById(params.id).pipe(
        catchError((error) => {
          console.error('Failed to load category:', error);
          return EMPTY;
        })
      );
    },
  });

  // Computed properties
  public readonly category = computed(() => this.categoryResource.value());
  public readonly isLoading = computed(() => this.categoryResource.isLoading());
  public readonly error = computed(() => this.categoryResource.error());
  public readonly hasError = computed(() => !!this.error());
  public readonly hasData = computed(() => !!this.category());

  // Signal to manage the visibility of the delete confirmation modal
  public readonly showDeleteModal = signal(false);

  // Signal to track the deletion state
  public readonly isDeleting = signal(false);

  /**
   * Navigate to edit category
   */
  public navigateToEdit(): void {
    this.router.navigate(['/categories', this.id(), 'edit']);
  }

  /**
   * Navigate to categories list
   */
  public navigateToCategories(): void {
    this.router.navigate(['/categories']);
  }

  /**
   * Delete category
   */
  public deleteCategory(): void {
    const category = this.category();
    if (!category) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete the category "${category.nameEn}"?`
    );

    if (confirmDelete) {
      this.facade.categoryService.delete(`${category.id}`).subscribe({
        next: () => {
          this.navigateToCategories();
        },
        error: (error) => {
          console.error('Failed to delete category:', error);
          alert('Failed to delete category. Please try again.');
        },
      });
    }
  }

  /**
   * Cancel delete operation
   */
  public cancelDelete(): void {
    // Logic to close the delete confirmation dialog
    console.log('Delete operation canceled.');
  }

  /**
   * Confirm delete operation
   */
  public confirmDelete(): void {
    const category = this.category();
    if (!category) return;

    this.facade.categoryService.delete(`${category.id}`).subscribe({
      next: () => {
        console.log('Category deleted successfully.');
        this.navigateToCategories();
      },
      error: (error) => {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. Please try again.');
      },
    });
  }

  /**
   * Clear error state
   */
  public clearError(): void {
    // Resetting the error state by reloading the resource
    this.categoryResource.reload();
    console.log('Error state cleared.');
  }

  /**
   * Reload category data
   */
  public reloadData(): void {
    this.categoryResource.reload();
  }

  /**
   * Get formatted date
   */
  public formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Check if category has image
   */
  public hasImage(): boolean {
    const category = this.category();
    return !!category?.image;
  }

  /**
   * Get image URL
   */
  public getImageUrl(): string {
    const category = this.category();
    return category?.image || '';
  }

  /**
   * Trigger delete confirmation modal
   */
  public onDelete(): void {
    this.showDeleteModal.set(true);
  }
}
