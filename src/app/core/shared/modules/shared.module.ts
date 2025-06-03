import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DomElementDirective } from '@app/core/directives/domElement.directive';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SupabaseImagePipe } from '@app/core/pipes/supabaseImage.pipe';

const SHARED_MATERIAL_MODULES = [MatIconModule, MatProgressBarModule];

export const SHARED_MODULES = [
  ...SHARED_MATERIAL_MODULES,
  RouterModule,
  TranslateModule,
  CommonModule,
  FormsModule,
  DomElementDirective,
  ReactiveFormsModule,
  SupabaseImagePipe,
];
