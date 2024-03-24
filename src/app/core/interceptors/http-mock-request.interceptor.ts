import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (environment.mock) {
      const newUrl = request.url.replace(
        'https://soundplay-dev.sourcefuse.com/',
        'http://localhost:3000/'
      );
      const apiReq = request.clone({ url: newUrl, method: 'GET' });
      return next.handle(apiReq);
    } else {
      return next.handle(request.clone());
    }
  }
}
