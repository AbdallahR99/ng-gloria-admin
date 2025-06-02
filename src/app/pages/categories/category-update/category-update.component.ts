import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap } from 'rxjs';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { FacadeService } from '@app/core/services/facade-service.service';
import {
  Category,
  CategoryCreateOrUpdate,
} from '@app/core/models/category.model';
import { parseFilesToBase64 } from '@app/core/utils/image-base64-parser';

@Component({
  selector: 'app-category-update',
  standalone: true,
  imports: SHARED_MODULES,
  templateUrl: './category-update.component.html',
  styleUrl: './category-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryUpdateComponent {
  private readonly facade = inject(FacadeService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Input signals for route parameters
  public readonly id = input.required<string>();

  // Signals for component state
  public readonly isLoading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly imagePreview = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);

  // Form
  public readonly categoryForm: FormGroup;

  // Resource for loading category data
  public readonly categoryResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => {
      if (!params.id) {
        return EMPTY;
      }
      return this.facade.categoryService.getById(params.id).pipe(
        catchError((error) => {
          this.error.set(
            'Failed to load category: ' + (error.message || 'Unknown error')
          );
          return EMPTY;
        })
      );
    },
  });

  // Computed properties
  public readonly category = computed(() => this.categoryResource.value());
  public readonly isResourceLoading = computed(() =>
    this.categoryResource.isLoading()
  );
  public readonly resourceError = computed(() => this.categoryResource.error());
  public readonly hasChanges = computed(() => this.categoryForm.dirty);
  public readonly canSave = computed(
    () => this.categoryForm.valid && this.hasChanges() && !this.isLoading()
  );

  constructor() {
    // Initialize form
    this.categoryForm = this.fb.group({
      nameEn: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      nameAr: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      slug: [
        '',
        [Validators.required, Validators.maxLength(100), this.slugValidator],
      ],
      slugAr: [
        '',
        [Validators.required, Validators.maxLength(100), this.slugValidator],
      ],
      metaTitleEn: ['', [Validators.maxLength(200)]],
      metaTitleAr: ['', [Validators.maxLength(200)]],
      metaDescriptionEn: ['', [Validators.maxLength(500)]],
      metaDescriptionAr: ['', [Validators.maxLength(500)]],
      imageFile: [''],
    });

    // Set up auto-slug generation
    this.setupAutoSlugGeneration();

    // Watch for category data and populate form
    this.watchCategoryData();
  }

  /**
   * Watch for category data and populate form
   */
  private watchCategoryData(): void {
    // Use effect to watch for category data changes and populate form
    effect(() => {
      const category = this.category();
      if (category) {
        this.populateForm(category);
      }
    });

    // Watch for resource errors
    effect(() => {
      const error = this.resourceError();
      if (error) {
        this.error.set(
          'Failed to load category: ' + (error.message || 'Unknown error')
        );
      }
    });
  }

  /**
   * Populate form with category data
   */
  private populateForm(category: Category): void {
    this.categoryForm.patchValue({
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      slug: category.slug,
      slugAr: category.slugAr,
      metaTitleEn: category.metaTitleEn || '',
      metaTitleAr: category.metaTitleAr || '',
      metaDescriptionEn: category.metaDescriptionEn || '',
      metaDescriptionAr: category.metaDescriptionAr || '',
      imageFile: category.image || '',
    });

    // Set image preview if image exists
    if (category.image) {
      this.imagePreview.set(category.image);
    }
  }

  /**
   * Set up auto-slug generation
   */
  private setupAutoSlugGeneration(): void {
    // Auto-generate English slug from English name
    this.categoryForm.get('nameEn')?.valueChanges.subscribe((value) => {
      if (value && !this.categoryForm.get('slug')?.dirty) {
        const slug = this.generateSlug(value);
        this.categoryForm.get('slug')?.setValue(slug);
      }
    });

    // Auto-generate Arabic slug from Arabic name
    this.categoryForm.get('nameAr')?.valueChanges.subscribe((value) => {
      if (value && !this.categoryForm.get('slugAr')?.dirty) {
        const slug = this.generateArabicSlug(value);
        this.categoryForm.get('slugAr')?.setValue(slug);
      }
    });
  }

  /**
   * Generate slug from English text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate slug from Arabic text
   */
  private generateArabicSlug(text: string): string {
    return text
      .trim()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Custom validator for slug format
   */
  private slugValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    // Check for English slug pattern
    const englishSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    // Check for Arabic slug pattern
    const arabicSlugPattern = /^[\u0600-\u06FF0-9]+(?:-[\u0600-\u06FF0-9]+)*$/;

    if (!englishSlugPattern.test(value) && !arabicSlugPattern.test(value)) {
      return { invalidSlug: true };
    }

    return null;
  }

  /**
   * Handle image selection
   */
  public async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    try {
      // Use the existing base64 parser utility - it accepts File | FileList and returns Promise
      const results = await parseFilesToBase64(input.files);
      if (results.length > 0) {
        const result = results[0];
        this.imagePreview.set(result.base64);
        this.categoryForm.get('imageFile')?.setValue(result.base64);
        this.categoryForm.get('imageFile')?.setErrors(null);
      }
    } catch (error) {
      console.error('Error parsing image file:', error);
      this.categoryForm.get('imageFile')?.setErrors({ parseError: true });
    }
  }

  /**
   * Clear selected image
   */
  public clearImage(): void {
    this.imagePreview.set(null);
    this.categoryForm.get('imageFile')?.setValue('');

    // Clear file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Remove image
   */
  public onRemoveImage(): void {
    this.categoryForm.get('imageFile')?.setValue(null);
    this.imagePreview.set(null);
  }

  /**
   * Check if form field is invalid
   */
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  public onSubmit(): void {
    if (this.categoryForm.invalid || this.isLoading()) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.categoryForm.value;
    const updateData: CategoryCreateOrUpdate = {
      nameEn: formValue.nameEn,
      nameAr: formValue.nameAr,
      slug: formValue.slug,
      slugAr: formValue.slugAr,
      metaTitleEn: formValue.metaTitleEn || null,
      metaTitleAr: formValue.metaTitleAr || null,
      metaDescriptionEn: formValue.metaDescriptionEn || null,
      metaDescriptionAr: formValue.metaDescriptionAr || null,
      imageFile: formValue.imageFile || null,
    };

    this.facade.categoryService.update(this.id(), updateData).subscribe({
      next: () => {
        this.successMessage.set('Category updated successfully');
        this.navigateToCategories();
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to update category');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Mark all form fields as touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach((key) => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Navigate to categories list
   */
  public navigateToCategories(): void {
    this.router.navigate(['/categories']);
  }

  /**
   * Navigate to category details
   */
  public navigateToDetails(): void {
    this.router.navigate(['/categories', this.id(), 'details']);
  }

  /**
   * Clear error message
   */
  public clearError(): void {
    this.error.set(null);
  }
}
