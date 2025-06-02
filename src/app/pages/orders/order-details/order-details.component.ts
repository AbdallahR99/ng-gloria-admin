import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { OrdersService } from '@app/core/services/repository/orders.service';
import type { Order } from '@app/core/models/order.model';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';

@Component({
  selector: 'app-order-details',
  imports: [SHARED_MODULES],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  loadOrder(orderId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.ordersService.getById(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load order');
        console.error('Error loading order:', error);
        this.loading.set(false);
      },
    });
  }

  navigateToEdit() {
    const order = this.order();
    if (order) {
      this.router.navigate([APP_ROUTES.ORDERS, 'update', order.id]);
    }
  }

  navigateToOrders() {
    this.router.navigate([APP_ROUTES.ORDERS]);
  }

  updateOrderStatus(newStatus: string) {
    const order = this.order();
    if (!order) return;

    this.ordersService.updateStatus(order.id, { status: newStatus }).subscribe({
      next: () => {
        this.loadOrder(order.id); // Reload to get updated data
      },
      error: (error) => {
        this.error.set('Failed to update order status');
        console.error('Error updating order status:', error);
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

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }
}
