import {Component, ViewEncapsulation} from '@angular/core';
import {NbComponentStatus, NbSidebarService} from '@nebular/theme';
import {ComponentBase} from '@vmsl/core/component-base';
import {AuthService} from '@vmsl/core/auth/auth.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {
  UserVisibility,
  VisibilityStatus,
} from '@vmsl/core/enums/user-presence.enum';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {PubNubAngular} from 'pubnub-angular2';
import {EmailLoopModel} from '../../../main/mailbox/shared/models/email-loop.model';
import {Router} from '@angular/router';
import {CommonService} from '@vmsl/shared/facades/common.service';

@Component({
  selector: 'vmsl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent extends ComponentBase {
  newNotification = false;
  isHeaderDropdown = false;
  isEmailDropdown = false;
  emailStack: EmailLoopModel[];
  user: UserInfo;
  status: NbComponentStatus;
  permissionKey = Permission;
  pubnubListnerObj;
  setNewMailNotificaiton = false;

  constructor(
    private readonly sidebarService: NbSidebarService,
    private readonly authService: AuthService,
    private readonly userFacade: UserFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly toastrService: ToastrService,
    private readonly pubnub: PubNubAngular,
    private readonly router: Router,
    private readonly commonService: CommonService,
  ) {
    super();
  }

  ngOnInit() {
    if (
      this.store.getUser().permissions.includes(Permission.ChangeUserVisibility)
    ) {
      this.userFacade.getUserVisibility().subscribe(res => {
        this.checkUserVisibility(res.userVisibility);
      });
    }
    this.userFacade.getUserById(this.store.getUser().id).subscribe(res => {
      this.user = res;
      this.store.setUserTimeZone(res['timeZone']);
      this.store.setCalSync(this.user.isCalSync);
    });
    this.userFacade.webNotificationObv.subscribe(resp => {
      if (resp) {
        this.newNotification = true;
      } else {
        this.newNotification = false;
      }
    });
    this.pubnubListner();
    this.commonService.unreadMailsObv.subscribe(resp => {
      if (this.setNewMailNotificaiton && !resp) {
        this.setNewMailNotificaiton = false;
      }
    });
  }

  pubnubListner() {
    this.pubnubListnerObj = {
      message: m => {
        const data = JSON.parse(m.message);
        if (data.status) {
          if (this.store.getUser().userTenantId === data.userTenantId) {
            this.status = VisibilityStatus[
              data.status.userVisibility
            ] as NbComponentStatus;
          }
        } else if (data.notificationType === 'INMAIL') {
          this.setNewMailNotificaiton = true;
        } else {
          //empty else condition.
        }
      },
      presence: p => {
        if (p.action === 'state-change' && this.store.getUser().id === p.uuid) {
          if (p.state.status === 'Busy') {
            this.status = 'danger';
          } else {
            this.userFacade.getUserVisibility().subscribe(res => {
              this.checkUserVisibility(res.userVisibility);
            });
          }
        }
      },
    };
    this.pubnub.addListener(this.pubnubListnerObj);
  }

  headerDropdownToggle() {
    this.isHeaderDropdown = !this.isHeaderDropdown;
  }

  getEmailById(emailId) {
    this.isEmailDropdown = false;
    if (window.location.pathname.includes('mail-view-loop')) {
      this.commonService.setEmailId(emailId);
    } else {
      this.router.navigate(['/main/mailbox/mail-view-loop/' + emailId], {
        queryParams: {mailType: 'inbox'},
      });
    }
  }

  getRecentMails() {
    this.setNewMailNotificaiton = false;
    if (!this.isEmailDropdown) {
      this.commonService.getMailsForHeaderNotifications().subscribe(resp => {
        this.emailStack = resp.threads;
      });
    }
    this.isEmailDropdown = !this.isEmailDropdown;
  }

  navigateToInbox() {
    this.isEmailDropdown = false;
    this.router.navigate(['/main/mailbox/inbox']);
  }

  toggle() {
    this.sidebarService.toggle(true);
  }

  logout() {
    this.authService.logout().subscribe();
  }

  copyReferralCode() {
    const referralInfo = `${window.location.origin}/hcp/register?referCode=${this.user.referralCode}`;
    const selBox1 = document.createElement('textarea');
    selBox1.style.position = 'fixed';
    selBox1.style.left = '0';
    selBox1.style.top = '0';
    selBox1.style.opacity = '0';
    selBox1.value = referralInfo;
    document.body.appendChild(selBox1);
    selBox1.focus();
    selBox1.select();
    if (document.execCommand('copy')) {
      this.toastrService.success('Referral URL copied on clipboard', null, {
        timeOut: environment.messageTimeout,
      });
    }
    document.body.removeChild(selBox1);
  }

  setOffline() {
    this.userFacade
      .markUserVisibility(UserVisibility.Offline)
      .subscribe(res => {
        this.checkUserVisibility(UserVisibility.Offline);
      });
  }

  setOnline() {
    this.userFacade.markUserVisibility(UserVisibility.Online).subscribe(res => {
      this.checkUserVisibility(UserVisibility.Online);
    });
  }

  setIncognito() {
    this.userFacade
      .markUserVisibility(UserVisibility.Incognito)
      .subscribe(res => {
        this.checkUserVisibility(UserVisibility.Incognito);
      });
  }

  checkUserVisibility(userVisibility: UserVisibility) {
    if (userVisibility === UserVisibility.Online) {
      this.status = 'success';
    }
    if (userVisibility === UserVisibility.Offline) {
      this.status = 'basic';
    }
    if (userVisibility === UserVisibility.Incognito) {
      this.status = 'warning';
    }
    this.pubnub.getState(
      {
        uuid: this.store.getUser().id,
        channels: [this.store.getUser().tenantId],
      },
      (status, response) => {
        if (
          response.channels[this.store.getUser().tenantId]?.status === 'Busy'
        ) {
          this.status = 'danger';
        }
      },
    );
  }
}
