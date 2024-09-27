import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { Injectable } from '@angular/core';
import { QuickNotes } from '../models/quick-notes-templates.model';

@Injectable()
export class GetQuickNotesAdapter implements IAdapter<QuickNotes> {
  adaptToModel(resp: any): QuickNotes {
    return {
      id: resp.id,
      message: resp.message,
    };
  }

  adaptFromModel(data) {
    return data;
  }
}
