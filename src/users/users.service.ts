import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(userData: RegisterUserDto): Promise<User> {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new NotFoundException('User with this email does not exist');
  }

  async getById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ id });
    if (user) {
      return user;
    }
    throw new NotFoundException('User not found');
  }
}
