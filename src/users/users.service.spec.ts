import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let module: TestingModule;
  let usersRepositoryMock: MockType<Repository<User>>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepositoryMock = module.get(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should store the generated user with the data passed as the dto', async () => {
      const user = new User(
        1,
        'test@test.com',
        'Test',
        'Testerson',
        'password',
      );
      const userDto = {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'Testerson',
        password: 'password',
      };
      usersRepositoryMock.create.mockReturnValue(user);

      expect(await usersService.createUser(userDto)).toBe(user);
      expect(usersRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(user);
    });
  });

  describe('getByEmail', () => {
    it('should throw a NotFoundException when the user does not exist', async (done) => {
      usersRepositoryMock.findOne.mockReturnValue(null);
      expect(
        await usersService
          .getByEmail('test@test.com')
          .then(() =>
            done.fail('Service should return NotFoundException, but did not'),
          )
          .catch((error) => {
            expect(error.status).toBe(HttpStatus.NOT_FOUND);
            expect(error.message).toBe('User with this email does not exist');
            done();
          }),
      );
    });
  });
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  }),
);
export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
