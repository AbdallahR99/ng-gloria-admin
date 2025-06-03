import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { ProductsService } from '@core/services/repository/products.service';
import { Product } from '@core/models/product.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-product-details',
  imports: [SHARED_MODULES],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsComponent {
  private readonly productsService = inject(ProductsService);

  id = input.required<string>();

  product = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params: { id } }) => this.productsService.getById(id),
  });

  


}
