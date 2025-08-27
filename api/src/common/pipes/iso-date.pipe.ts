import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class IsoDatePipe implements PipeTransform<string> {
  transform(value: string) {
    if (isNaN(Date.parse(value))) throw new BadRequestException('Invalid ISO Date');
    return new Date(value);
  }
}