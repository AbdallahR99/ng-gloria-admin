import { AppRequest } from '@api/common/types';
import { getOrder } from './functions';
import { listOrders } from './functions';
import { Response, NextFunction } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { paginateOrders } from './functions';

export async function orderGetById(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const {
    supabase,
    params: { id },
  } = req;

  if (!id) {
    res.status(400).json({ error: 'Order ID is required' });
    return next();
  }

  try {
    const order = await getOrder(id, supabase);
    res.status(200).json(order);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch order');
  }
}

export async function orderGetList(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

  try {
    const orders = await listOrders({ page, pageSize }, supabase);
    res.status(200).json(orders);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch orders');
  }
}

export async function orderGetFilter(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    const orders = await paginateOrders(body, supabase);
    res.status(200).json(orders);
  } catch (error) {
    handleControllerError(res, error, 'Failed to filter orders');
  }
}
