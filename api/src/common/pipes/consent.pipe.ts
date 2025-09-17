import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ConsentPipe implements PipeTransform<any> {
  transform(value: any) {
    if (!value.consentGiven)
      throw new BadRequestException('Patient consent required');
    return value;
  }
}
