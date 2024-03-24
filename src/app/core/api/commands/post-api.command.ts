import {HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {IAdapter} from '../adapters/i-adapter';
import {ApiService} from '../api.service';
import {ICommand} from './i-command';
import {HttpObserve} from '../../types';

export class PostAPICommand<T> implements ICommand {
  constructor(
    protected readonly apiService: ApiService,
    protected readonly adapter: IAdapter<T>,
    protected readonly uri: string,
  ) {}

  parameters: {
    data: T;
    headers?: HttpHeaders;
    observe?: HttpObserve;
    query?: HttpParams;
  };

  execute(): Observable<T> {
    if (!this.parameters) {
      throwError(`Parameters missing for POST ${this.uri}`);
    }
    const options: any = {};
    options.observe = this.parameters.observe || 'body';
    if (this.parameters.headers) {
      options.headers = this.parameters.headers;
    }
    if (this.parameters.query) {
      options.params = this.parameters.query;
    }
    return this.apiService
      .post(
        this.uri,
        this.adapter.adaptFromModel(this.parameters.data),
        options,
      )
      .pipe(map(resp => this.adapter.adaptToModel(resp)));
  }
}
