import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TransferStateService {
  private keys = new Map<string, StateKey<string>>();

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: string,
    private readonly transferState: TransferState
  ) {}

  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.has(key)) {
      return defaultValue || null;
    }

    return this.transferState.get<T>(
      this.getStateKey(key) as any,
      <T>defaultValue
    );
  }

  has(key: string): boolean {
    return this.transferState.hasKey(this.getStateKey(key));
  }

  set(key: string, value: any): void {
    if (isPlatformServer(this.platformId)) {
      if (this.has(key)) {
        console.warn(
          `Setting existing value into TransferState using key: '${key}'`
        );
      }

      this.transferState.set(this.getStateKey(key), value);
    }
  }

  private getStateKey(key: string): StateKey<string> {
    if (this.keys.has(key)) {
      return <StateKey<string>>this.keys.get(key);
    }

    this.keys.set(key, makeStateKey(key));

    return <StateKey<string>>this.keys.get(key);
  }
}
