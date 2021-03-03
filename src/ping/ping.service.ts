import { Injectable } from '@nestjs/common';

interface PingInterface {
  response: string;
}

@Injectable()
export class PingService {
  ping(): PingInterface {
    return {
      response: 'pong',
    };
  }
}
