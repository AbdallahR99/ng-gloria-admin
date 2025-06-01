import { AppRequest } from '@api/common/types';
import { updateProduct } from './functions/update-product';
import { bulkUpdateProducts } from './functions/bulk-update-products';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function productPutUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;
  const body = req.body;

  try {
    const product = await updateProduct(id, body, supabase);
    res.status(200).json(product);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update product');
  }
}

export async function productPutBulkUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const products = await bulkUpdateProducts(body, supabase);
    res.status(200).json(products);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update products in bulk');
  }
}
