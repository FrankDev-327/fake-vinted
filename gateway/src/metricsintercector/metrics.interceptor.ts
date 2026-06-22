import 'dotenv/config';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly promService: PromGatewayService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = (Date.now() - start) / 1000;
        this.promService.observeRequestDuration(method, path, statusCode, duration);
      }),
    );
  }
}
