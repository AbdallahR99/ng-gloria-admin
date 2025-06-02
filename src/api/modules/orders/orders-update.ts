import { AppRequest } from '@api/common/types';
import { updateOrder } from './functions/update-order';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function orderPutUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;
  const body = req.body;

  try {
    const order = await updateOrder(id, body, supabase);
    res.status(200).json(order);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update order');
  }
}

export async function orderPutBulkUpdate(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const orders = await bulkUpdateOrders(body, supabase);
    res.status(200).json(orders);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update orders in bulk');
  }
}
