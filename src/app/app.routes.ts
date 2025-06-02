import { Routes } from '@angular/router';
import { APP_ROUTES } from './core/constants/app-routes.enum';

export const routes: Routes = [
  {
    path: '',
    redirectTo: APP_ROUTES.HOME,
    pathMatch: 'full',
  },
  {
    path: APP_ROUTES.HOME.slice(1), // Remove leading slash for routing
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: APP_ROUTES.PRODUCTS.slice(1),
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (m) => m.ProductsComponent
      ),
  },
  {
    path: `${APP_ROUTES.PRODUCTS.slice(1)}/create`,
    loadComponent: () =>
      import('./pages/products/product-create/product-create.component').then(
        (m) => m.ProductCreateComponent
      ),
  },
  {
    path: `${APP_ROUTES.PRODUCTS.slice(1)}/update/:id`,
    loadComponent: () =>
      import('./pages/products/product-update/product-update.component').then(
        (m) => m.ProductUpdateComponent
      ),
  },
  {
    path: `${APP_ROUTES.PRODUCTS.slice(1)}/:id`,
    loadComponent: () =>
      import('./pages/products/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent
      ),
  },
  {
    path: APP_ROUTES.ORDERS.slice(1), // Remove leading slash
    loadComponent: () =>
      import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: `${APP_ROUTES.ORDERS.slice(1)}/create`,
    loadComponent: () =>
      import('./pages/orders/order-create/order-create.component').then(
        (m) => m.OrderCreateComponent
      ),
  },
  {
    path: `${APP_ROUTES.ORDERS.slice(1)}/update/:id`,
    loadComponent: () =>
      import('./pages/orders/order-update/order-update.component').then(
        (m) => m.OrderUpdateComponent
      ),
  },
  {
    path: `${APP_ROUTES.ORDERS.slice(1)}/:id`,
    loadComponent: () =>
      import('./pages/orders/order-details/order-details.component').then(
        (m) => m.OrderDetailsComponent
      ),
  },
  {
    path: APP_ROUTES.INSPIRED_PRODUCTS.slice(1), // Remove leading slash
    loadComponent: () =>
      import('./pages/inspired-products/inspired-products.component').then(
        (m) => m.InspiredProductsComponent
      ),
  },
  {
    path: `${APP_ROUTES.INSPIRED_PRODUCTS.slice(1)}/create`,
    loadComponent: () =>
      import(
        './pages/inspired-products/inspired-product-create/inspired-product-create.component'
      ).then((m) => m.InspiredProductCreateComponent),
  },
  {
    path: `${APP_ROUTES.INSPIRED_PRODUCTS.slice(1)}/update/:id`,
    loadComponent: () =>
      import(
        './pages/inspired-products/inspired-product-update/inspired-product-update.component'
      ).then((m) => m.InspiredProductUpdateComponent),
  },
  {
    path: `${APP_ROUTES.INSPIRED_PRODUCTS.slice(1)}/:id`,
    loadComponent: () =>
      import(
        './pages/inspired-products/inspired-product-details/inspired-product-details.component'
      ).then((m) => m.InspiredProductDetailsComponent),
  },
  {
    path: APP_ROUTES.CATEGORIES.slice(1), // Remove leading slash
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
  },
  {
    path: `${APP_ROUTES.CATEGORIES.slice(1)}/create`,
    loadComponent: () =>
      import(
        './pages/categories/category-create/category-create.component'
      ).then((m) => m.CategoryCreateComponent),
  },
  {
    path: `${APP_ROUTES.CATEGORIES.slice(1)}/update/:id`,
    loadComponent: () =>
      import(
        './pages/categories/category-update/category-update.component'
      ).then((m) => m.CategoryUpdateComponent),
  },
  {
    path: `${APP_ROUTES.CATEGORIES.slice(1)}/:id`,
    loadComponent: () =>
      import(
        './pages/categories/category-details/category-details.component'
      ).then((m) => m.CategoryDetailsComponent),
  },
  {
    path: APP_ROUTES.NOT_FOUND,
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
