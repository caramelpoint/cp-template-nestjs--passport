import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.model';

export class UserRegisteredResponse {
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public email: string;
}
