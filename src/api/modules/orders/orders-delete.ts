import { AppRequest } from '@api/common/types';
import { deleteOrder } from './functions/delete-order';
import { bulkDeleteOrders } from './functions/bulk-delete-orders';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';

export async function orderDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id } = req.params;

  try {
    await deleteOrder(id, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete order');
  }
}

export async function orderBulkDelete(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    await bulkDeleteOrders(body, supabase);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete orders in bulk');
  }
}
