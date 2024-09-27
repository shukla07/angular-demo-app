import {HttpHeaders, HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {IAdapter} from '../adapters/i-adapter';
import {ICommand} from './i-command';
import { HttpObserve } from "../../types";

export class ExtPostAPICommand<T> implements ICommand {
  constructor(
    protected readonly httpService: HttpClient,
    protected readonly adapter: IAdapter<T>,
    protected readonly uri: string,
  ) {}

  parameters: {data: T; headers?: HttpHeaders; observe?: HttpObserve};

  execute(): Observable<T> {
    if (!this.parameters) {
      throwError(`Parameters missing for POST ${this.uri}`);
    }
    // sonarignore:start
    const options: any = {observe: this.parameters.observe || 'body'};
    // sonarignore:end
    if (this.parameters.headers) {
      options.headers = this.parameters.headers;
    }
    return this.httpService
      .post(
        this.uri,
        this.adapter.adaptFromModel(this.parameters.data),
        options,
      )
      .pipe(map(resp => this.adapter.adaptToModel(resp)));
  }
}
