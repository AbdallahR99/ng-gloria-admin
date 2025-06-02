import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icons';
import { rxResource } from '@angular/core/rxjs-interop';

import { ProductsService } from '../../../core/services/repository/products.service';
import { CategoriesService } from '../../../core/services/repository/categories.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  CreateProductRequest,
  CreateProductVariantRequest,
} from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { processImageFile } from '../../../shared/utils/image-utils';

@Component({
  selector: 'app-product-create',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly toastService = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  // State signals
  readonly isSubmitting = signal(false);
  readonly selectedImages = signal<string[]>([]);
  readonly variants = signal<CreateProductVariantRequest[]>([]);
  readonly previewUrls = signal<string[]>([]);

  // Form
  readonly form = this.createForm();

  // Categories resource
  readonly categoriesResource = rxResource({
    request: () => ({}),
    loader: () => this.categoriesService.getCategories({ limit: 1000 }),
  });

  // Computed properties
  readonly categories = computed(
    () => this.categoriesResource.value()?.data ?? []
  );
  readonly isLoading = computed(() => this.categoriesResource.isLoading());
  readonly hasVariants = computed(() => this.variants().length > 0);
  readonly canSubmit = computed(
    () =>
      this.form.valid &&
      !this.isSubmitting() &&
      this.selectedImages().length > 0
  );

  constructor() {
    // Auto-generate slug when name changes
    effect(() => {
      const nameControl = this.form.get('name');
      const slugControl = this.form.get('slug');

      if (
        nameControl &&
        slugControl &&
        nameControl.value &&
        !slugControl.value
      ) {
        const slug = this.generateSlug(nameControl.value);
        slugControl.setValue(slug);
      }
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(255),
        ],
      ],
      slug: [
        '',
        [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)],
      ],
      description: [''],
      short_description: ['', [Validators.maxLength(500)]],
      sku: ['', [Validators.required, Validators.maxLength(100)]],
      base_price: [0, [Validators.required, Validators.min(0)]],
      discount_price: [0, [Validators.min(0)]],
      is_active: [true],
      is_featured: [false],
      category_id: ['', [Validators.required]],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      weight: [0, [Validators.min(0)]],
      dimensions: this.formBuilder.group({
        length: [0, [Validators.min(0)]],
        width: [0, [Validators.min(0)]],
        height: [0, [Validators.min(0)]],
      }),
      meta_title: [''],
      meta_description: [''],
      tags: [''],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.processFiles(files);
    }
  }

  private async processFiles(files: File[]): Promise<void> {
    const currentImages = this.selectedImages();
    const currentPreviews = this.previewUrls();

    for (const file of files) {
      try {
        const base64 = await processImageFile(file);
        const previewUrl = URL.createObjectURL(file);

        this.selectedImages.update((images) => [...images, base64]);
        this.previewUrls.update((previews) => [...previews, previewUrl]);
      } catch (error) {
        this.toastService.showError('Failed to process image');
      }
    }
  }

  removeImage(index: number): void {
    const previews = this.previewUrls();
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    this.selectedImages.update((images) =>
      images.filter((_, i) => i !== index)
    );
    this.previewUrls.update((previews) =>
      previews.filter((_, i) => i !== index)
    );
  }

  addVariant(): void {
    const newVariant: CreateProductVariantRequest = {
      name: '',
      sku: '',
      price: 0,
      stock_quantity: 0,
      is_active: true,
      attributes: {},
    };

    this.variants.update((variants) => [...variants, newVariant]);
  }

  updateVariant(
    index: number,
    field: keyof CreateProductVariantRequest,
    value: any
  ): void {
    this.variants.update((variants) =>
      variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  }

  removeVariant(index: number): void {
    this.variants.update((variants) => variants.filter((_, i) => i !== index));
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async onSubmit(): Promise<void> {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);

    try {
      const formValue = this.form.value;
      const tags = formValue.tags
        ? formValue.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];

      const productData: CreateProductRequest = {
        name: formValue.name,
        slug: formValue.slug,
        description: formValue.description,
        short_description: formValue.short_description,
        sku: formValue.sku,
        base_price: Number(formValue.base_price),
        discount_price: formValue.discount_price
          ? Number(formValue.discount_price)
          : null,
        is_active: formValue.is_active,
        is_featured: formValue.is_featured,
        category_id: formValue.category_id,
        stock_quantity: Number(formValue.stock_quantity),
        weight: formValue.weight ? Number(formValue.weight) : null,
        dimensions: {
          length: formValue.dimensions.length || null,
          width: formValue.dimensions.width || null,
          height: formValue.dimensions.height || null,
        },
        meta_title: formValue.meta_title,
        meta_description: formValue.meta_description,
        tags,
        images: this.selectedImages(),
        variants: this.variants().length > 0 ? this.variants() : undefined,
      };

      await this.productsService.createProduct(productData);
      this.toastService.showSuccess('Product created successfully');
      this.router.navigate(['/products']);
    } catch (error) {
      console.error('Error creating product:', error);
      this.toastService.showError('Failed to create product');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    // Clean up blob URLs
    this.previewUrls().forEach((url) => URL.revokeObjectURL(url));
    this.router.navigate(['/products']);
  }
}
