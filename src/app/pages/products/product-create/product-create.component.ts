import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '@core/services/repository/products.service';
import { ProductCreateOrUpdate } from '@core/models/product.model';
import { resizeImage, resizeImages } from '@app/core/utils/image-resizer';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { rxResource } from '@angular/core/rxjs-interop';
import { FacadeService } from '@app/core/services/facade-service.service';
import { firstValueFrom } from 'rxjs';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-product-create',
  imports: [SHARED_MODULES],
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent {
  private readonly facadeService = inject(FacadeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  routes = APP_ROUTES

  readonly isSubmitting = signal(false);
  readonly form: FormGroup = this.formBuilder.group({
    nameEn: [null, []],
    nameAr: [null, []],
    metaTitleAr: [null, []],
    metaTitleEn: [null, []],
    metaDescriptionAr: [null, []],
    metaDescriptionEn: [null, []],
    metaKeywords: [null, []],
    slug: [null, []],
    slugAr: [null, []],
    oldPrice: [0, []],
    price: [0, []],
    inspiredProductId: [null, []],
    categoriyId: [null, []],
    sku: [null, []],
    colors: [[], []],
    sizes: [[], []],
    imageFiles: [[], []],


    descriptionEn: [null],
    descriptionAr: [null],
    categoryId: [null, []],
    quantity: [1, []],

    thumbnail: [null, []],
  });

  categories = rxResource({
    stream: () => this.facadeService.categoryService.get(),
  });
  inspiredProducts = rxResource({
    stream: () => this.facadeService.inspiredProductsService.get(),
  });

  async uploadThumbnail(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const results = await resizeImage(file);
      this.form.patchValue({ thumbnail: results.base64 });
      this.form.get('thumbnail')?.updateValueAndValidity();
    }
  }

  addColor(color: { name: string; hex: string }): void {
    const currentColors = this.form.get('colors')?.value || [];
    currentColors.push(color);
    this.form.patchValue({ colors: currentColors });
    this.form.get('colors')?.updateValueAndValidity();
  }
  removeColor(name: string): void {
    const currentColors = this.form.get('colors')?.value || [];
    const updatedColors = currentColors.filter((color: { name: string }) => color.name !== name);
    this.form.patchValue({ colors: updatedColors });
    this.form.get('colors')?.updateValueAndValidity();
  }
  addSize(size: string): void {
    const currentSizes = this.form.get('sizes')?.value || [];
    if (!currentSizes.includes(size)) {
      currentSizes.push(size);
      this.form.patchValue({ sizes: currentSizes });
      this.form.get('sizes')?.updateValueAndValidity();
    }
  }
  removeSize(size: string): void {
    const currentSizes = this.form.get('sizes')?.value || [];
    const updatedSizes = currentSizes.filter((s: string) => s !== size);
    this.form.patchValue({ sizes: updatedSizes });
    this.form.get('sizes')?.updateValueAndValidity();
  }

  removeThumbnail(): void {
    this.form.patchValue({ thumbnail: '' });
    this.form.get('thumbnail')?.updateValueAndValidity();
  }

  async uploadImages(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const resizedImages = await resizeImages(files);
      this.form.patchValue({ imageFiles: resizedImages.map((img) => img.base64) });
      this.form.get('imageFiles')?.updateValueAndValidity();
    }
  }

  removeImage(index: number): void {
    const currentImages = this.form.get('imageFiles')?.value || [];
    currentImages.splice(index, 1);
    this.form.patchValue({ imageFiles: currentImages });
    this.form.get('imageFiles')?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const payLoad: ProductCreateOrUpdate = {
      categoryId: this.form.value.categoryId,
      nameEn: this.form.value.nameEn,
      nameAr: this.form.value.nameAr,
      metaTitleEn: this.form.value.metaTitleEn,
      metaTitleAr: this.form.value.metaTitleAr,
      metaDescriptionEn: this.form.value.metaDescriptionEn,
      metaDescriptionAr: this.form.value.metaDescriptionAr,
      keywords: this.form.value.metaKeywords,
      slug: this.form.value.slug,
      slugAr: this.form.value.slugAr,
      oldPrice: this.form.value.oldPrice,
      price: this.form.value.price,
      inspiredById: this.form.value.inspiredProductId,
      descriptionAr: this.form.value.descriptionAr,
      descriptionEn: this.form.value.descriptionEn,
      quantity: this.form.value.quantity,
      imagesFiles: this.form.value.imageFiles,
      thumbnailFile: this.form.value.thumbnail,
      isBanned: false, // Default value, can be changed later
      isDeleted: false, // Default value, can be changed later
      sizes: [],
      colors: [],
      sku: this.form.value.sku,

    };
    try {
      await firstValueFrom(this.facadeService.productsService.create(payLoad));
      this.router.navigate([APP_ROUTES.PRODUCTS]);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate([APP_ROUTES.PRODUCTS]);
  }
}
