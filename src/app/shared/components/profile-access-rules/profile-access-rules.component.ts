import {Location} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  AccessRules,
  AccessRulesAssociation,
} from '@vmsl/core/auth/models/user.model';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {RoleName} from '@vmsl/core/enums';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';
import {RouteComponentBase} from '@vmsl/core/route-component-base';

@Component({
  selector: 'vmsl-profile-access-rules',
  templateUrl: './profile-access-rules.component.html',
  styleUrls: ['./profile-access-rules.component.scss'],
})
export class ProfileAccessRulesComponent extends RouteComponentBase {
  @Input() accessRules: AccessRules[];
  @Output() tabTitle = new EventEmitter();
  @Output() removeItem = new EventEmitter();
  @Output() onToggleAssociationType = new EventEmitter();
  filter = {name: ''};
  permissions = Permission;
  accessRulesAssociation = AccessRulesAssociation;
  throwRequiredError = false;
  divisionStates = DivisionStates;
  isProfileRoute = false;

  constructor(protected route: ActivatedRoute, protected location: Location) {
    super(route, location);
  }

  ngOnInit() {
    if (window.location.href.includes('profile')) {
      this.isProfileRoute = true;
    }
  }

  onTabChange(tabInfo) {
    this.tabTitle.emit(tabInfo.tabTitle);
  }

  onToggleChange(accessRule: AccessRules, event) {
    if (event) {
      accessRule.associatedTo = AccessRulesAssociation.all;
      this.onToggleAssociationType.emit(accessRule);
    } else {
      accessRule.associatedTo = AccessRulesAssociation.some;
      if (!accessRule.selected.length) {
        this.throwRequiredError = true;
      }
    }
  }

  onClickCrossIcon(listItem, tabTitle) {
    switch (tabTitle) {
      case DivisionStates.diseaseArea:
      case DivisionStates.therapeuticArea:
      case DivisionStates.territory:
        this.removeItem.emit({
          listItem: listItem,
          isUserTab: false,
          tabTitle: tabTitle,
        });
        break;
      case RoleName.director:
      case RoleName.superMSL:
      case RoleName.msl:
      case RoleName.hcp:
      case 'Team':
        this.removeItem.emit({
          listItem: listItem,
          isUserTab: true,
          tabTitle: tabTitle,
        });
        break;
    }
  }
}
