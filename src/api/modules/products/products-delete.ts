import { AppRequest } from '@api/common/types';
import { deleteProduct } from './functions/delete-product';
import { bulkDeleteProducts } from './functions/bulk-delete-products';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function productDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;

  try {
    await deleteProduct(id, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete product');
  }
}

export async function productBulkDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    await bulkDeleteProducts(body, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete products in bulk');
  }
}
