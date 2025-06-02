import { AppRequest } from '@api/common/types';
import { deleteInspiredProduct } from './functions/delete-inspired-product';
import { bulkDeleteInspiredProducts } from './functions/bulk-delete-inspired-products';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function inspiredProductDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;

  try {
    await deleteInspiredProduct(id, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete inspired product');
  }
}

export async function inspiredProductBulkDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    await bulkDeleteInspiredProducts(body, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(
      res,
      error,
      'Failed to delete inspired products in bulk'
    );
  }
}
