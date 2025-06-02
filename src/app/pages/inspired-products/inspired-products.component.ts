import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-inspired-products',
  imports: [],
  templateUrl: './inspired-products.component.html',
  styleUrl: './inspired-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiredProductsComponent { }
