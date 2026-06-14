import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AxiosServiceService } from './axios-service.service';

@Global()
@Module({
  imports: [HttpModule.register({
    timeout: 5000,
    maxRedirects: 5,
  })],
  providers: [AxiosServiceService],
  exports: [AxiosServiceService], 
})
export class AxiosServiceModule {}
