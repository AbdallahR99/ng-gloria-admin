import { Pipe, type PipeTransform } from '@angular/core';
import { environment } from '@environments/environment';

@Pipe({
  name: 'supabaseImage',
})
export class SupabaseImagePipe implements PipeTransform {
 imagePath = environment.supabaseImages;
  transform(path: string): unknown {
    return `${this.imagePath}${path}`;
  }

}
