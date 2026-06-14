import { Global, Module } from '@nestjs/common';
import { Logs } from './loggers.service';

@Global()
@Module({
    imports: [],
        providers: [
        {
            provide: Logs,
            useFactory: () => {
                const fileCustomName = 'application'; // You can set this dynamically or retrieve from config
                return new Logs(fileCustomName);
            },
        },
    ],
    exports: [Logs],   
})
export class LoggersModule {}
