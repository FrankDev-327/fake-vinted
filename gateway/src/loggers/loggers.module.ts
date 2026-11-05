import { Global, Module } from '@nestjs/common';
import { Logs } from './loggers.service';

@Global()
@Module({
    imports: [],
        providers: [
        {
            provide: Logs,
            useFactory: () => {
                const fileCustomName = 'application';
                return new Logs(fileCustomName);
            },
        },
    ],
    exports: [Logs],   
})
export class LoggersModule {}
