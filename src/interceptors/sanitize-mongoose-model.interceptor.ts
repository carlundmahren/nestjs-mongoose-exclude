import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transformer, defaultTransformOptions } from '../Transformer';
import { TransformOptions } from '../interfaces/transform-options.interface';
import { storage } from '../storage';

@Injectable()
export class SanitizeMongooseModelInterceptor implements NestInterceptor {
  constructor(private transformOptions: TransformOptions = defaultTransformOptions) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (
          typeof data === 'object' &&
          Object.keys(data).includes('req') &&
          Object.keys(data).includes('socket') &&
          Object.keys(data).includes('locals') &&
          Object.keys(data).includes('writeHead')
        ) {
          return data;
        } else {
          const transformer = new Transformer(storage, this.transformOptions);
          const transformedData = transformer.transform(data);
          return transformedData;
        }
      }),
    );
  }
}
