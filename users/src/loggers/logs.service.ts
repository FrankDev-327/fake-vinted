import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LogsService implements LoggerService {
    private logger;
    constructor(fileCustomName: string) {
        this.logger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
            transports: [
                new transports.File({ filename: `logs/${fileCustomName}.log` }),
            ],
        });

        if (process.env.NODE_ENV === 'dev') {
            this.logger.add(new transports.Console({
                level: 'info',
                format: format.combine(
                    format.colorize(),
                    format.simple()
                ),
            }))
        }
    }

    log(message: any, ...optionalParams: any[]) {
        this.logger.info(message, optionalParams);
    }

    error(message: any, ...optionalParams: any[]) {
        this.logger.error(message, optionalParams);
    }

    warn(message: any, ...optionalParams: any[]) {
        this.logger.warn(message, optionalParams);
    }

    debug?(message: any, ...optionalParams: any[]) {
        this.logger.debug(message, optionalParams);
    }

    verbose?(message: any, ...optionalParams: any[]) {
    }

    fatal?(message: any, ...optionalParams: any[]) { }
}
