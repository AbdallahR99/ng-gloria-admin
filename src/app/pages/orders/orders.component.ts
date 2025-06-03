import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { OrdersService } from '@app/core/services/repository/orders.service';
import { OrderQuery, Order, OrderStatusUpdate } from '@app/core/models/order.model';
import { FacadeService } from '@app/core/services/facade-service.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { OrderStatus } from '@app/core/constants/order-status.enum';

@Component({
  selector: 'app-orders',
  imports: [SHARED_MODULES],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {
  private readonly facadeService = inject(FacadeService);
  private readonly router = inject(Router);
  routes = APP_ROUTES;
  statuses = OrderStatus;

  query = signal<OrderQuery>({
    page: 1,
    pageSize: 10,
    sortBy: undefined,
    sortOrder: undefined,
    status: undefined,
    showDeleted: true,
  });

  orders = rxResource({
    params: () => (this.query()),
    stream: ({ params }) => this.facadeService.ordersService.filter(params),
  });

  pageSettings = computed(() => {
    const response = this.orders.value();
    if (!response?.pagination) return null;

    return {
      currentPage: response.pagination.page,
      pageSize: response.pagination.pageSize,
      totalCount: response.pagination.total,
      totalPages: response.pagination.totalPages,
    };
  });

  updateQuery(newQuery: Partial<OrderQuery>) {
    this.query.set({
      ...this.query(),
      ...newQuery,
    });
  }

  onPageChange(page: number) {
    this.updateQuery({ page });
  }

  onPageSizeChange(pageSize: number) {
    this.updateQuery({ pageSize, page: 1 });
  }

  onSearch(queryString: string) {
    this.updateQuery({ queryString, page: 1 });
  }

  onSortChange(sortBy: keyof Order, sortOrder: 'asc' | 'desc') {
    this.updateQuery({ sortBy, sortOrder, page: 1 });
  }

  onFilterChange(filter: Partial<OrderQuery>) {
    this.updateQuery({
      ...filter,
      page: 1,
    });
  }

  onResetFilters() {
    this.updateQuery({
      page: 1,
      pageSize: 10,
      queryString: '',
      status: undefined,
      fromDate: undefined,
      toDate: undefined,
      showDeleted: true,
      sortBy: undefined,
      sortOrder: undefined,
    });
  }

  paginatedTo = computed(() => this.pageSettings()!.currentPage * this.pageSettings()!.pageSize, (this.pageSettings()?.totalCount ?? 0));

  async onDeleteOrder(orderId: string) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      await firstValueFrom(this.facadeService.ordersService.delete(orderId));
      this.updateQuery({ page: 1 }); // Refresh the order list
    }
  }

  async setOrderStatus(orderStatusUpdate: OrderStatusUpdate) {
    if (!orderStatusUpdate.id) throw new Error('Order ID is required for status update');

    if (confirm(`Are you sure you want to set the order status to ${orderStatusUpdate.status}?`)) {
      const result = await firstValueFrom(this.facadeService.ordersService.updateStatus(orderStatusUpdate.id, orderStatusUpdate));
      this.orders.reload(); // Refresh the order list
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
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
}
