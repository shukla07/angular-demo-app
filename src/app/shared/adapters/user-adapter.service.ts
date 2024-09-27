import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { Injectable } from '@angular/core';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import {
  AccessRules,
  AccessRulesAssociation,
  DsFlags,
  UserInfo,
} from '@vmsl/core/auth/models/user.model';
import { RoleName, RoleType } from '@vmsl/core/enums';
import { DivisionStates } from '@vmsl/core/enums/division-states.enum';

@Injectable()
export class AddUserAdapter implements IAdapter<any> {
  constructor(private readonly store: UserSessionStoreService) { }
  adaptToModel(resp: any) {
    if (resp) {
      const userInfo = new UserInfo();
      userInfo.id = resp.id;
      userInfo.title = resp.title;
      userInfo.role = resp.roleId;
      userInfo.roleName = [RoleType.jrHcp].includes(resp.roleType)
        ? RoleName.hcp
        : resp.roleName;
      userInfo.userTitle = resp.jobTitleName || userInfo.roleName;
      userInfo.roleType = resp.roleType;
      userInfo.firstName = resp.firstName;
      userInfo.lastName = resp.lastName;
      userInfo.email = resp.email;
      userInfo.phone = resp.phone;
      userInfo.addressLine1 = resp.addressLine1;
      userInfo.addressLine2 = resp.addressLine2;
      userInfo.city = resp.city;
      userInfo.state = resp.state;
      userInfo.country = resp.country;
      userInfo.zip = resp.zip;
      userInfo.status = resp.status;
      userInfo.photoUrl = resp.photoUrl;
      userInfo.linkedUsersName = this.getLinkedUserNames(resp);
      userInfo.relationships = this.getRelationships(resp);
      userInfo.referralCode = resp.referralCode;
      userInfo.referralStatus = resp.referalStatus;
      userInfo.timeZone = resp.timezone;
      userInfo.isCalSync = resp.isCalSync;
      userInfo.licenseNumber = resp.licenseNumber;
      userInfo.institute = resp.institute;
      userInfo.maLink = resp.maLink ? resp.maLink : null;
      userInfo.jobTitle = resp.jobTitle;
      userInfo.tenantId = resp.tenantId;
      userInfo.diseaseAreas = resp.diseaseAreas;
      userInfo.therapeuticAreas = resp.therapeuticAreas;
      userInfo.territory = resp.territory;
      userInfo.teamNames =
        resp.teamNames && resp.teamNames.length > 0
          ? resp.teamNames.map(team => ` ${team}`)
          : null;
      userInfo.dsFlag = resp.dsFlag;
      if (resp.dsFlag === DsFlags.Both) {
        userInfo.dsTags = this.getDsTags(resp);
      }
      userInfo.permissions = resp.permissions;
      userInfo.tenantPhotoUrl = resp.tenantPhotoUrl;
      return userInfo;
    }
    return resp;
  }

  adaptFromModelHelper(data: UserInfo, userInfoResponse) {
    if (data.institute) {
      userInfoResponse['institute'] = data.institute;
    }
    if (data.licenseNumber) {
      userInfoResponse['licenseNumber'] = data.licenseNumber;
    }
    if (data.jobTitle) {
      userInfoResponse['jobTitle'] = data.jobTitle;
    }
    if (data.id !== this.store.getUser().id && data.dsFlag === DsFlags.Both) {
      const two = 2;
      userInfoResponse['territoryDivision'] = data.dsTags[0].selected;
      userInfoResponse['diseaseDivision'] = data.dsTags[two].selected;
      userInfoResponse['therapeuticDivision'] = data.dsTags[1].selected;
    }
    if (data.id === this.store.getUser().id) {
      delete userInfoResponse.relationships;
    }
  }

  adaptFromModel(data: UserInfo) {
    const userInfoResponse = {
      userDetails: {
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        defaultTenantId: data.tenantId
          ? data.tenantId
          : this.store.getUser().tenantId,
        username: data.email.trim(),
        email: data.email.trim(),
        phone: data.phone,
        imageKey: data.photoKey,
      },
      status: data.status,
      roleId: data.role,
      tenantId: data.tenantId ? data.tenantId : this.store.getUser().tenantId,
      relationships: this.setRelationships(data),
      country: data.country ?? '',
      state: data.state ?? '',
      timezone: data.timeZone,
      addressLine1: data.addressLine1 ? data.addressLine1.trim() : '',
      addressLine2: data.addressLine2 ? data.addressLine2.trim() : '',
      city: data.city ? data.city.trim() : '',
      zip: data.zip ? data.zip : '',
      dsFlag: data.dsFlag,
      maLink: data.maLink ? data.maLink : '',
    };

    this.adaptFromModelHelper(data, userInfoResponse);

    return userInfoResponse;
  }

  setRelationshipsForDirector(relation, managesArr, servesArr, sameAs) {
    if (
      relation.titleName === RoleName.msl ||
      relation.titleName === RoleName.superMSL
    ) {
      relation.selected.forEach(ele => {
        managesArr.push(ele);
      });
    } else if (relation.titleName === RoleName.hcp) {
      relation.selected.forEach(ele => {
        servesArr.push(ele);
      });
    } else if (relation.titleName === RoleName.director) {
      relation.selected.forEach(ele => {
        sameAs.push(ele);
      });
    } else {
      //empty else block
    }
  }

  setRelationshipsForSuperMSL(
    relation,
    managedByArr,
    managesArr,
    servesArr,
    sameAs,
  ) {
    if (relation.titleName === RoleName.director) {
      relation.selected.forEach(ele => {
        managedByArr.push(ele);
      });
    } else if (relation.titleName === RoleName.msl) {
      relation.selected.forEach(ele => {
        managesArr.push(ele);
      });
    } else if (relation.titleName === RoleName.hcp) {
      relation.selected.forEach(ele => {
        servesArr.push(ele);
      });
    } else if (relation.titleName === RoleName.superMSL) {
      relation.selected.forEach(ele => {
        sameAs.push(ele);
      });
    } else {
      //empty else block
    }
  }

  setRelationships(data: UserInfo) {
    const managedByArr = [];
    const managesArr = [];
    const servedByArr = [];
    const servesArr = [];
    const sameAs = [];
    if (data.relationships) {
      data.relationships.forEach(relation => {
        switch (data.roleType) {
          case RoleType.Director:
            this.setRelationshipsForDirector(
              relation,
              managesArr,
              servesArr,
              sameAs,
            );
            break;
          case RoleType.superMSL:
            this.setRelationshipsForSuperMSL(
              relation,
              managedByArr,
              managesArr,
              servesArr,
              sameAs,
            );
            break;
          case RoleType.msl:
            if (
              relation.titleName === RoleName.superMSL ||
              relation.titleName === RoleName.director
            ) {
              relation.selected.forEach(ele => {
                managedByArr.push(ele);
              });
            } else if (relation.titleName === RoleName.hcp) {
              relation.selected.forEach(ele => {
                servesArr.push(ele);
              });
            } else if (relation.titleName === RoleName.msl) {
              relation.selected.forEach(ele => {
                sameAs.push(ele);
              });
            } else {
              //empty else block
            }
            break;
          case RoleType.hcp:
            relation.selected.forEach(ele => {
              servedByArr.push(ele);
            });
            break;
        }
      });
    }
    return {
      ManagedBy: managedByArr,
      Manages: managesArr,
      ServedBy: servedByArr,
      Serves: servesArr,
      SameAs: sameAs,
    };
  }

  getRelationships(data) {
    const userRelationships = [];
    const director = new AccessRules(
      RoleName.director,
      AccessRulesAssociation.na,
    );
    const mml = new AccessRules(RoleName.superMSL, AccessRulesAssociation.na);
    const ml = new AccessRules(RoleName.msl, AccessRulesAssociation.na);
    const hcp = new AccessRules(RoleName.hcp, AccessRulesAssociation.na);

    if (data.relationships) {
      data.relationships.forEach(user => {
        if (!user.user_deleted) {
          switch (user.role_name) {
            case RoleName.director:
              director.elements.push({ name: user.user_name, id: user.user_id });
              director.selected.push(user.user_id);
              break;
            case RoleName.superMSL:
              mml.elements.push({ name: user.user_name, id: user.user_id });
              mml.selected.push(user.user_id);
              break;
            case RoleName.msl:
              ml.elements.push({ name: user.user_name, id: user.user_id });
              ml.selected.push(user.user_id);
              break;
            case RoleName.hcp:
              hcp.elements.push({ name: user.user_name, id: user.user_id });
              hcp.selected.push(user.user_id);
              break;
          }
        }
      });
    }
    switch (data.roleName) {
      case RoleName.director:
        userRelationships.push(director, mml, ml, hcp);
        break;
      case RoleName.superMSL:
        userRelationships.push(director, mml, ml, hcp);
        break;
      case RoleName.msl:
        userRelationships.push(director, mml, ml, hcp);
        break;
      case RoleName.hcp:
        userRelationships.push(director, mml, ml);
        break;
    }

    return userRelationships;
  }

  getDsTags(user) {
    let territory: AccessRules;
    if (user.dsConfig.territoryDivTag === 'some') {
      territory = new AccessRules(
        DivisionStates.territory,
        AccessRulesAssociation.some,
      );
    } else {
      territory = new AccessRules(
        DivisionStates.territory,
        AccessRulesAssociation.all,
      );
    }
    if (user.territory) {
      territory.elements = user.territory;
      territory.selected = user.territory && user.territory.map(ele => ele.id);
    } else {
      territory.elements = [];
      territory.selected = [];
    }

    let ta: AccessRules;
    if (user.dsConfig.therapeuticDivTag === 'some') {
      ta = new AccessRules(
        DivisionStates.therapeuticArea,
        AccessRulesAssociation.some,
      );
    } else {
      ta = new AccessRules(
        DivisionStates.therapeuticArea,
        AccessRulesAssociation.all,
      );
    }
    if (user.therapeuticAreas) {
      ta.elements = user.therapeuticAreas;
      ta.selected =
        user.therapeuticAreas && user.therapeuticAreas.map(ele => ele.id);
    } else {
      ta.elements = [];
      ta.selected = [];
    }

    let da: AccessRules;
    if (user.dsConfig.diseaseDivTag === 'some') {
      da = new AccessRules(
        DivisionStates.diseaseArea,
        AccessRulesAssociation.some,
      );
    } else {
      da = new AccessRules(
        DivisionStates.diseaseArea,
        AccessRulesAssociation.all,
      );
    }
    if (user.diseaseAreas) {
      da.elements = user.diseaseAreas;
      da.selected = user.diseaseAreas && user.diseaseAreas.map(ele => ele.id);
    } else {
      da.elements = [];
      da.selected = [];
    }
    return [territory, ta, da];
  }

  getLinkedUserNames(data) {
    const linkedUser = [];
    if (data.relationships) {
      data.relationships.forEach(element => {
        linkedUser.push(` ${element.user_name}(${element.role_name})`);
      });
    }
    return linkedUser;
  }
}
