import { AppRequest } from '@api/common/types';
import { updateCategory } from './functions/update-category';
import { bulkUpdateCategories } from './functions/bulk-update-categories';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function categoryPutUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;
  const body = req.body;

  try {
    const category = await updateCategory(id, body, supabase);
    res.status(200).json(category);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update category');
  }
}

export async function categoryPutBulkUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const categories = await bulkUpdateCategories(body, supabase);
    res.status(200).json(categories);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update categories in bulk');
  }
}
