import {NameId} from '@vmsl/core/models';
import {AttachmentModel} from './attachment.model';

export class EmailModel {
  from: NameId;
  to: NameId[];
  cc: NameId[];
  bcc: NameId[];
  formattedTime: string;
  subject: string;
  isNew: boolean;
  storage: string;
  hasAttachment: boolean;
  isImportant: boolean;
  time: Date;
  id: string;
  threadId: string;
  messageId: string;
  combinedToList: string;
  combinedCcList: string;
  combinedBccList: string;
  fromName: string;
  htmlContent: string;
  files: File[] = [];
  status: string;
  uploadedAttachmentsInfo: AttachmentModel[] = [];
  extendedFormattedTime: string;
  isSelected: boolean;
  externalMetaData: Object;
}
