import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[cartButtonAddCustom]',
})
export class CartButtonAddCustomDirective {
  tempRef: TemplateRef<any> = inject(TemplateRef);
}
