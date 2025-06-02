import { AppRequest } from '@api/common/types';
import { deleteCategory } from './functions/delete-category';
import { bulkDeleteCategories } from './functions/bulk-delete-categories';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function categoryDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;

  try {
    await deleteCategory(id, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete category');
  }
}

export async function categoryBulkDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    await bulkDeleteCategories(body, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete categories in bulk');
  }
}
