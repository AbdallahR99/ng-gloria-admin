import { AppRequest } from '@api/common/types';
import { createOrder } from './functions/index';
import { bulkCreateOrders } from './functions/index';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function orderPostCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const order = await createOrder(body, supabase);
    res.status(201).json(order);
  } catch (error) {
    handleControllerError(res, error, 'Failed to create order');
  }
}

export async function orderPostBulkCreate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const orders = await bulkCreateOrders(body, supabase);
    res.status(201).json(orders);
  } catch (error) {
    handleControllerError(res, error, 'Failed to create orders in bulk');
  }
}
