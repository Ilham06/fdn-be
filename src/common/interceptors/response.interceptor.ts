import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((response: any) => {
        
        if (response?.status === 'success' || response?.status === 'error') {
          return response;
        }

       
        if (response?.meta) {
          return {
            status: 'success',
            message: 'Success',
            meta: response.meta,
            data: response.data,
          };
        }

        
        return {
          status: 'success',
          message: 'Success',
          data: response,
        };
      }),
    );
  }
}
