import { AppRequest } from '@api/common/types';
import { createOrder, checkoutOrder, checkoutDirectOrder } from './functions';
import { bulkCreateOrders } from './functions';
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

export async function orderPostCheckout(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    // Assuming there's a checkout function to handle the checkout process
    const result = await checkoutOrder(body, supabase);
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to process checkout');
  }
}

export async function orderPostCheckoutDirect(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;

  try {
    // Assuming there's a direct checkout function to handle the checkout process
    const result = await checkoutDirectOrder(body, supabase);
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to process direct checkout');
  }
}
