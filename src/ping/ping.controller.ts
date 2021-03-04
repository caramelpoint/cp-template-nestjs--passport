import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PingService } from './ping.service';

interface PingResponse {
  response: string;
}

@ApiTags('ping')
@Controller()
export class PingController {
  constructor(private pingService: PingService) {}

  @Get()
  ping(): PingResponse {
    return this.pingService.ping();
  }
}
