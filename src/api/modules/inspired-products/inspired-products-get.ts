import { AppRequest } from '@api/common/types';
import { getInspiredProduct } from './functions/get-inspired-product';
import {
  filterInspiredProducts,
  listInspiredProducts,
} from './functions/list-inspired-products';
import { NextFunction, Response } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { InspiredProduct } from '@app/core/models/inspired-product.model';

export async function inspiredProductGetById(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const {
    supabase,
    params: { id },
  } = req;

  if (!id) {
    res.status(400).json({ error: 'Inspired Product ID is required' });
    return next();
  }
  try {
    const inspiredProduct = await getInspiredProduct({ id }, supabase);
    res.status(200).json(inspiredProduct);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch inspired product');
  }
}

export async function inspiredProductGetList(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  // Parse pagination parameters
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '99');

  // Parse filter parameters
  const queryString = url.searchParams.get('queryString');
  const sortBy = (url.searchParams.get('sortBy') ??
    'created_at') as keyof InspiredProduct;
  const sortOrder = url.searchParams.get('sortOrder');

  try {
    const inspiredProducts = await listInspiredProducts(
      {
        page,
        pageSize,
        queryString: queryString ?? undefined,
        sortBy,
        sortOrder: sortOrder ? 'asc' : 'desc',
      },
      supabase
    );
    res.status(200).json(inspiredProducts);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch inspired products list');
  }
}

export async function inspiredProductPostFilter(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;
  try {
    const inspiredProducts = await filterInspiredProducts(body, supabase);
    res.status(200).json(inspiredProducts);
  } catch (error) {
    handleControllerError(res, error, 'Failed to filter inspired products');
  }
}

export async function inspiredProductGetFilter(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  // Parse pagination parameters
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '99');

  // Parse filter parameters
  const queryString = url.searchParams.get('queryString');
  const sortBy = (url.searchParams.get('sortBy') ??
    'created_at') as keyof InspiredProduct;
  const sortOrder = url.searchParams.get('sortOrder');

  try {
    const inspiredProducts = await filterInspiredProducts(
      {
        page,
        pageSize,
        queryString: queryString ?? undefined,
        sortBy,
        sortOrder: sortOrder ? 'asc' : 'desc',
      },
      supabase
    );
    res.status(200).json(inspiredProducts);
  } catch (error) {
    handleControllerError(res, error, 'Failed to filter inspired products');
  }
}
