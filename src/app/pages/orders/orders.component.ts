import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { OrdersService } from '@app/core/services/repository/orders.service';
import type { Order } from '@app/core/models/order.model';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';

@Component({
  selector: 'app-orders',
  imports: [SHARED_MODULES],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);

    this.ordersService.list().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load orders');
        console.error('Error loading orders:', error);
        this.loading.set(false);
      },
    });
  }

  navigateToOrder(orderId: string) {
    this.router.navigate([APP_ROUTES.ORDERS, orderId]);
  }

  navigateToCreate() {
    this.router.navigate([APP_ROUTES.ORDERS, 'create']);
  }

  navigateToUpdate(orderId: string) {
    this.router.navigate([APP_ROUTES.ORDERS, 'update', orderId]);
  }

  deleteOrder(orderId: string) {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    this.ordersService.delete(orderId).subscribe({
      next: () => {
        this.loadOrders(); // Reload the list
      },
      error: (error) => {
        this.error.set('Failed to delete order');
        console.error('Error deleting order:', error);
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge-warning';
      case 'processing':
        return 'badge-info';
      case 'shipped':
        return 'badge-primary';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
