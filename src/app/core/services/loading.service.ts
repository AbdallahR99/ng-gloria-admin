import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSignal = signal(false);

  get isLoading() {
    return this.loadingSignal.asReadonly();
  }

  startLoading() {
    this.loadingSignal.set(true);
  }

  stopLoading() {
    this.loadingSignal.set(false);
  }
}
