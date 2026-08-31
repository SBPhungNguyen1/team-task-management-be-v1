import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  code: number;

  @ApiProperty({
    example: 'Success',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
