import { inject, Injectable, signal } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { User } from '@app/core/models/user.model';
import { firstValueFrom, tap } from 'rxjs';
import { LocalStorageKeys } from '@app/core/constants/local_storage';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'users';
  private readonly jwtHelper = new JwtHelperService();

  user = signal<User | null>(null);

  async setUser() {
    const cachedUser = localStorage.getItem(LocalStorageKeys.USER);
    if (cachedUser) {
      this.user.set(JSON.parse(cachedUser));
    } else {
      const token = localStorage.getItem(LocalStorageKeys.TOKEN);
      if (token) {
        const decodedToken = this.jwtHelper.decodeToken(token);
        const userMetadata = decodedToken?.user_metadata;
        if (userMetadata) {
          const user: User = {
            id: decodedToken.sub,
            firstName: userMetadata.first_name,
            lastName: userMetadata.last_name,
            email: userMetadata.email,
            phone: decodedToken.phone,
            avatar: userMetadata.avatar,
          };
          this.user.set(user);
          localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
          return;
        }
      }
      const user = await firstValueFrom(this.getCurrent());
      this.user.set(user);
      localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
    }
  }

  async refreshUser() {
    const user = await firstValueFrom(this.getCurrent());
    this.user.set(user);
    localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
  }

  clearCachedUser() {
    localStorage.removeItem(LocalStorageKeys.USER);
    this.user.set(null);
  }

  get() {
    return this.fn.callFunction<User[]>(`${this.endpoint}`, {
      method: 'GET',
    });
  }
  getById(userId: string) {
    return this.fn.callFunction<User>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: { userId },
    });
  }
  getCurrent() {
    return this.fn.callFunction<User>(`${this.endpoint}/current`, {
      method: 'GET',
    });
  }

  update(user: Partial<User> & { userId?: string }) {
    return this.fn
      .callFunction(`${this.endpoint}`, {
        method: 'PUT',
        body: user,
      })
      .pipe(tap(() => this.refreshUser()));
  }

  updateAvatar(avatarBase64: string) {
    return this.fn
      .callFunction(`${this.endpoint}/avatar`, {
        method: 'PUT',
        body: { avatarBase64 },
      })
      .pipe(tap(() => this.refreshUser()));
  }

  bulkUpdate(users: Partial<User>[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'PUT',
      body: users,
    });
  }
}
