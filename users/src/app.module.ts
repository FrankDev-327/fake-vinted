import { Module } from '@nestjs/common';
import { LogsModule } from './loggers/logs.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [LogsModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
