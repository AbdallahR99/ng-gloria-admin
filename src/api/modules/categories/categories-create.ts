import { AppRequest } from '@api/common/types';
import { createCategory } from './functions/create-category';
import { bulkCreateCategories } from './functions/bulk-create-categories';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function categoryPostCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const category = await createCategory(body, supabase);
    res.status(201).json(category);
  } catch (error) {
    handleControllerError(res, error, 'Failed to create category');
  }
}

export async function categoryPostBulkCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const categories = await bulkCreateCategories(body, supabase);
    res.status(201).json(categories);
  } catch (error) {
    handleControllerError(res, error, 'Failed to create categories in bulk');
  }
}
