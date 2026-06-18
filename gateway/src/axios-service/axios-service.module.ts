import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Logs } from '../loggers/loggers.service';
import { AxiosServiceService } from './axios-service.service';

@Global()
@Module({
  imports: [HttpModule.register({
    timeout: 5000,
    maxRedirects: 5,
  })],
  providers: [AxiosServiceService, {
    provide: Logs,
    useValue: new Logs(AxiosServiceService.name)
  }],
  exports: [AxiosServiceService],
})
export class AxiosServiceModule { }
