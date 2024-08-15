import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vnMoneyFormatter'
})
export class VnMoneyFormatterPipe implements PipeTransform {

  transform(value: number): string {
    if (isNaN(value)) return '';
    const inThousands = value / 1000;
    let formattedNumber: string;
    if (inThousands < 1000) {
      formattedNumber = inThousands.toFixed(0) + 'K';
    } else {
      formattedNumber = (inThousands / 1000).toFixed(3) + 'K';
    }
    formattedNumber = formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedNumber;
  }
}
