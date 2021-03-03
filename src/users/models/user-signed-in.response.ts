import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.model';

export class UserSignedInResponse {
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public firstName: string;

  @ApiProperty()
  public lastName: string;
}
