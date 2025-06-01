import { inject, Injectable, signal } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { LoginRequest, LoginResponse } from '@app/core/models/login.model';
import {
  RegisterRequest,
  RegisterResponse,
} from '@app/core/models/register.model';
import { Observable, switchMap, tap } from 'rxjs';
import { LocalStorageKeys } from '@app/core/constants/local_storage';
import { PlatformService } from '../platform/platform.service';
import { UsersService } from './users.service';
import { FacadeService } from '../facade-service.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformService = inject(PlatformService);
  private readonly fn = inject(SupabaseFunctionsService);
  isLoggedIn = signal<boolean>(this.checkLoginStatus());
  private readonly endpoint = 'auth';
  facadeService = inject(FacadeService);

  login(body: LoginRequest) {
    return this.fn
      .callFunction<LoginResponse>(`${this.endpoint}/login`, {
        method: 'POST',
        body,
      })
      .pipe(
        tap((response) => {
          if (response.token) {
            // Store the access token in local storage or a service
            localStorage.setItem(LocalStorageKeys.TOKEN, response.token);
            this.isLoggedIn.set(true);
            this.facadeService.usersService.setUser();
            this.facadeService.cartService.updateCartCount();
          }
        })
      );
  }

  checkLoginStatus(): boolean {
    if (this.platformService.isServer) return false;
    const token = localStorage.getItem(LocalStorageKeys.TOKEN);
    return !!token;
  }

  init() {
    if (this.platformService.isServer) return;
    const token = localStorage.getItem(LocalStorageKeys.TOKEN);
    if (token) {
      if (this.fn.isTokenExpired(token)) {
        this.logout(); // Call logout if the token is expired
      } else {
        this.isLoggedIn.set(true);
        this.facadeService.usersService.setUser();
        this.facadeService.cartService.updateCartCount();
      }
    } else {
      this.isLoggedIn.set(false);
    }
  }

  registerThenLogin(body: RegisterRequest): Observable<LoginResponse> {
    return this.fn
      .callFunction<RegisterResponse>(`${this.endpoint}/register`, {
        method: 'POST',
        body,
      })
      .pipe(
        switchMap((response) => {
          if (response.message) {
            // If registration is successful, log in the user
            return this.login({
              identifier: body.email,
              password: body.password,
            });
          } else {
            throw new Error('Registration failed');
          }
        })
      );
  }

  register(body: RegisterRequest) {
    return this.fn.callFunction<RegisterResponse>(`${this.endpoint}/register`, {
      method: 'POST',
      body,
    });
  }

  logout() {
    localStorage.removeItem(LocalStorageKeys.TOKEN);
    this.isLoggedIn.set(false);
    this.facadeService.usersService.clearCachedUser();
  }
}
