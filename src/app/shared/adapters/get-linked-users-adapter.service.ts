import { Injectable } from '@angular/core';
import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';

@Injectable()
export class GetLinkedUserAdapter implements IAdapter<UserInfo[]> {
  currentUser: UserInfo;
  constructor(private readonly store: UserSessionStoreService) {
    this.currentUser = this.store.getUser();
  }
  adaptToModel(resp: any): UserInfo[] {
    const linkedUsers = [];
    const restrictRelationships = ['ManagedBy', 'ServedBy', 'SameAs'];
    if (resp.relationships) {
      resp.relationships.forEach(user => {
        if (!restrictRelationships.includes(user.relationship)) {
          const users = {
            roleName: user.role_name,
            fullName: user.user_name,
            userTenantId: user.user_tenant_id,
            id: user.user_id,
          };
          linkedUsers.push(users);
        }
      });
    }
    linkedUsers.push({
      fullName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      userTenantId: this.currentUser.userTenantId,
      id: this.currentUser.id,
      role: this.currentUser.role,
    });
    return linkedUsers;
  }
  adaptFromModel(data: any): any {
    return data;
  }
}
