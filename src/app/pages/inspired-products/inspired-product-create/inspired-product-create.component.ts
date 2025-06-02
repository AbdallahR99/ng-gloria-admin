import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { InspiredProductsService } from '@app/core/services/repository/inspired-products.service';
import { TranslateService } from '@ngx-translate/core';
import { InspiredProductCreateOrUpdate } from '@app/core/models/inspired-product.model';

@Component({
  selector: 'app-inspired-product-create',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-product-create.component.html',
  styleUrl: './inspired-product-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductCreateComponent {
  private readonly inspiredProductsService = inject(InspiredProductsService);
  private readonly translateService = inject(TranslateService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // State signals
  readonly isSubmitting = signal(false);
  readonly selectedImage = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly showSuccessToast = signal<boolean>(false);

  // Form - renamed to productForm to match template
  readonly productForm = this.createForm();

  // Computed properties
  readonly isFormValid = computed(() => this.productForm.valid);
  readonly canSubmit = computed(
    () => this.isFormValid() && !this.isSubmitting()
  );

  constructor() {
    // Auto-save effect
    effect(() => {
      const formValue = this.productForm.value;
      if (this.productForm.dirty && this.productForm.valid) {
        // Auto-save logic could go here if needed
      }
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      nameEn: ['', [Validators.required, Validators.maxLength(255)]],
      nameAr: ['', [Validators.required, Validators.maxLength(255)]],
      descriptionEn: ['', [Validators.maxLength(1000)]],
      descriptionAr: ['', [Validators.maxLength(1000)]],
      metaTitleEn: ['', [Validators.maxLength(255)]],
      metaTitleAr: ['', [Validators.maxLength(255)]],
      metaDescriptionEn: ['', [Validators.maxLength(500)]],
      metaDescriptionAr: ['', [Validators.maxLength(500)]],
    });
  }

  async onImageSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      this.selectedImage.set(null);
      this.previewUrl.set(null);
      this.imagePreview.set(null);
      this.uploadError.set(null);
      return;
    }

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.uploadError.set('Invalid image format');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError.set('Image too large (max 5MB)');
        return;
      }

      // Convert to base64
      const base64 = await this.fileToBase64(file);
      this.selectedImage.set(base64);

      // Create preview URL
      const url = URL.createObjectURL(file);
      this.previewUrl.set(url);
      this.imagePreview.set(url);
      this.uploadError.set(null);
    } catch (error: unknown) {
      console.error('Error processing image:', error);
      this.uploadError.set('Image processing failed');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.previewUrl.set(null);
    this.imagePreview.set(null);
    this.uploadError.set(null);

    // Clear the file input
    const fileInput = document.getElementById(
      'image-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  goBack(): void {
    this.location.back();
  }

  onRemoveImage(): void {
    this.selectedImage.set(null);
    this.previewUrl.set(null);

    // Clear the file input
    const fileInput = document.getElementById(
      'image-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.productForm.valid || this.isSubmitting()) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData: InspiredProductCreateOrUpdate = {
        ...this.productForm.value,
        imageFile: this.selectedImage() || undefined,
      };

      await firstValueFrom(this.inspiredProductsService.create(formData));

      this.showSuccessToast.set(true);
      await this.router.navigate(['/inspired-products']);
    } catch (error: unknown) {
      console.error('Error creating inspired product:', error);
      // Handle error appropriately
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    if (this.productForm.dirty) {
      if (
        confirm(this.translateService.instant('common.confirmDiscardChanges'))
      ) {
        this.router.navigate(['/inspired-products']);
      }
    } else {
      this.router.navigate(['/inspired-products']);
    }
  }

  // Utility methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.productForm.get(fieldName);
    if (!field || field.valid) return null;

    if (field.errors?.['required']) {
      return this.translateService.instant('validation.required');
    }
    if (field.errors?.['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return this.translateService.instant('validation.maxLength', {
        max: maxLength,
      });
    }

    return null;
  }
}
