import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { SupabaseClient } from '@supabase/supabase-js';

export async function updateOrderStatus(
  { orderId, orderCode }: { orderId?: string; orderCode?: string },
  { status, note }: { status: string; note?: string },
  userEmail: string,
  supabase: SupabaseClient = supabaseClient,
): Promise<{ status: string }> {
  if (!status || (!orderId && !orderCode)) {
    throw new Error("Missing 'status' and either 'orderId' or 'orderCode'");
  }

  const now = new Date().toISOString();

  // Step 1: Fetch the order
  const { data: order, error: fetchError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .select('id, status')
    .eq(orderId ? 'id' : 'order_code', orderId ?? orderCode)
    .maybeSingle();

  if (fetchError || !order) {
    throw fetchError ?? new Error('Order not found');
  }

  // Step 2: Update the order status
  const { error: updateError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .update({
      status,
      note,
      updated_at: now,
      updated_by: userEmail,
    })
    .eq('id', order.id);

  if (updateError) {
    throw new Error(`Failed to update order status: ${updateError.message}`);
  }

  // Step 3: Insert history record
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status,
      changed_at: now,
      changed_by: userEmail,
      note,
    });

  if (historyError) {
    throw new Error(`Failed to insert order history: ${historyError.message}`);
  }

  return { status: 'updated' };
}
