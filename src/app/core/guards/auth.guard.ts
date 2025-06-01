import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/repository/auth.service';
import { APP_ROUTES } from '../constants/app-routes.enum';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  // Check if the user is logged in
  if (!authService.isLoggedIn()) {
    return new RedirectCommand(
      router.parseUrl(APP_ROUTES.SignIn + '?redirectUrl=' + route.url)
    );
  }
  return true;
};

export const NotAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  // Check if the user is not logged in
  if (authService.isLoggedIn()) {
    return new RedirectCommand(router.parseUrl(APP_ROUTES.HOME));
  }
  return true;
};
