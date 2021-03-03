import { Routes } from 'nest-router';
import { AuthModule } from './auth/auth.module';
import { PingModule } from './ping/ping.module';
export const ApiRoutes: Routes = [
  {
    path: '/ping',
    module: PingModule,
  },
  {
    path: '/auth',
    module: AuthModule,
  },
];
