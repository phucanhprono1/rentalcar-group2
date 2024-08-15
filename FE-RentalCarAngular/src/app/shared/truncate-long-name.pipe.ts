import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateLongName'
})
export class TruncateLongNamePipe implements PipeTransform {
  transform(value: string, limit = 10, trail = '...'): string {
    if (!value) { return ''; } // Handle null or undefined values
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }

}
