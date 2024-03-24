import {AttachmentModel} from './attachment.model';

export class EmailDetailsModel {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  htmlContent: string;
  files: File[] = [];
  status: string;
  uploadedAttachmentsInfo: AttachmentModel[];
}
