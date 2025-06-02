import { AppRequest } from '@api/common/types';
import { updateOrderStatus } from './functions';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { getOrderByCodeOrId } from './functions/get-order-by-code-or-id';

export async function orderPutStatus(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const { id, orderCode } = req.params;
  const { status, note } = req.body;

  try {

    const updatedOrder = await updateOrderStatus({
      id,
      orderCode,
      status,
      note
    }, supabase);
    res.status(200).json(updatedOrder);
  } catch (error) {
    handleControllerError(res, error, 'Failed to update order status');
  }
}
