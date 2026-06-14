import { Module } from '@nestjs/common';
import { LogsModule } from './loggers/logs.module';


@Module({
  imports: [LogsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
