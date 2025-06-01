import { Router } from 'express';
import { productsRouter } from './modules/products/products.routes';
import { usersRouter } from './modules/users/users.routes';
import { createSupabaseAuthClient } from './common/supabase-client';

const apiRouter = Router();
apiRouter.use(createSupabaseAuthClient);

// Register all module routes
apiRouter.use('/products', productsRouter);
apiRouter.use('/users', usersRouter);
// apiRouter.use('/cart', cartRouter);
// apiRouter.use('/orders', ordersRouter);
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
