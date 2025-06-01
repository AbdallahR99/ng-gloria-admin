import { AppRequest } from '@api/common/types';
import { Response, NextFunction } from 'express';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { handleControllerError } from '@api/common/utils/error-handler';
import { supabaseClient } from '@api/common/supabase-client';

export async function productGetRelated(
  req: AppRequest,
  res: any,
  next: NextFunction
) {
  const supabase = req.supabase ?? supabaseClient;
  const { slug } = req.params;

  try {
    // Fetch the current product to get its category_id
    const { data: currentProduct, error: productError } = await supabase
      .from(SupabaseTableNames.PRODUCTS)
      .select('id, category_id')
      .or(`slug.eq.${slug},slug_ar.eq.${slug}`)
      .maybeSingle();

    if (productError || !currentProduct) {
      throw productError ?? new Error('Product not found');
    }

    // Fetch related products in the same category, excluding the current product
    const { data: related, error } = await supabase
      .from(SupabaseTableNames.PRODUCTS)
      .select('*, category:categories(name_en, name_ar)')
      .eq('is_deleted', false)
      .eq('category_id', currentProduct.category_id)
      .neq('id', currentProduct.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // If user is authenticated, fetch favorites and cart items
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const ids = related.map((p) => p.id);
      const [favorites, cartItems] = await Promise.all([
        supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id)
          .in('product_id', ids),
        supabase
          .from('cart_items')
          .select('product_id')
          .eq('user_id', user.id)
          .in('product_id', ids),
      ]);

      const favSet = new Set(favorites.data?.map((f) => f.product_id));
      const cartSet = new Set(cartItems.data?.map((c) => c.product_id));

      // Add user-specific flags to related products
      const enrichedRelated = related.map((p) => ({
        ...p,
        in_favorites: favSet.has(p.id),
        in_cart: cartSet.has(p.id),
      }));

      return res.status(200).json(enrichedRelated);
    }

    res.status(200).json(related);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch related products');
  }
}
