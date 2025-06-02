import { AppException } from '@api/common/exceptions/app.exception';
import { SupabaseClient } from '@supabase/supabase-js';

import {
  getUserIdentitfier,
  supabaseClient,
} from '@api/common/supabase-client';
import { Order, OrderCreateOrUpdate } from '@app/core/models/order.model';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { NotAuthorizedException } from '@api/common/exceptions/not-authed.exception';
import { toCamelCase } from '@api/common/utils/case-converter';
import { SupabaseTableNames } from '@api/common/supabase-table-names';

export async function bulkUpdateOrders(
  input: OrderCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient
) {
  if (!input || input.length === 0) {
    throw new BadRequestException('Input orders are required for bulk update');
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    throw new NotAuthorizedException(`${authError.message}`);
  }
  if (!user) {
    throw new NotAuthorizedException('User not authenticated');
  }

  const userIdentifier = getUserIdentitfier(user);
  const now = new Date().toISOString();

  // Validate all orders have IDs
  const orderIds = input.map((order) => {
    if (!order.id) {
      throw new BadRequestException(
        'All orders must have an ID for bulk update'
      );
    }
    return order.id;
  });

  // Fetch existing orders
  const { data: existingOrders, error: fetchError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .select('id, status, note, user_note, user_id')
    .in('id', orderIds);

  if (fetchError) {
    throw new AppException(
      `Failed to fetch existing orders: ${fetchError.message}`
    );
  }

  if (!existingOrders || existingOrders.length !== input.length) {
    throw new BadRequestException('Some orders not found or inaccessible');
  }

  const statusHistoryEntries: any[] = [];
  const ordersPayload = await Promise.all(
    input.map(async (order) => {
      const existingOrder = existingOrders.find((eo) => eo.id === order.id);
      if (!existingOrder) {
        throw new BadRequestException(`Order with ID ${order.id} not found`);
      }

      let { userId } = order;
      if (!userId) {
        userId = existingOrder.user_id;
      }

      if (!order.items || order.items.length === 0) {
        throw new BadRequestException(`Order ${order.id} must have items`);
      }

      // Validate address if provided
      if (order.addressId) {
        const { data: address, error: addressError } = await supabase
          .from(SupabaseTableNames.ADDRESSES)
          .select('id')
          .eq('id', order.addressId)
          .eq('user_id', userId)
          .single();
        if (addressError || !address) {
          throw new BadRequestException(
            `Invalid address ID provided for order ${order.id}`
          );
        }
      }

      // Fetch products for price calculation
      const { data: products } = await supabase
        .from(SupabaseTableNames.PRODUCTS)
        .select('id, price')
        .in(
          'id',
          order.items.map((item) => item.productId)
        );

      if (!products || products.length === 0) {
        throw new BadRequestException(
          `No valid products found for order ${order.id} items`
        );
      }

      const totalPrice = products.reduce((total, product) => {
        const item = order.items?.find((item) => item.productId === product.id);
        if (item) {
          return total + +product.price * +(item.quantity ?? 1);
        }
        return total;
      }, 0);

      const orderItemsMapped = order.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.productId} not found for order ${order.id}`
          );
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

      const updatePayload = {
        id: order.id,
        order_items: orderItemsMapped,
        address_id: order.addressId,
        status: order.status ?? existingOrder.status,
        note: order.note ?? existingOrder.note,
        user_note: order.userNote ?? existingOrder.user_note,
        total_price: +totalPrice,
        updated_at: now,
        updated_by: userIdentifier,
      };

      // Check if status or note changed for history
      if (
        (order.status && order.status !== existingOrder.status) ||
        (order.note && order.note !== existingOrder.note)
      ) {
        statusHistoryEntries.push({
          order_id: order.id,
          status: updatePayload.status,
          note: updatePayload.note,
          changed_at: now,
          changed_by: userIdentifier,
        });
      }

      return updatePayload;
    })
  );

  // Perform bulk update
  const { data: updatedOrders, error: updateError } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .upsert(ordersPayload)
    .select('*');

  if (updateError) {
    throw new AppException(`Failed to update orders: ${updateError.message}`);
  }

  if (!updatedOrders || updatedOrders.length === 0) {
    throw new AppException('No orders were updated');
  }

  // Insert status history entries if any
  if (statusHistoryEntries.length > 0) {
    const { error: historyError } = await supabase
      .from(SupabaseTableNames.ORDER_STATUS_HISTORY)
      .insert(statusHistoryEntries);

    if (historyError) {
      console.error('Failed to insert status history:', historyError.message);
      // Don't throw here as the main update succeeded
    }
  }

  return updatedOrders.map(toCamelCase) as Order[];
}
