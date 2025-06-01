import { FacadeService } from '@app/core/services/facade-service.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { SHARED_MODULES } from '../../modules/shared.module';
import { rxResource } from '@angular/core/rxjs-interop';
import { Address } from '@app/core/models/address.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'address-form',
  imports: [SHARED_MODULES],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent {
  isLoading = signal(false);
  onAddressSubmitted = output<Address>();
  addressToEdit = input<Address>(undefined, { alias: 'address' });
  isEdit = computed(() => !!this.addressToEdit());
  facadeService = inject(FacadeService);
  get isEn() {
    return this.facadeService.translatorService.isEn;
  }

  get user() {
    return this.facadeService.usersService.user;
  }

  states = rxResource({
    stream: () => {
      return this.facadeService.statesService.get('AE');
    },
  });

  submit(form: NgForm) {
    form.form.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.isLoading.set(true);
    const address = form.value as Address;
    if (this.isEdit()) {
      this.facadeService.addressesService.update({ ...address }).subscribe({
        next: (data) => {
          this.isLoading.set(false);
          this.onAddressSubmitted.emit({
            ...address,
            ...data,
          });
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      this.facadeService.addressesService.create(address).subscribe({
        next: (data) => {
          this.isLoading.set(false);
          form.resetForm();
          this.onAddressSubmitted.emit({
            ...address,
            ...data,
          });
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    }
  }
}
