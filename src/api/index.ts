import { Router } from 'express';
import { productsRouter } from './modules/products/products.routes';
import { createSupabaseAuthClient } from './common/supabase-client';
import { ordersRouter } from './modules/orders/orders.routes';
import { inspiredProductsRouter } from './modules/inspired-products/inspired-products.routes';

const apiRouter = Router();
apiRouter.use(createSupabaseAuthClient);

// Register all module routes
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/inspired-products', inspiredProductsRouter);
// apiRouter.use('/users', usersRouter);
// apiRouter.use('/cart', cartRouter);
// apiRouter.use('/bundles', bundlesRouter);
// apiRouter.use('/invoices', invoicesRouter);
// apiRouter.use('/addresses', addressesRouter);
// apiRouter.use('/categories', categoriesRouter);
// apiRouter.use('/auth', authRouter);
// apiRouter.use('/favorites', favoritesRouter);
// apiRouter.use('/reviews', reviewsRouter);
// apiRouter.use('/vouchers', vouchersRouter);
// apiRouter.use('/states', statesRouter);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export { apiRouter };
