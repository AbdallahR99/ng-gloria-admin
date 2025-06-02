import { Router } from 'express';
import {
  inspiredProductGetById,
  inspiredProductGetList,
  inspiredProductGetFilter,
  inspiredProductPostFilter,
} from './inspired-products-get';
import {
  inspiredProductPostCreate,
  inspiredProductPostBulkCreate,
} from './inspired-products-create';
import {
  inspiredProductPutUpdate,
  inspiredProductPutBulkUpdate,
} from './inspired-products-update';
import {
  inspiredProductDelete,
  inspiredProductBulkDelete,
} from './inspired-products-delete';

const inspiredProductsRouter = Router();

// GET /api/inspired-products - Get all inspired products with optional filtering
inspiredProductsRouter.get('/', inspiredProductGetList);

// GET /api/inspired-products/list - Get all inspired products with optional filtering
inspiredProductsRouter.get('/list', inspiredProductGetList);

// GET /api/inspired-products/byId/:id - Get inspired product by ID
inspiredProductsRouter.get('/byId/:id', inspiredProductGetById);

// GET /api/inspired-products/filter - Get all inspired products with pagination and filtering
inspiredProductsRouter.get('/filter', inspiredProductGetFilter);

// POST /api/inspired-products/filter - Get all inspired products with pagination and filtering in body
inspiredProductsRouter.post('/filter', inspiredProductPostFilter);

// POST /api/inspired-products - Create a new inspired product
inspiredProductsRouter.post('/', inspiredProductPostCreate);

// POST /api/inspired-products/bulk - Create multiple inspired products
inspiredProductsRouter.post('/bulk', inspiredProductPostBulkCreate);

// PUT /api/inspired-products/:id - Update an inspired product by ID
inspiredProductsRouter.put('/:id', inspiredProductPutUpdate);

// PUT /api/inspired-products/bulk - Update multiple inspired products
inspiredProductsRouter.put('/bulk', inspiredProductPutBulkUpdate);

// DELETE /api/inspired-products/:id - Delete an inspired product by ID
inspiredProductsRouter.delete('/:id', inspiredProductDelete);

// DELETE /api/inspired-products/bulk - Delete multiple inspired products
inspiredProductsRouter.delete('/bulk', inspiredProductBulkDelete);

export { inspiredProductsRouter };
