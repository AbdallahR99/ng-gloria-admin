import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { InspiredProductCreateOrUpdate } from '@app/core/models/inspired-product.model';
import { ProductCreateOrUpdate } from '@app/core/models/product.model';
import { FacadeService } from '@app/core/services/facade-service.service';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { resizeImage, resizeImages } from '@app/core/utils/image-resizer';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-inspired-product-update',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-product-update.component.html',
  styleUrl: './inspired-product-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductUpdateComponent {
  private readonly facadeService = inject(FacadeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  routes = APP_ROUTES;
  id = input.required<string>();
  inspiredProduct = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params: { id } }) => this.facadeService.inspiredProductsService.getById(id),

  });


  readonly isSubmitting = signal(false);
  readonly form: FormGroup = this.formBuilder.group({
    nameEn: [null, [Validators.required, Validators.minLength(2)]],
    nameAr: [null, [Validators.required, Validators.minLength(2)]],
    descriptionEn: [null, [Validators.required, Validators.minLength(2)]],
    descriptionAr: [null, [Validators.required, Validators.minLength(2)]],
    metaTitleEn: [null, [Validators.required, Validators.minLength(2)]],
    metaTitleAr: [null, [Validators.required, Validators.minLength(2)]],
    metaDescriptionEn: [null, [Validators.required, Validators.minLength(2)]],
    metaDescriptionAr: [null, [Validators.required, Validators.minLength(2)]],
    imageFile: [null, [Validators.required]],

  });



  constructor() {
    // Effect to populate form when product data loads
    effect(() => {
      const productData = this.inspiredProduct.value();
      if (productData) {
        this.form.patchValue({
          nameEn: productData.nameEn,
          nameAr: productData.nameAr,
          descriptionEn: productData.descriptionEn,
          descriptionAr: productData.descriptionAr,
          metaTitleEn: productData.metaTitleEn,
          metaTitleAr: productData.metaTitleAr,
          metaDescriptionEn: productData.metaDescriptionEn,
          metaDescriptionAr: productData.metaDescriptionAr,
        });
      }
    });
  }

  async uploadThumbnail(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const results = await resizeImage(file);
      this.form.patchValue({ imageFile: results.base64 });
      this.form.get('imageFile')?.updateValueAndValidity();
    }
  }



  removeThumbnail(): void {
    this.form.patchValue({ imageFile: null });
    this.form.get('imageFile')?.updateValueAndValidity();
  }




  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const payLoad: InspiredProductCreateOrUpdate = {

      nameEn: this.form.value.nameEn,
      nameAr: this.form.value.nameAr,
      descriptionEn: this.form.value.descriptionEn,
      descriptionAr: this.form.value.descriptionAr,
      metaTitleEn: this.form.value.metaTitleEn,
      metaTitleAr: this.form.value.metaTitleAr,
      metaDescriptionEn: this.form.value.metaDescriptionEn,
      metaDescriptionAr: this.form.value.metaDescriptionAr,
      imageFile: this.form.value.imageFile, // base64 image
      id: this.id(), // Include the ID for update
      // Note: No need to include isDeleted, createdAt, updatedAt, deletedAt, createdBy, updatedBy as they are managed by the backend

    };

    try {
      await firstValueFrom(this.facadeService.inspiredProductsService.update(this.id(), payLoad));
      this.router.navigate([APP_ROUTES.INSPIRED_PRODUCTS]);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate([APP_ROUTES.INSPIRED_PRODUCTS]);
  }

}
