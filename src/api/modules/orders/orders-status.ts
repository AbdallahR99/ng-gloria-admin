import { AppRequest } from '@api/common/types';
import { updateOrderStatus } from './functions/update-order-status';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { getOrderByCodeOrId } from './functions/get-order-by-code-or-id';

export async function orderPutStatus(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id, order_code } = req.params;
  const { status, note } = req.body;

  try {
    const order = await getOrderByCodeOrId({ id, order_code }, supabase);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await updateOrderStatus(order.id, { status, note }, supabase);
    res.status(200).json(updatedOrder);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update order status');
  }
}
