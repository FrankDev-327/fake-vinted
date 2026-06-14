import { Module, Global } from '@nestjs/common';
import { LogsService } from './logs.service';

@Global()
@Module({
  imports: [],
  providers: [{
    provide: LogsService,
    useFactory: () => {
      const fileCustomName = 'application'; 
      return new LogsService(fileCustomName);
    },  
  }]
})
export class LogsModule {}
