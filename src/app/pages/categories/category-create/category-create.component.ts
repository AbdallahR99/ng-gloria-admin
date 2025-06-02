import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHARED_MODULES } from '@app/core/shared/modules/shared.module';

@Component({
  selector: 'app-category-create',
  imports: [SHARED_MODULES],
  templateUrl: './category-create.component.html',
  styleUrl: './category-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCreateComponent {}
