import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { User } from '../users/models/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('./auth.service');
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('registerUser', () => {
    const dto = new RegisterUserDto();
    it('should return 400 if the service throws a BadRequestException', async (done) => {
      jest.spyOn(authService, 'register').mockImplementation(() => {
        throw new BadRequestException('User with that email already exists');
      });
      expect(
        await authController
          .registerUser(dto)
          .then(() =>
            done.fail(
              'Auth controller should return BadRequestException error of 400 but did not',
            ),
          )
          .catch((error) => {
            expect(error.status).toBe(HttpStatus.BAD_REQUEST);
            expect(error.message).toBe('User with that email already exists');
            done();
          }),
      );
    });

    it('should return 500 if the service throws an InternalServerException', async (done) => {
      jest.spyOn(authService, 'register').mockImplementation(() => {
        throw new InternalServerErrorException('Something went wrong');
      });
      expect(
        await authController
          .registerUser(dto)
          .then(() =>
            done.fail(
              'Auth controller should return BadRequestException error of 400 but did not',
            ),
          )
          .catch((error) => {
            expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(error.message).toBe('Something went wrong');
            done();
          }),
      );
    });

    it('should return a UserRegisteredResponse when the user is created correctly', async () => {
      const userReturnedByTheService = new User(
        1,
        'test@test.com',
        'Test',
        'Testerson',
        'test123',
      );

      jest
        .spyOn(authService, 'register')
        .mockResolvedValue(userReturnedByTheService);

      const expectedResponse = {
        email: 'test@test.com',
        id: 1,
      };

      const actualResponse = await authController.registerUser(dto);
      expect(actualResponse.email).toBe(expectedResponse.email);
      expect(actualResponse.id).toBe(expectedResponse.id);
    });
  });
});
