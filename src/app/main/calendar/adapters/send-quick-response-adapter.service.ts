import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { Injectable } from '@angular/core';
import { QuickNotes } from '../models/quick-notes-templates.model';

@Injectable()
export class SendQuickResponseAdapter implements IAdapter<QuickNotes> {
  adaptToModel(resp: any): QuickNotes {
    return resp;
  }

  adaptFromModel(data: QuickNotes) {
    return {
      rsvpStatus: 'QuickMessage',
      messageId: data.id,
    };
  }
}
