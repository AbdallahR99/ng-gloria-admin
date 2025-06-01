import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '../../modules/shared.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoadingService } from '@app/core/services/loading.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-layout',
  imports: [
    SHARED_MODULES,
    HeaderComponent,
    FooterComponent,
    MatProgressBarModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  host: {
    class: 'h-full flex flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {}
