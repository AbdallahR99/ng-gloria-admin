import { AppRequest } from '@api/common/types';
import { getProduct } from './functions/get-product';
import { NextFunction, Response } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { listProducts } from './functions/list-products';
import { queryFilterProducts } from './functions/query-filter-products';
import { paginateProducts } from './functions/paginate-products';
import { Product } from '@app/core/models/product.model';

export async function productGetById(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const {
    supabase,
    params: { id },
  } = req;

  if (!id) {
    res.status(400).json({ error: 'Product ID is required' });
    return next();
  }
  try {
    const product = await getProduct({ id }, supabase);
    res.status(200).json(product);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch product');
  }
}

export async function productGetBySlug(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const {
    supabase,
    params: { slug },
  } = req;
  if (!slug) {
    res.status(400).json({ error: 'Product slug is required' });
    return next();
  }
  try {
    const product = await getProduct({ slug }, supabase);
    res.status(200).json(product);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch product by slug');
  }
}

export async function productGetList(
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
  const size = url.searchParams.get('size');
  const color = url.searchParams.get('color');
  const queryString = url.searchParams.get('queryString');
  const categoryId = url.searchParams.get('categoryId');
  const categorySlug = url.searchParams.get('categorySlug');
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const sortBy = (url.searchParams.get('sortBy') ??
    'created_at') as keyof Product;
  const sortOrder = url.searchParams.get('sortOrder');

  try {
    const products = await listProducts(
      {
        page,
        pageSize,
        size: size ? size : undefined,
        color: color ? color : undefined,
        queryString: queryString ?? undefined,
        categoryId: categoryId ? categoryId : undefined,
        categorySlug: categorySlug ? categorySlug : undefined,
        minPrice: minPrice ? +minPrice : undefined,
        maxPrice: maxPrice ? +maxPrice : undefined,
        sortBy,
        sortOrder: sortOrder ? 'asc' : 'desc',
      },
      supabase
    );
    res.status(200).json(products);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch product list');
  }
}

export async function productPostList(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;
  try {
    const products = await listProducts(body, supabase);
    res.status(200).json(products);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch product list');
  }
}

export async function productPostFilter(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;
  try {
    const products = await paginateProducts(body, supabase);
    res.status(200).json(products);
  } catch (error) {
    handleControllerError(res, error, 'Failed to filter products');
  }
}

export async function productGetFilter(
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
  const size = url.searchParams.get('size');
  const color = url.searchParams.get('color');
  const queryString = url.searchParams.get('queryString');
  const categoryId = url.searchParams.get('categoryId');
  const categorySlug = url.searchParams.get('categorySlug');
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const sortBy = (url.searchParams.get('sortBy') ??
    'created_at') as keyof Product;
  const sortOrder = url.searchParams.get('sortOrder');

  try {
    const products = await paginateProducts(
      {
        page,
        pageSize,
        size: size ? size : undefined,
        color: color ? color : undefined,
        queryString: queryString ?? undefined,
        categoryId: categoryId ? categoryId : undefined,
        categorySlug: categorySlug ? categorySlug : undefined,
        minPrice: minPrice ? +minPrice : undefined,
        maxPrice: maxPrice ? +maxPrice : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder ? 'asc' : 'desc',
      },
      supabase
    );
    res.status(200).json(products);
  } catch (error) {
    handleControllerError(res, error, 'Failed to filter products');
  }
}
