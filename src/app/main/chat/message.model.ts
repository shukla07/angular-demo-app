export class Message {
  text: string;
  date: object;
  reply: boolean;
  type: string;
  files = [];
  user: object;
  canChat?: boolean;
}
