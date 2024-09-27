import {Component, ViewEncapsulation} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {UserSessionStoreService as StoreService} from '../../../app/core/store/user-session-store.service';

@Component({
  selector: 'vsml-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent extends RouteComponentBase {
  menuLists = [
    {
      name: 'Notification settings',
      link: '/main/settings/notification',
      icon: 'settings-outline',
    },
    {
      name: 'Change Password',
      link: '/main/settings/change-password',
      icon: 'lock-outline',
    },
  ];

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly store: StoreService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    if (
      this.store.getUser().role === '7' ||
      this.store.getUser().role === '9'
    ) {
      this.menuLists.pop();
    }
    if (this.store.getUser().permissions.includes('CreateAzureTenantConfig')) {
      this.menuLists.push({
        name: 'Calendar Config',
        link: '/main/settings/calendar-config',
        icon: 'calendar-outline',
      });
      this.menuLists.push({
        name: 'Single Sign On Config',
        link: '/main/settings/sso-config',
        icon: 'log-in-outline',
      });
    }
  }
}
