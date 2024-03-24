import {NameId} from '@vmsl/core/models';

export class Role extends NameId {
  permissions: string[] = [];
  roleType: number;
}
