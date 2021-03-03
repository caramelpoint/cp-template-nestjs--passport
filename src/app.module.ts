import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { ApiRoutes } from './routes';
import { RouterModule } from 'nest-router/router.module';
import { PingModule } from './ping/ping.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/db.module';
import { AuthModule } from './auth/auth.module';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      load: [configuration],
      validationSchema,
    }),
    RouterModule.forRoutes(ApiRoutes),
    DatabaseModule,
    PingModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
