import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {STATUS_CODE} from '@vmsl/core/api/error-code';
import {get} from 'lodash';
import {ToastrService} from 'ngx-toastr';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from '@vmsl/env/environment';

export const ErrToastSkipHeader = 'X-Skip-Error-Toast';
const errorMsgConst = 'error.error.message.message';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly toastrService: ToastrService) {}

  private _checkTokenExpiryErr(error: HttpErrorResponse): boolean {
    return (
      error.status &&
      error.status === STATUS_CODE.UNAUTHORIZED &&
      get(error, 'error.error.message.name') === 'UnauthorizedError'
    );
  }

  intercept(
    // sonarignore:start
    req: HttpRequest<any>,
    // sonarignore:end
    next: HttpHandler,
    // sonarignore:start
  ): Observable<HttpEvent<any>> {
    // sonarignore:end
    if (req.headers.has(ErrToastSkipHeader)) {
      const headers = req.headers.delete(ErrToastSkipHeader);
      return next.handle(req.clone({headers}));
    } else if (
      req.url.endsWith('/logout') ||
      req.url.endsWith('/token-refresh')
    ) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        catchError((error, caught) => {
          if (
            error instanceof HttpErrorResponse &&
            error.error.error.statusCode === STATUS_CODE.UNPROCESSABLE_ENTITY
          ) {
            const errMsg = this.getErrMsg(error);
            this.toastrService.error(errMsg, 'ERROR', {
              timeOut: environment.messageTimeout,
            });
          } else if (
            error instanceof HttpErrorResponse &&
            !this._checkTokenExpiryErr(error)
          ) {
            let errMsg = get(error, errorMsgConst);
            errMsg =
              errMsg ||
              get(
                error,
                'error.error.message',
                'Some error occured. Please try again.',
              );
            this.toastrService.error(errMsg, 'ERROR', {
              timeOut: environment.messageTimeout,
            });
          } else {
            // redundant else block
          }
          throw error;
        }),
      );
    }
  }

  getErrMsg(err) {
    const errDetails = get(err, 'error.error.details');
    let errMsg: string;
    errDetails.forEach(item => {
      if (errMsg) {
        errMsg = `${errMsg} \
        ${item.path} ${item.message}`;
      } else {
        errMsg = `${item.path} ${item.message}`;
      }
    });
    return errMsg;
  }
}
