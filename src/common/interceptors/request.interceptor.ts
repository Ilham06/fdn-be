import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestInterceptors implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const expectedKey = '3cdcnTiBsl';

    const auth = request.headers['authorization'];

    if (request.method === 'DELETE') {
      if (!auth) {
        throw new UnauthorizedException('Authorization header missing');
      }

      if (auth !== expectedKey) {
        throw new UnauthorizedException('Invalid authorization header');
      }
    }

    return next.handle();
  }
}
