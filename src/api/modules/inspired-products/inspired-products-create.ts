import { AppRequest } from '@api/common/types';
import { createInspiredProduct } from './functions/create-inspired-product';
import { bulkCreateInspiredProducts } from './functions/bulk-create-inspired-products';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { SupabaseClient } from '@supabase/supabase-js';

export async function inspiredProductPostCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const inspiredProduct = await createInspiredProduct(body, supabase);
    res.status(201).json(inspiredProduct);
  } catch (error) {
    handleControllerError(res, error, 'Failed to create inspired product');
  }
}

export async function inspiredProductPostBulkCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const inspiredProducts = await bulkCreateInspiredProducts(body, supabase);
    res.status(201).json(inspiredProducts);
  } catch (error) {
    handleControllerError(
      res,
      error,
      'Failed to create inspired products in bulk'
    );
  }
}
