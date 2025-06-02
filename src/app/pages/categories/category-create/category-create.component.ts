import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { FacadeService } from '@app/core/services/facade-service.service';
import { CategoryCreateOrUpdate } from '@app/core/models/category.model';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { parseFilesToBase64 } from '@app/core/utils/image-base64-parser';

@Component({
  selector: 'app-category-create',
  imports: [SHARED_MODULES],
  templateUrl: './category-create.component.html',
  styleUrl: './category-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCreateComponent {
  private readonly facade = inject(FacadeService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  routes = APP_ROUTES;

  // Signals for state management
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly imagePreview = signal<string | null>(null);

  // Reactive form
  readonly categoryForm: FormGroup = this.fb.group({
    nameEn: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    nameAr: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    slug: [
      '',
      [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)],
    ],
    slugAr: [
      '',
      [Validators.pattern(/^[\u0600-\u06FF0-9]+(?:-[\u0600-\u06FF0-9]+)*$/)],
    ],
    metaTitleEn: ['', [Validators.maxLength(60)]],
    metaTitleAr: ['', [Validators.maxLength(60)]],
    metaDescriptionEn: ['', [Validators.maxLength(160)]],
    metaDescriptionAr: ['', [Validators.maxLength(160)]],
    imageFile: [''],
  });

  constructor() {
    // Auto-generate slug from English name
    this.categoryForm.get('nameEn')?.valueChanges.subscribe((value) => {
      if (value && !this.categoryForm.get('slug')?.touched) {
        const slug = this.generateSlug(value);
        this.categoryForm.get('slug')?.setValue(slug);
      }
    });

    // Auto-generate Arabic slug from Arabic name
    this.categoryForm.get('nameAr')?.valueChanges.subscribe((value) => {
      if (value && !this.categoryForm.get('slugAr')?.touched) {
        const slugAr = this.generateArabicSlug(value);
        this.categoryForm.get('slugAr')?.setValue(slugAr);
      }
    });
  }

  // Form submission
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.categoryForm.value;
    const categoryData: CategoryCreateOrUpdate = {
      nameEn: formValue.nameEn?.trim(),
      nameAr: formValue.nameAr?.trim(),
      slug: formValue.slug?.trim(),
      slugAr: formValue.slugAr?.trim() || undefined,
      metaTitleEn: formValue.metaTitleEn?.trim() || undefined,
      metaTitleAr: formValue.metaTitleAr?.trim() || undefined,
      metaDescriptionEn: formValue.metaDescriptionEn?.trim() || undefined,
      metaDescriptionAr: formValue.metaDescriptionAr?.trim() || undefined,
      imageFile: formValue.imageFile || undefined,
    };

    this.facade.categoryService.create(categoryData).subscribe({
      next: (result) => {
        // Navigate to the created category details page
        this.router.navigate([APP_ROUTES.CATEGORY_DETAIL, result.id]);
      },
      error: (error: any) => {
        console.error('Error creating category:', error);
        this.error.set(
          error?.message || 'An error occurred while creating the category'
        );
        this.isLoading.set(false);
      },
    });
  }

  // Image handling
  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image size must be less than 5MB');
      return;
    }

    try {
      // Use the base64 parser utility
      const [parsedFile] = await parseFilesToBase64(file);

      this.imagePreview.set(parsedFile.base64);
      this.categoryForm.get('imageFile')?.setValue(parsedFile.base64);
      this.error.set(null);
    } catch (error) {
      console.error('Error parsing image:', error);
      this.error.set('Failed to process the image. Please try again.');
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.categoryForm.get('imageFile')?.setValue('');
    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  clearImage() {
    this.categoryForm.get('image')?.setValue(null);
  }

  // Navigation
  onCancel(): void {
    this.router.navigate([APP_ROUTES.CATEGORIES]);
  }

  // Utility methods
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  private generateArabicSlug(text: string): string {
    return text
      .trim()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Keep Arabic characters, words, spaces, hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach((key) => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength'])
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength'])
      return `${fieldName} must not exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) {
      if (fieldName === 'slug')
        return 'Slug must contain only lowercase letters, numbers, and hyphens';
      if (fieldName === 'slugAr')
        return 'Arabic slug must contain only Arabic letters, numbers, and hyphens';
    }

    return 'Invalid value';
  }

  /**
   * Clear error message
   */
  public clearError(): void {
    this.error.set(null);
  }
}
