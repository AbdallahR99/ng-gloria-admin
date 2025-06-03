import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { Order } from '@app/core/models/order.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getOrder(
  orderId: string,
  supabase: SupabaseClient = supabaseClient,
) {
  const { data, error } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .select(
      `*,
      address:addresses(label, city, state, stateData:state(id, code, name_ar, name_en, delivery_fee), area, street, building, apartment, first_name, last_name, phone),
      items:order_items(
      product_id,
      quantity,
      size,
      color,
      product:products(name_en, name_ar, price, thumbnail)
    )`
    )
    .eq('id', orderId)
    .single();


  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  try {
    const {
      data: user,
      error: userError,
    } = await supabase
      .from(SupabaseTableNames.USER_PROFILES)
      .select('*')
      .eq('user_id', data.user_id)
      .single();
    if (user) {
      data.user = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
      };
    }
  } catch (error) {
    console.error('Error fetching order:', error);
  }

  if (data.address.stateData) {
    data.state_code = data.address.stateData.code;
    data.state_name_ar = data.address.stateData.name_ar;
    data.state_name_en = data.address.stateData.name_en;
    data.state_delivery_fee = data.address.stateData.delivery_fee;
  }

  return toCamelCase(data) as Order;
}
