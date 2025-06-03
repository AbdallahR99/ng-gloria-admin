import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { FacadeService } from '@app/core/services/facade-service.service';
import { Order, OrderStatusUpdate, OrderItem } from '@app/core/models/order.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { OrderStatus } from '@app/core/constants/order-status.enum';

@Component({
  selector: 'app-order-details',
  imports: [SHARED_MODULES],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  private readonly facadeService = inject(FacadeService);
  private readonly router = inject(Router);

  // Input for order ID
  id = input.required<string>();

  routes = APP_ROUTES;
  statuses = OrderStatus;

  // Resource for loading order details
  order = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.facadeService.ordersService.getById(params.id),
  });

  async updateOrderStatus(status: OrderStatus) {
    const orderData = this.order.value();
    if (!orderData?.id) return;

    if (confirm(`Are you sure you want to update the order status to ${status}?`)) {
      try {
        const statusUpdate: OrderStatusUpdate = {
          id: orderData.id,
          status,
          userId: orderData.userId,
          orderCode: orderData.orderCode,
        };

        await firstValueFrom(this.facadeService.ordersService.updateStatus(orderData.id, statusUpdate));
        this.order.reload(); // Refresh the order data
      } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
      }
    }
  }

  async deleteOrder() {
    const orderData = this.order.value();
    if (!orderData?.id) return;

    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await firstValueFrom(this.facadeService.ordersService.delete(orderData.id));
        this.router.navigate([this.routes.ORDERS]);
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
      }
    }
  }

  refreshOrder() {
    this.order.reload();
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case OrderStatus.Pending:
        return 'badge-warning';
      case OrderStatus.Processing:
        return 'badge-info';
      case OrderStatus.Shipped:
        return 'badge-primary';
      case OrderStatus.Delivered:
        return 'badge-success';
      case OrderStatus.Failed:
        return 'badge-error';
      case OrderStatus.Cancelled:
        return 'badge-error';
      case OrderStatus.Confirmed:
        return 'badge-success';
      case OrderStatus.Refunded:
        return 'badge-neutral';
      case OrderStatus.Returned:
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }

  getTotalQuantity(items?: OrderItem[]): number {
    return items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }
}
