import { AppRequest } from '@api/common/types';
import { getCategory } from './functions/get-category';
import { filterCategories, listCategories } from './functions/list-categories';
import { NextFunction, Response } from 'express';
import { handleControllerError } from '@api/common/utils/error-handler';
import { Category } from '@app/core/models/category.model';

export async function categoryGetById(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const {
    supabase,
    params: { id },
  } = req;

  if (!id) {
    res.status(400).json({ error: 'Category ID is required' });
    return next();
  }
  try {
    const category = await getCategory({ id }, supabase);
    res.status(200).json(category);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch category');
  }
}

export async function categoryGetBySlug(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const {
    supabase,
    params: { slug },
  } = req;
  if (!slug) {
    res.status(400).json({ error: 'Category slug is required' });
    return next();
  }
  try {
    const category = await getCategory({ slug }, supabase);
    res.status(200).json(category);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch category by slug');
  }
}

export async function categoryGetList(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const url = new URL(req.url);
  // Parse pagination parameters
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '99');

  // Parse filter parameters
  const queryString = url.searchParams.get('queryString');
  const sortBy = (url.searchParams.get('sortBy') ??
    'created_at') as keyof Category;
  const sortOrder = url.searchParams.get('sortOrder');

  try {
    const categories = await listCategories(
      {
        page,
        pageSize,
        queryString: queryString ?? undefined,
        sortBy,
        sortOrder: sortOrder ? 'asc' : 'desc',
      },
      supabase
    );
    res.status(200).json(categories);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch categories list');
  }
}

export async function categoryPostFilter(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const body = req.body;
  try {
    const categories = await filterCategories(body, supabase);
    res.status(200).json(categories);
  } catch (error) {
    handleControllerError(res, error, 'Failed to filter categories');
  }
}

export async function categoryGetFilter(
  req: AppRequest,
  res: Response,
  next: NextFunction
) {
  const { supabase } = req;
  const url = new URL(req.url);
  // Parse pagination parameters
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '99');

  // Parse filter parameters
  const queryString = url.searchParams.get('queryString');
  const sortBy = (url.searchParams.get('sortBy') ??
    'created_at') as keyof Category;
  const sortOrder = url.searchParams.get('sortOrder');

  try {
    const categories = await filterCategories(
      {
        page,
        pageSize,
        queryString: queryString ?? undefined,
        sortBy,
        sortOrder: sortOrder ? 'asc' : 'desc',
      },
      supabase
    );
    res.status(200).json(categories);
  } catch (error) {
    handleControllerError(res, error, 'Failed to filter categories');
  }
}
