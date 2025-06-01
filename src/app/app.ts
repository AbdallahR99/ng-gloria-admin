import { Component } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'ng-gloria-admin';
  constructor(private router: Router, private loadingService: LoadingService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.startLoading();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.stopLoading();
      }
    });
  }
}
