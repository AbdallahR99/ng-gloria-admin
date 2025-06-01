import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { SHARED_MODULES } from '../../modules/shared.module';
import { Product } from '@app/core/models/product.model';
import { FacadeService } from '@app/core/services/facade-service.service';
import { CartButtonAddCustomDirective } from './cart-button-add-custom.directive';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { single } from 'rxjs';

@Component({
  selector: 'cart-button',
  imports: [SHARED_MODULES],
  templateUrl: './cart-button.component.html',
  styleUrl: './cart-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartButtonComponent {
  router = inject(Router);
  facadeService = inject(FacadeService);
  customAddToCartButton = contentChild(CartButtonAddCustomDirective);
  product = input.required<Product>();
  color = input<string | undefined>(undefined);
  size = input<string | undefined>(undefined);
  customText = input<string | undefined>(undefined);
  isLoading = signal<boolean>(false);
  isAddedManually = signal<boolean>(false); // To track if the product was added manually
  fitHeight = input<boolean>(false);
  isAddedToCart = computed(
    () => this.isAddedManually() || this.product().inCart
  );
  // quantity = computed(
  //   () => this.customQuantity() || this.product().cartQuantity || 1
  // );
  quantity = linkedSignal(() => this.product().cartQuantity || 1);
  className = input<string>();
  additionalClasses = input<string>('');
  get isLoggedIn() {
    return this.facadeService.authService.isLoggedIn;
  }

  addToCart() {
    if (!this.isLoggedIn()) {
      this.router.navigate([APP_ROUTES.AUTH_LOGIN], {
        queryParams: {
          redirectUrl: `${APP_ROUTES.PRODUCT_DETAILS}/${this.product().slug}`,
        },
      });
      return;
    }
    this.isLoading.set(true);
    const cartItem = {
      productId: this.product().id,
      color: this.color(),
      size: this.size(),
      quantity: this.quantity(),
    };
    this.facadeService.cartService
      .upsert({
        productId: cartItem.productId,
        color: cartItem.color,
        size: cartItem.size,
        quantity: cartItem.quantity,
      })
      .subscribe({
        next: (response) => {
          console.log('Added to cart', response);
          this.product().inCart = true; // Update the product's inCart status
          this.isLoading.set(false);
          this.isAddedManually.set(true); // Set the flag to true
        },
        error: (error) => {
          console.error('Error adding to cart', error);
          this.isLoading.set(false);
        },
      });
  }

  removeFromCart() {
    this.isLoading.set(true);
    const cartItem = {
      productId: this.product().id,
      color: this.color(),
      size: this.size(),
    };
    this.facadeService.cartService.delete(cartItem).subscribe({
      next: (response) => {
        console.log('Removed from cart', response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error removing from cart', error);
        this.isLoading.set(false);
      },
    });
  }

  updateQuantity(quantity: number) {
    this.isLoading.set(true);
    const cartItem = {
      productId: this.product().id,
      color: this.color(),
      size: this.size(),
      quantity,
    };
    this.facadeService.cartService.upsert(cartItem).subscribe({
      next: (response) => {
        console.log('Updated quantity in cart', response);
        this.isLoading.set(false);
        this.product().quantity = quantity; // Update the product's quantity
        this.quantity.set(quantity); // Update the custom quantity signal
      },
      error: (error) => {
        console.error('Error updating quantity in cart', error);
        this.isLoading.set(false);
      },
    });
  }

  onQuantityChange(newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeFromCart();
    } else {
      this.updateQuantity(newQuantity);
    }
  }

  increaseQuantity() {
    const newQuantity =
      (this.quantity() ?? this.product().cartQuantity ?? 0) + 1;
    this.onQuantityChange(newQuantity);
  }
  decreaseQuantity() {
    const newQuantity =
      (this.quantity() ?? this.product().cartQuantity ?? 0) - 1;
    if (newQuantity <= 0) {
      this.removeFromCart();
    } else {
      this.onQuantityChange(newQuantity);
    }
  }
  get isEn() {
    return this.facadeService.translatorService.isEn;
  }
}
