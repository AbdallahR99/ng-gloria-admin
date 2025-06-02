import { Router } from 'express';
import { orderPostCreate, orderPostBulkCreate } from './orders-create';
import { orderPutUpdate, orderPutBulkUpdate } from './orders-update';
import { orderDelete, orderBulkDelete } from './orders-delete';
import { orderGetById, orderGetList, orderGetFilter } from './orders-get';
import { orderPutStatus } from './orders-status';

const ordersRouter = Router();

ordersRouter.get('/', orderGetList);
ordersRouter.get('/byId/:id', orderGetById);
ordersRouter.post('/filter', orderGetFilter);
ordersRouter.post('/', orderPostCreate);
ordersRouter.post('/bulk', orderPostBulkCreate);
ordersRouter.put('/:id', orderPutUpdate);
ordersRouter.put('/bulk', orderPutBulkUpdate);
ordersRouter.put('/:id/status', orderPutStatus);
ordersRouter.delete('/:id', orderDelete);
ordersRouter.delete('/bulk', orderBulkDelete);

export { ordersRouter };
