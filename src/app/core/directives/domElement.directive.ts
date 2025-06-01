import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[domElement]',
  exportAs: 'domElement',
  standalone: true,
})
export class DomElementDirective {
  element = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);
  constructor() {}
}
