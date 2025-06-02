import { AppException } from '@api/common/exceptions/app.exception';
import { SupabaseClient } from '@supabase/supabase-js';

import { getUserIdentitfier, supabaseClient } from '@api/common/supabase-client';
import { Order, OrderCheckoutDirect } from '@app/core/models/order.model';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { NotAuthorizedException } from '@api/common/exceptions/not-authed.exception';
import { toSnakeCase } from '@app/core/utils/case-converter';

export async function checkoutDirectOrder(input: OrderCheckoutDirect, supabase: SupabaseClient = supabaseClient): Promise<Order> {
  const { productId, quantity = 1, size = null, color = null, addressId, userNote } = input;
  let { userId } = input;

  if (!productId || !addressId) {
    throw new BadRequestException('Product ID and Address ID are required for direct checkout');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new NotAuthorizedException(`${authError.message}`);
  }
  if (!user) {
    throw new NotAuthorizedException('User not authenticated');
  }
  userId ??= user.id;
  const userIdentifer = getUserIdentitfier(user);

  const now = new Date().toISOString();

  // Step 1: Fetch product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, price, old_price')
    .eq('id', productId)
    .eq('is_deleted', false)
    .single();

  if (productError || !product) {
    throw new BadRequestException('Product not found');
  }

  const price = product.price ?? 0;
  const oldPrice = product.old_price ?? price;
  const subtotal = price * quantity;
  const discount = (oldPrice - price) * quantity;

  // Step 2: Get delivery fee
  const { data: address } = await supabase
    .from('addresses')
    .select('state')
    .eq('id', addressId)
    .eq('user_id', userId)
    .single();

  if (!address) {
    throw new BadRequestException('Address not found');
  }

  const { data: state } = await supabase
    .from('states')
    .select('delivery_fee')
    .eq('id', address.state)
    .single();

  const deliveryFee = state?.delivery_fee ?? 0;
  const totalPrice = subtotal + deliveryFee;
  const orderCode = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Step 3: Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      address_id: addressId,
      status: 'pending',
      note: 'Direct checkout',
      user_note: userNote,
      total_price: totalPrice,
      order_code: orderCode,
      created_at: now,
      updated_at: now,
      created_by: userIdentifer,
      updated_by: userIdentifer,
    })
    .select()
    .single();

  if (orderError) {
    throw new AppException(orderError.message);
  }

  // Step 4: Create order item
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      product_id: productId,
      quantity,
      price,
      size,
      color,
      created_at: now,
      updated_at: now,
      created_by: userIdentifer,
      updated_by: userIdentifer,
    });

  if (itemError) {
    throw new AppException(itemError.message);
  }

  // Step 5: Insert status history
  await supabase.from('order_status_history').insert({
    order_id: order.id,
    status: order.status,
    changed_by: user.email,
    note: order.note,
  });

  return toSnakeCase(order) as Order;
}
