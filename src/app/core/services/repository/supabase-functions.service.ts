import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LocalStorageKeys } from '@app/core/constants/local_storage';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { PlatformService } from '../platform/platform.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({ providedIn: 'root' })
export class SupabaseFunctionsService {
  private readonly http = inject(HttpClient);
  private readonly platformService = inject(PlatformService);
  private readonly baseUrl = '/api/';
  private readonly jwtHelper = new JwtHelperService();

  callFunction<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: Record<string, any>;
      queryParams?: Record<string, string | number | boolean>;
    } = {}
  ): Observable<T> {
    const { method = 'POST', body, queryParams } = options;
    const authToken = this.getToken();
    const headers = this.buildHeaders(authToken);
    const url = this.buildUrl(path, queryParams);

    let response$: Observable<T>;
    const payload = body;

    switch (method) {
      case 'GET':
        response$ = this.http.get<T>(url, { headers });
        break;
      case 'POST':
        response$ = this.http.post<T>(url, payload, { headers });
        break;
      case 'PUT':
        response$ = this.http.put<T>(url, payload, { headers });
        break;
      case 'PATCH':
        response$ = this.http.patch<T>(url, payload, { headers });
        break;
      case 'DELETE':
        response$ = this.http.request<T>('DELETE', url, {
          headers,
          body: payload,
        });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response$.pipe();
    // return toCamelCase(response);
  }

  private buildHeaders(token?: string): HttpHeaders {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    headers['Authorization'] = `Bearer ${token ?? environment.adminJwt}`;
    headers['apikey'] = environment.adminJwt;
    return new HttpHeaders(headers);
  }

  private buildUrl(
    path: string,
    queryParams?: Record<string, string | number | boolean>
  ): string {
    const url = new URL(`${this.baseUrl}${path}`, location.origin);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) =>
        url.searchParams.append(key, String(value))
      );
    }
    return url.toString();
  }

  private getToken(): string | undefined {
    if (this.platformService.isServer) {
      return undefined;
    }
    const token = localStorage.getItem(LocalStorageKeys.TOKEN);
    if (!token) {
      return undefined;
    }
    if (this.jwtHelper.isTokenExpired(token)) {
      this.logout(); // Call logout if the token is expired
      return undefined;
    }
    return token;
  }

  public isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  public decodeToken(token: string): any {
    return this.jwtHelper.decodeToken(token);
  }

  logout() {
    localStorage.removeItem(LocalStorageKeys.TOKEN);
    // Additional cleanup logic if needed
  }
}
