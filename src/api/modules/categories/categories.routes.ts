import { Router } from 'express';
import {
  categoryGetById,
  categoryGetBySlug,
  categoryGetList,
  categoryGetFilter,
  categoryPostFilter,
} from './categories-get';
import {
  categoryPostCreate,
  categoryPostBulkCreate,
} from './categories-create';
import { categoryPutUpdate, categoryPutBulkUpdate } from './categories-update';
import { categoryDelete, categoryBulkDelete } from './categories-delete';

const categoriesRouter = Router();

// GET /api/categories - Get all categories with optional filtering
categoriesRouter.get('/', categoryGetList);

// GET /api/categories/list - Get all categories with optional filtering
categoriesRouter.get('/list', categoryGetList);

// GET /api/categories/byId/:id - Get category by ID
categoriesRouter.get('/byId/:id', categoryGetById);

// GET /api/categories/bySlug/:slug - Get category by slug
categoriesRouter.get('/bySlug/:slug', categoryGetBySlug);

// GET /api/categories/filter - Get all categories with pagination and filtering
categoriesRouter.get('/filter', categoryGetFilter);

// POST /api/categories/filter - Get all categories with pagination and filtering in body
categoriesRouter.post('/filter', categoryPostFilter);

// POST /api/categories - Create a new category
categoriesRouter.post('/', categoryPostCreate);

// POST /api/categories/bulk - Create multiple categories
categoriesRouter.post('/bulk', categoryPostBulkCreate);

// PUT /api/categories/:id - Update a category by ID
categoriesRouter.put('/:id', categoryPutUpdate);

// PUT /api/categories/bulk - Update multiple categories
categoriesRouter.put('/bulk', categoryPutBulkUpdate);

// DELETE /api/categories/:id - Delete a category by ID
categoriesRouter.delete('/:id', categoryDelete);

// DELETE /api/categories/bulk - Delete multiple categories
categoriesRouter.delete('/bulk', categoryBulkDelete);

export { categoriesRouter };
