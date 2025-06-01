import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { SHARED_MODULES } from '../../modules/shared.module';
import { Product } from '@app/core/models/product.model';
import { FacadeService } from '@app/core/services/facade-service.service';
import { CartButtonAddCustomDirective } from '../cart-button/cart-button-add-custom.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'fav-button',
  imports: [SHARED_MODULES],
  templateUrl: './fav-button.component.html',
  styleUrl: './fav-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavButtonComponent {
  router = inject(Router);
  facadeService = inject(FacadeService);
  customAddToCartButton = contentChild(CartButtonAddCustomDirective);
  product = input.required<Product>();

  isLoading = signal<boolean>(false);
  productInFavorites = computed(() => this.product().inFavorites);
  customIsInFav = signal<boolean | null>(null);
  isInFav = computed(() =>
    this.customIsInFav() !== null
      ? this.customIsInFav()
      : this.productInFavorites() || false
  );
  className = input<string>();
  additionalClasses = input<string>('');
  get isLoggedIn() {
    return this.facadeService.authService.isLoggedIn;
  }

  toggle(): void {
    if (!this.isLoggedIn()) {
      // this.router.navigate(['/auth/login'], {
      //   queryParams: {
      //     redirectUrl: `/product/${this.product().slug}`,
      //   },
      // });
      return;
    }
    this.isLoading.set(true);
    this.facadeService.favoritesService.toggle(this.product().id).subscribe({
      next: (res) => {
        this.customIsInFav.set(res.status === 'added');
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
