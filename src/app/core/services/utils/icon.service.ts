import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private iconRegistry = inject<MatIconRegistry>(MatIconRegistry);
  private sanitizer = inject<DomSanitizer>(DomSanitizer);

  registerIcons(): void {
    const icons = [
      'cart',
      'cross',
      'fb',
      'insta',
      'linkedin',
      'menu',
      'whatsapp',
      'heart',
      'heart-filled',
      'w_box',
      'w_headset',
      'w_nature',
      'w_shipped',

      // footer icons
      'phone',
      'email',
      'location',
    ];

    icons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`icons/${icon}.svg`)
      );
    });
    this.iconRegistry.registerFontClassAlias(
      'symbols',
      'material-symbols-rounded'
    );
    const defaultFontSetClasses = this.iconRegistry.getDefaultFontSetClass();
    const outlinedFontSetClasses = defaultFontSetClasses
      .filter((fontSetClass) => fontSetClass !== 'material-icons')
      .concat(['material-symbols-rounded']);
    this.iconRegistry.setDefaultFontSetClass(...outlinedFontSetClasses);
  }
}
