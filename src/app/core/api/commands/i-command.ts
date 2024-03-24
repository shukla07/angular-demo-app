import { Observable } from "rxjs";

export interface ICommand {
  parameters?: any;
  execute(): Observable<any>;
}
