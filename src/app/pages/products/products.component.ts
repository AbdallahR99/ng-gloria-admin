import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { ProductsService } from '@app/core/services/repository/products.service';
import { CategoriesService } from '@app/core/services/repository/categories.service';
import { Product, ProductQuery } from '@app/core/models/product.model';
import { APP_ROUTES } from '@app/core/constants/app-routes.enum';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';
import { FacadeService } from '@app/core/services/facade-service.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [SHARED_MODULES],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  facadeService = inject(FacadeService);
  routes = APP_ROUTES;

  query = signal<ProductQuery>({
    page: 1,
    pageSize: 10,
    queryString: '',
    maxPrice: undefined,
    minPrice: undefined,
    color: undefined,
    size: undefined,
    showDeleted: true,
    sortBy: undefined,
    sortOrder: undefined,
  });


  products = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.facadeService.productsService.filter(params),
  });
  Math = Math;

  pageSettings = computed(() => this.products.value()?.pagination);

  updateQuery(newQuery: Partial<ProductQuery>) {
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
  onSortChange(sortBy: keyof Product, sortOrder: 'asc' | 'desc') {
    this.updateQuery({ sortBy, sortOrder, page: 1 });
  }
  onFilterChange(filter: Partial<ProductQuery>) {
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
      maxPrice: undefined,
      minPrice: undefined,
      color: undefined,
      size: undefined,
      showDeleted: true,
      sortBy: undefined,
      sortOrder: undefined,
    });
  }

  async onDeleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      await firstValueFrom(this.facadeService.productsService.delete(productId));
      this.updateQuery({ page: 1 }); // Refresh the product list
    }
  }

  // for update use [routerLink]="[routes.PRODUCT_UPDATE, product.id]"
  // for create use [routerLink]="routes.PRODUCT_CREATE"
  // for details use [routerLink]="[routes.PRODUCT_DETAILS, product.id]"




}
