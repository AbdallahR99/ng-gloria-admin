import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { getUserIdentitfier, supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { OrderStatus } from '@app/core/constants/order-status.enum';
import { Order, OrderCreateOrUpdate, OrderItem } from '@app/core/models/order.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';

export async function createOrder(
  input: OrderCreateOrUpdate,
  supabase: SupabaseClient = supabaseClient
): Promise<Order> {
  const { items, addressId, userNote } = input;
  let { userId, status, note } = input;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!userId) {

    // if (error || !user) {
    //   throw new BadRequestException('User ID is required to create an order');
    // }
    if (user)
    userId = user.id;
  }

  if (!items || items.length === 0) {
    throw new BadRequestException('Order items are required');
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

  const { data: products } = await supabase.from(SupabaseTableNames.PRODUCTS).select('id, price').in('id', items.map(item => item.productId));
  if (!products || products.length === 0) {
    throw new BadRequestException('No valid products found for the order items');
  }
  const totalPrice = products.reduce((total, product) => {
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
  const createPayload = {
    user_id: userId,
    address_id: addressId,
    order_code: `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    order_items: orderItemsMapped,
    status: status ?? OrderStatus.Pending,
    note: note ?? 'Initial order creation',
    user_note: userNote,
    total_price: +totalPrice,
    created_by: userIdentifier,
    updated_by: userIdentifier,
  };

  const { data: order, error: orderError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .insert(createPayload)
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  if (!order) {
    throw new BadRequestException('Failed to create order');
  }

  // log history
  await supabase.from(SupabaseTableNames.ORDER_STATUS_HISTORY).insert({
    order_id: order.id,
    status: order.status,
    note: order.note,
    created_by: userIdentifier,
  });



  return toCamelCase(order) as Order;
}


/*
create table public.order_items (
  id uuid not null default gen_random_uuid (),
  order_id uuid null,
  product_id uuid null,
  quantity integer null,
  price double precision null,
  color text null,
  size text null,
  is_deleted boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  created_by text null,
  updated_by text null,
  deleted_by text null,
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id),
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id)
) TABLESPACE pg_default;

create table public.order_status_history (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  status public.order_status not null,
  changed_at timestamp with time zone not null default now(),
  changed_by text null,
  note text null,
  created_at timestamp with time zone not null default now(),
  constraint order_status_history_pkey primary key (id),
  constraint order_status_history_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.orders (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  address_id uuid null,
  note text null,
  total_price double precision null,
  is_deleted boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  created_by text null,
  updated_by text null,
  deleted_by text null,
  order_code text null,
  status public.order_status null default 'pending'::order_status,
  user_note text null,
  constraint orders_pkey primary key (id),
  constraint orders_address_id_fkey foreign KEY (address_id) references addresses (id),
  constraint orders_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

create trigger trigger_auto_create_invoice_on_delivery
after INSERT
or
update OF status on orders for EACH row when (
  new.status = 'delivered'::order_status
  and new.is_deleted = false
)
execute FUNCTION auto_create_invoice_on_delivery ();

*/
