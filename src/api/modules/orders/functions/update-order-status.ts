import { AppException } from '@api/common/exceptions/app.exception';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { NotFoundException } from '@api/common/exceptions/not-found.exception';
import { getUserIdentitfier, supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { OrderStatus } from '@app/core/constants/order-status.enum';
import { OrderStatusUpdate } from '@app/core/models/order.model';
import { SupabaseClient } from '@supabase/supabase-js';

export async function updateOrderStatus(
  input: OrderStatusUpdate,
  supabase: SupabaseClient = supabaseClient,
): Promise<{ status: OrderStatus }> {
  const { id, orderCode, status, note, userNote } = input;
  let { userId } = input;
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!userId) {
    if (error || !user) {
      throw new BadRequestException('User ID is required to create an order');
    }
    userId = user.id;
  }

  const userIdentifier = getUserIdentitfier(user);

  if (!status) {
    throw new BadRequestException('Status is required to update the order');

  }
  const query = supabase
    .from(SupabaseTableNames.ORDERS).select('id, status');
  if (!id && !orderCode) {
    throw new Error("Either 'order id' or 'orderCode' must be provided");
  }
  if (orderCode) {
    query.eq('order_code', orderCode);
  }
  if (id) {
    query.eq('id', id);
  }
  // // Step 1: Fetch the order

  const { data: existingOrder, error: fetchError } = await query.maybeSingle();
  if (fetchError) {
    throw new AppException(`Failed to fetch order: ${fetchError.message}`);
  }
  if (!existingOrder) {
    throw new NotFoundException('Order not found');
  }


  const now = new Date().toISOString();

  const orderPayload = {
    status,
    note: note,
    user_note: userNote,
    updated_at: now,
    updated_by: userIdentifier,
  }

  // Step 2: Update the order status
  const { data: updatedOrder, error: updateError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .update(orderPayload)
    .eq('id', existingOrder.id).select('id, status').single();

  if (updateError) {
    throw new Error(`Failed to update order status: ${updateError.message}`);
  }
  if (!updatedOrder) {
    throw new NotFoundException('Order not found after update');
  }

  await supabase
    .from('order_status_history')
    .insert({
      order_id: updatedOrder.id,
      status: updatedOrder.status,
      changed_at: now,
      changed_by: userIdentifier,
      note,
    });



  return { status: updatedOrder.status };
}
