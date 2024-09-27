import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { Injectable } from '@angular/core';

@Injectable()
export class ProposeNewTimeAdapter implements IAdapter<any> {
  adaptToModel(resp: any): any {
    return resp;
  }

  adaptFromModel(newTime: any) {
    return {
      rsvpStatus: 'ProposeNewTime',
      proposedTime: newTime,
    };
  }
}
