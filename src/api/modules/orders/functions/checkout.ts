import { AppException } from '@api/common/exceptions/app.exception';
import { SupabaseClient } from '@supabase/supabase-js';

import { getUserIdentitfier, supabaseClient } from '@api/common/supabase-client';
import { Order, OrderCheckout } from '@app/core/models/order.model';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { NotAuthorizedException } from '@api/common/exceptions/not-authed.exception';
import { toSnakeCase } from '@app/core/utils/case-converter';

export async function checkoutOrder(input: OrderCheckout, supabase: SupabaseClient = supabaseClient): Promise<Order> {

  const { addressId, userNote } = input;
  let { userId } = input;
  if (!addressId) {
    throw new BadRequestException('Address ID is required for checkout');
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

  // Step 1: Fetch cart items
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('product_id, quantity, size, color')
    .eq('user_id', userId)
    .eq('is_deleted', false);

  if (cartError) {
    throw new AppException(cartError.message);
  }

  if (!cartItems || cartItems.length === 0) {
    throw new BadRequestException('Cart is empty');
  }
  // Step 2: Fetch product prices
  const productIds = cartItems.map((item) => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price, old_price')
    .in('id', productIds);
  if (productsError) {
    throw new AppException(productsError.message);
  }
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Step 3: Calculate totals
  let subtotal = 0;
  let discount = 0;
  const now = new Date().toISOString();

  cartItems.forEach((item) => {
    const product = productMap.get(item.product_id);
    const price = product?.price ?? 0;
    const oldPrice = product?.old_price ?? price;
    subtotal += price * item.quantity;
    discount += (oldPrice - price) * item.quantity;
  });

  // Step 4: Get delivery fee
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

  // Step 5: Insert order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    created_at: now,
    updated_at: now,
    created_by: userIdentifer,
    updated_by: userIdentifer,
  })) as object[];

  const createPayload = {
    user_id: userId,
    address_id: addressId,
    status: 'pending',
    note: 'Initial order creation',
    order_items: orderItems,
    user_note: userNote,
    total_price: totalPrice,
    order_code: orderCode,
    created_at: now,
    updated_at: now,
    created_by: userIdentifer,
    updated_by: userIdentifer,
  }

  // Step 6: Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(createPayload)
    .select()
    .single();


  if (orderError) {
    throw new AppException(orderError.message);
  }
  if (!order) {
    throw new AppException('Failed to create order');
  }

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    status: order.status,
    changed_by: user.email,
    note: order.note,
  });

  return toSnakeCase(order) as Order;
}


