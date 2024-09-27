import {NameId} from '@vmsl/core/models';
import {AttachmentModel} from './attachment.model';
import {EmailModel} from './email.model';

export class EmailLoopModel {
  to: NameId[];
  cc: NameId[];
  bcc: NameId[];
  from: NameId;
  formattedTime: string;
  subject: string;
  body: string;
  messageCounts: number;
  isNew: boolean;
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
  uploadedAttachmentsInfo: AttachmentModel[];
  messages: EmailModel[];
  messageIds: string[];
  isSelected: boolean;
  extendedFormattedTime: string;
  forwarded: boolean;
  forwardedTo: string;
}
