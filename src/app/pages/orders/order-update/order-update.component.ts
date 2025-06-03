import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { InspiredProductCreateOrUpdate } from '@app/core/models/inspired-product.model';
import { FacadeService } from '@app/core/services/facade-service.service';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { resizeImage } from '@app/core/utils/image-resizer';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-update',
  imports: [SHARED_MODULES],
  templateUrl: './order-update.component.html',
  styleUrl: './order-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderUpdateComponent {}
