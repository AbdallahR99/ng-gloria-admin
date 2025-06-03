import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,

} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { InspiredProductCreateOrUpdate } from '@app/core/models/inspired-product.model';
import { FacadeService } from '@app/core/services/facade-service.service';

import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { resizeImage } from '@app/core/utils/image-resizer';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-inspired-product-create',
  imports: [SHARED_MODULES],
  templateUrl: './inspired-product-create.component.html',
  styleUrl: './inspired-product-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductCreateComponent {
  private readonly facadeService = inject(FacadeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  routes = APP_ROUTES;


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
      // Note: No need to include isDeleted, createdAt, updatedAt, deletedAt, createdBy, updatedBy as they are managed by the backend

    };

    try {
      await firstValueFrom(this.facadeService.inspiredProductsService.create( payLoad));
      this.router.navigate([APP_ROUTES.INSPIRED_PRODUCTS]);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate([APP_ROUTES.INSPIRED_PRODUCTS]);
  }

}
