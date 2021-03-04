import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

import { ConfigServiceMock } from '../../test/utils/mocks/config.service';
import { JwtServiceMock } from '../../test/utils/mocks/jwt.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('../users/users.service');
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: ConfigService,
          useValue: ConfigServiceMock,
        },
        {
          provide: JwtService,
          useValue: JwtServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('deletePasswordFromUserObject', () => {
    it('should delete the password', () => {
      const user = new User(1, 'test@test.com', 'Test', 'Testerson', 'test123');
      authService.deletePasswordFromUserObject(user);
      expect(user.password).toBeUndefined();
    });
  });

  describe('getAuthenticatedUser', () => {
    it('when user does not exist, should return unauthorized', async (done) => {
      jest.spyOn(usersService, 'getByEmail').mockImplementation(() => {
        throw new NotFoundException('User with this email does not exist');
      });
      expect(
        await authService
          .getAuthenticatedUser('email@test.com', 'password')
          .then(() =>
            done.fail(
              'Auth service should throw a UnauthorizedException but did not',
            ),
          )
          .catch((error) => {
            expect(error.status).toBe(HttpStatus.UNAUTHORIZED);
            expect(error.message).toBe('Wrong credentials provided');
            done();
          }),
      );
    });
    it('when the passwords dont match, should return unauthorized', async (done) => {
      const user = new User(
        1,
        'test@test.com',
        'Test',
        'Testerson',
        'password',
      );
      jest.spyOn(usersService, 'getByEmail').mockResolvedValue(user);
      expect(
        await authService
          .getAuthenticatedUser('test@test.com', 'differentPassword')
          .then(() =>
            done.fail(
              'Auth service should throw a UnauthorizedException but did not',
            ),
          )
          .catch((error) => {
            expect(error.status).toBe(HttpStatus.UNAUTHORIZED);
            expect(error.message).toBe('Wrong credentials provided');
            done();
          }),
      );
    });

    it('when the passwords match, should return the user object but without the password', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      const expectedUser = new User(
        1,
        'test@test.com',
        'Test',
        'Testerson',
        hashedPassword,
      );
      jest.spyOn(usersService, 'getByEmail').mockResolvedValue(expectedUser);
      const user = await authService.getAuthenticatedUser(
        'test@test.com',
        'password',
      );
      expect(user.email).toBe(expectedUser.email);
      expect(user.firstName).toBe(expectedUser.firstName);
      expect(user.id).toBe(expectedUser.id);
      expect(user.lastName).toBe(expectedUser.lastName);
      expect(user.password).toBeUndefined();
    });
  });
  describe('getCookieWithJwtToken', () => {
    it('returns a string with the mocked jwt cookie data', () => {
      const authToken = authService.getCookieWithJwtToken(1);
      expect(authToken).toBe(
        'Authentication=signedJwtToken; HttpOnly; Path=/; Max-Age=3600',
      );
    });
  });
});
