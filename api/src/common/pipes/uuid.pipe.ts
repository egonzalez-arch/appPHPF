import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UuidPipe implements PipeTransform<string> {
  transform(value: string) {
    if (!uuidValidate(value)) throw new BadRequestException('Invalid UUID');
    return value;
  }
}
