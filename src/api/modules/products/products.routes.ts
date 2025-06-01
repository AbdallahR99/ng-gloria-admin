import { Router } from 'express';
import {
  productGetById,
  productGetBySlug,
  productGetFilter,
  productGetList,
  productPostFilter,
} from './products-get';
import { productPostCreate, productPostBulkCreate } from './products-create';
import { productPutUpdate, productPutBulkUpdate } from './products-update';
import { productDelete, productBulkDelete } from './products-delete';
import { productGetRelated } from './products-related';

const productsRouter = Router();
// GET /api/products - Get all products with optional filtering
productsRouter.get('/', productGetList);

// GET /api/products/list - Get all products with optional filtering
productsRouter.get('/list', productGetList);

// GET /api/products/:slug - Get product by Slug
productsRouter.get('/:slug', productGetBySlug);

// GET /api/products/byId/:id - Get product by ID
productsRouter.get('/byId/:id', productGetById);

// GET /api/products/filter - Get all products with pagination and filtering
productsRouter.get('/filter', productGetFilter);

// POST /api/products/filter - Get all products with pagination and filtering in body
productsRouter.post('/filter', productPostFilter);

// POST /api/products - Create a new product
productsRouter.post('/', productPostCreate);

// POST /api/products/bulk - Create multiple products
productsRouter.post('/bulk', productPostBulkCreate);

// PUT /api/products/:id - Update a product by ID
productsRouter.put('/:id', productPutUpdate);

// PUT /api/products/bulk - Update multiple products
productsRouter.put('/bulk', productPutBulkUpdate);

// DELETE /api/products/:id - Delete a product by ID
productsRouter.delete('/:id', productDelete);

// DELETE /api/products/bulk - Delete multiple products
productsRouter.delete('/bulk', productBulkDelete);

// GET /api/products/:id/related - Get related products by product ID
productsRouter.get('/:slug/related', productGetRelated);

export { productsRouter };
