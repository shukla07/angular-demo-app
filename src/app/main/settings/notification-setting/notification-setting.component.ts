import {Component} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {FormBuilder, FormGroup, FormArray, FormControl} from '@angular/forms';
import {NotificationFacadeService} from '../shared/facade/notification-facade.service';
import {Notification} from '../shared/models/notification.model';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';

@Component({
  selector: 'vsml-notification-setting',
  templateUrl: './notification-setting.component.html',
  styleUrls: ['./notification-setting.component.scss'],
})
export class NotificationSettingComponent extends RouteComponentBase {
  form = new FormGroup({});

  formTemplate: Notification[];
  notificationType = ['webNotification', 'sms', 'email'];
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly fb: FormBuilder,
    private readonly notificationFacade: NotificationFacadeService,
    private readonly toastrService: ToastrService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFormTemplate();
  }

  getFormTemplate() {
    const array = new FormArray([]);
    this.notificationFacade.getNotificationTemplate().subscribe(res => {
      this.formTemplate = res;
      res.forEach(ele => {
        const group = new FormGroup({});
        group.addControl(
          ele.id,
          this.fb.array([
            new FormControl({
              value: ele.userDefaultWebNotification,
              disabled: !ele.webNotification,
            }),
            new FormControl({value: ele.userDefaultSms, disabled: !ele.sms}),
            new FormControl({
              value: ele.userDefaultEmail,
              disabled: !ele.email,
            }),
          ]),
        );
        array.push(group);
      });
      this.form.addControl('notifications', array);
      this.getUserNotifications();
    });
  }

  getUserNotifications() {
    this.notificationFacade.getUserNotifications().subscribe(res => {
      res.forEach(noti => {
        const notification = this.form.get('notifications')['controls'];
        for (const item in notification) {
          const index = parseInt(item);
          if (notification[index].get(noti['notificationListingId'])) {
            notification[index]
              .get(noti['notificationListingId'])
              .setValue([noti.webNotification, noti.sms, noti.email]);
          }
        }
      });
    });
  }

  onSubmit() {
    const two = 2;
    const NotificationArray: Notification[] = [];
    const formRawData = this.form.getRawValue();
    formRawData.notifications.forEach(element => {
      const notification = new Notification();
      const notificationId = Object.keys(element)[0];
      notification.notificationListingId = notificationId;
      notification.webNotification = element[notificationId][0];
      notification.sms = element[notificationId][1];
      notification.email = element[notificationId][two]
        ? element[notificationId][two]
        : false;
      NotificationArray.push(notification);
    });

    this.notificationFacade
      .saveUserNotifications(NotificationArray)
      .subscribe(res => {
        this.toastrService.success(
          'Notifications settings saved successfully.',
          'SUCCESS',
          {
            timeOut: environment.messageTimeout,
          },
        );
      });
  }

  onCancel() {
    window.location.reload();
  }
}
