import { AppRequest } from '@api/common/types';
import { createProduct } from './functions/create-product';
import { bulkCreateProducts } from './functions/bulk-create-products';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { SupabaseClient } from '@supabase/supabase-js';

export async function productPostCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const product = await createProduct(body, supabase);
    res.status(201).json(product);
  } catch (error) {
    handleControllerError(res, error, 'Failed to create product');
  }
}

export async function productPostBulkCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const products = await bulkCreateProducts(body, supabase);
    res.status(201).json(products);
  } catch (error) {
    handleControllerError(res, error, 'Failed to create products in bulk');
  }
}
