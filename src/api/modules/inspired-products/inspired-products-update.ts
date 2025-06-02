import { AppRequest } from '@api/common/types';
import { updateInspiredProduct } from './functions/update-inspired-product';
import { bulkUpdateInspiredProducts } from './functions/bulk-update-inspired-products';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function inspiredProductPutUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;
  const body = req.body;

  try {
    const inspiredProduct = await updateInspiredProduct(id, body, supabase);
    res.status(200).json(inspiredProduct);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update inspired product');
  }
}

export async function inspiredProductPutBulkUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const inspiredProducts = await bulkUpdateInspiredProducts(body, supabase);
    res.status(200).json(inspiredProducts);
  } catch (error) {
    handleControllerError(
      res,
      error,
      'Failed to update inspired products in bulk'
    );
  }
}
