import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { InspiredProductsService } from '@app/core/services/repository/inspired-products.service';
import {
  InspiredProduct,
  InspiredProductCreateOrUpdate,
} from '@app/core/models/inspired-product.model';

@Component({
  selector: 'app-inspired-product-update',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-product-update.component.html',
  styleUrl: './inspired-product-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductUpdateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inspiredProductsService = inject(InspiredProductsService);
  private readonly router = inject(Router);

  // Input signal for product ID from route
  readonly id = input.required<string>();

  // Form for product data
  readonly productForm: FormGroup = this.fb.group({
    nameEn: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    nameAr: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    descriptionEn: ['', [Validators.maxLength(1000)]],
    descriptionAr: ['', [Validators.maxLength(1000)]],
    imagePath: [''],
    isActive: [true, [Validators.required]],
  });

  // Signals for component state
  readonly isSubmitting = signal(false);
  readonly imagePreview = signal<string | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly showSuccessToast = signal(false);

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

  constructor() {
    // Effect to populate form when product loads
    effect(() => {
      const product = this.product();
      if (product) {
        this.populateForm(product);
      }
    });
  }

  /**
   * Populate form with product data
   */
  private populateForm(product: InspiredProduct): void {
    this.productForm.patchValue({
      nameEn: product.nameEn || '',
      nameAr: product.nameAr || '',
      descriptionEn: product.descriptionEn || '',
      descriptionAr: product.descriptionAr || '',
      imagePath: product.imagePath || '',
      isActive: product.isActive ?? true,
    });

    // Set image preview if exists
    if (product.imagePath) {
      this.imagePreview.set(this.getImageUrl(product.imagePath));
    }
  }

  /**
   * Handle file selection for image upload
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.uploadError.set('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('Image size must be less than 5MB');
      return;
    }

    try {
      this.uploadError.set(null);

      // Convert to base64 for preview
      const base64 = await this.fileToBase64(file);
      this.imagePreview.set(base64);

      // Update form with base64 data
      this.productForm.patchValue({ imagePath: base64 });
    } catch (error) {
      console.error('Error processing image:', error);
      this.uploadError.set('Error processing image. Please try again.');
    }
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove selected image
   */
  removeImage(): void {
    this.imagePreview.set(null);
    this.uploadError.set(null);
    this.productForm.patchValue({ imagePath: '' });

    // Clear file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Submit form to update product
   */
  async onSubmit(): Promise<void> {
    if (this.productForm.invalid || this.isSubmitting()) {
      this.markFormGroupTouched();
      return;
    }

    const product = this.product();
    if (!product) return;

    this.isSubmitting.set(true);
    this.uploadError.set(null);

    try {
      const formData: InspiredProductCreateOrUpdate = this.productForm.value;

      await firstValueFrom(
        this.inspiredProductsService
          .update(product.id, formData)
          .pipe(takeUntilDestroyed())
      );

      this.showSuccessToast.set(true);
      setTimeout(() => this.showSuccessToast.set(false), 3000);

      // Navigate back to details
      await this.router.navigate(['/inspired-products', product.id]);
    } catch (error) {
      console.error('Error updating product:', error);
      this.uploadError.set('Error updating product. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Navigate back to product details
   */
  goBack(): void {
    const productId = this.id();
    if (productId) {
      this.router.navigate(['/inspired-products', productId]);
    } else {
      this.router.navigate(['/inspired-products']);
    }
  }

  /**
   * Navigate to products list
   */
  goToList(): void {
    this.router.navigate(['/inspired-products']);
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

  /**
   * Check if form field has error
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.productForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Get error message for form field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength'])
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength'])
      return `${fieldName} must be no more than ${errors['maxlength'].requiredLength} characters`;

    return 'Invalid value';
  }
}
