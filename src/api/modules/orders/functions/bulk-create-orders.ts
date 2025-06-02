import { AppException } from '@api/common/exceptions/app.exception';
import { SupabaseClient } from '@supabase/supabase-js';

import { getUserIdentitfier, supabaseClient } from '@api/common/supabase-client';
import { Order, OrderCreateOrUpdate } from '@app/core/models/order.model';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { NotAuthorizedException } from '@api/common/exceptions/not-authed.exception';
import { toCamelCase } from '@api/common/utils/case-converter';

export async function bulkCreateOrders(
  input: OrderCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient,
) {
  if (!input || input.length === 0) {
    throw new BadRequestException('Input orders are required for bulk creation');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new NotAuthorizedException(`${authError.message}`);
  }
  if (!user) {
    throw new NotAuthorizedException('User not authenticated');
  }

  const userIdentifer = getUserIdentitfier(user);
  const now = new Date().toISOString();

  const ordersPayload = await Promise.all(
    input.map(async (order) => {
      if (!order.addressId || !order.items || order.items.length === 0) {
        throw new BadRequestException('Each order must have an address ID and items');
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, price')
        .in('id', order.items.map((item) => item.productId));

      if (!products || products.length === 0) {
        throw new BadRequestException('No valid products found for the order items');
      }

      const userIdentifier = getUserIdentitfier(user);

      const orderItemsMapped = order.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new BadRequestException(`Product with ID ${item.productId} not found`);
        }
        return {
          product_id: item.productId,
          quantity: item.quantity ?? 1,
          price: product.price,
          color: item.color,
          size: item.size,
          created_by: userIdentifier,
          updated_by: userIdentifier,
        };
      });

      const totalPrice = orderItemsMapped.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return {
        user_id: order.userId ?? user.id,
        address_id: order.addressId,
        status: order.status ?? 'pending',
        note: order.note ?? 'Bulk order creation',
        user_note: order.userNote,
        total_price: +totalPrice,
        order_items: orderItemsMapped,
        order_code: `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        created_at: now,
        updated_at: now,
        created_by: userIdentifier,
        updated_by: userIdentifier,
      };
    }),
  );

  const { data, error } = await supabase
    .from('orders')
    .insert(ordersPayload)
    .select('*');

  if (error) {
    throw new AppException(error.message);
  }

  if (!data || data.length === 0) {
    throw new AppException('No orders were created');
  }

  return data.map(toCamelCase) as Order[];
}
