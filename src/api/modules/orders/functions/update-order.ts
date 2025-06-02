import { getUserIdentitfier, supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { SupabaseClient } from '@supabase/supabase-js';
import { OrderCreateOrUpdate } from '@app/core/models/order.model';
import { toCamelCase } from '@app/core/utils/case-converter';

export async function updateOrder(

  input: OrderCreateOrUpdate,
  supabase: SupabaseClient = supabaseClient,
) {
  const { id: orderId, items, status, note, userNote, addressId } = input;
  let { userId } = input;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!userId) {
    if (error || !user) {
      throw new BadRequestException('User ID is required to create an order');
    }
    userId = user.id;
  }


  if (!orderId) {
    throw new BadRequestException('Order ID is required to update an order');
  }

  if (!items || items.length === 0) {
    throw new BadRequestException('At least one order item is required');
  }

  if (addressId) {
    // validate if address exists
    const { data: address, error: addressError } = await supabase
      .from(SupabaseTableNames.ADDRESSES)
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single();
    if (addressError || !address) {
      throw new BadRequestException('Invalid address ID provided');
    }
  }

  const now = new Date().toISOString();

  // Step 1: Fetch the existing order
  const { data: existingOrder, error: fetchError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .select('id, status, note, user_note')
    .eq('id', orderId)
    .single();

  if (fetchError || !existingOrder) {
    throw new BadRequestException('Order not found');
  }

   const {data: products} = await supabase.from(SupabaseTableNames.PRODUCTS).select('id, price').in('id', items.map(item => item.productId));
  if (!products || products.length === 0) {
    throw new BadRequestException('No valid products found for the order items');
  }
  const totalPrice  = products.reduce((total, product) => {
    const item = items.find(item => item.productId === product.id);
    if (item) {
      return total + (+(product.price) * +(item.quantity ?? 1));
    }
    return total;
  }, 0);

  const userIdentifier = getUserIdentitfier(user);
  const orderItemsMapped = items.map((item) => {
    const product = products.find(p => p.id === item.productId);
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

  // Step 2: Prepare the update payload
  const updatePayload = {
    order_items: orderItemsMapped,
    address_id: addressId,
    status: status ?? existingOrder.status,
    note: note ?? existingOrder.note,
    user_note: userNote ?? existingOrder.user_note,
    total_price: +totalPrice,
    updated_at: now,
    updated_by: userIdentifier,
  };

  // Step 3: Update the order
  const { data: updatedOrder, error: updateError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .update(updatePayload)
    .eq('id', orderId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  // Step 4: Insert status history if status is updated
  if (status != existingOrder.status || note != existingOrder.note) {
    await supabase
      .from(SupabaseTableNames.ORDER_STATUS_HISTORY)
      .insert({
        order_id: orderId,
        status: updatedOrder.status,
        note: updatedOrder.note,
        changed_at: now,
        changed_by: userIdentifier,
      });


  }

  return toCamelCase(updatedOrder) as OrderCreateOrUpdate;
}
