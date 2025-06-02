import { toSnakeCase } from '@api/common/utils/case-converter';
import { OrderQuery } from '@app/core/models/order.model';

export function queryFilterOrder<T>(query: T | any, input: OrderQuery): T {
  const { userId, status, fromDate, toDate, addressId, page, pageSize, sortBy, sortOrder, queryString, showDeleted } = input;

  if (userId) {
    query.eq('user_id', userId);
  }
  if (status) {
    query.eq('status', status);
  }
  if (fromDate) {
    query.gte('created_at', fromDate);
  }
  if (toDate) {
    query.lte('created_at', toDate);
  }
  if (addressId) {
    query.eq('address_id', addressId);
  }
  if (queryString) {
    query.ilike('order_code', `%${queryString}%`);
  }
  if (!(showDeleted == true)) {
    query.eq('is_deleted', false);
  }
  if (sortBy) {
    query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' });
  }
  if (page && pageSize) {
    query.range((page - 1) * pageSize, page * pageSize - 1);
  }


  return query;
}
