import {
  Component,
  ViewEncapsulation,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {NotificationsListingFacadeService} from './shared/facades/notifications-listing-facade.service';
import {NotificationsHistory} from './shared/models/notifications-list.model';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {CalendarService} from '../calendar/calendar.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {NbDialogRef, NbDialogModule, NbDialogService} from '@nebular/theme';
import * as moment from 'moment';

@Component({
  selector: 'vmsl-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationsListComponent extends RouteComponentBase {
  notificationsData: NotificationsHistory[];
  p1 = 1;
  title = 'Notifications';
  eventDuration: number;
  filter = {
    newTime: '',
  };
  proposeNewTimeRef: NbDialogRef<NbDialogModule>;
  event: Object;
  @ViewChild('proposeNewTime', {read: TemplateRef})
  proposeNewTime: TemplateRef<NbDialogModule>;

  constructor(
    private readonly calendarService: CalendarService,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly notificationsListService: NotificationsListingFacadeService,
    private readonly userFacade: UserFacadeService,
    private readonly tostr: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getNotificationsList();
    this.userFacade.setWebNotification(null);
  }

  onRsvpChange(notification, status) {
    notification.response = status;
    this.calendarService
      .sendRsvpResponse(notification, notification.eventId)
      .subscribe(res => {
        this.getNotificationsList();
        this.tostr.success('Your RSVP response has been sent successfully.', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
      });
  }

  getEventAttendees(notification, status) {
    this.calendarService.getEventById(notification.eventId).subscribe(res => {
      if (res.length) {
        res[0].attendees.forEach(attendee => {
          if (attendee.id === this.store.getUser().id) {
            notification.attendeeId = attendee.attendeeId;
          }
        });
      } else {
        this.notificationsListService
          .updateNotification(notification.notificationId)
          .subscribe(resp => {
            if (resp['success']) {
              this.tostr.error(
                `You can't respond to this event, since you have already been removed from this event.`,
                'ATTENTION',
                {
                  timeOut: environment.messageTimeout,
                },
              );
              this.getNotificationsList();
            }
          });
        return;
      }
      if (status === 'newTime') {
        this.proposeNewTimeForEvent(notification);
      } else {
        this.onRsvpChange(notification, status);
      }
    });
  }

  proposeNewTimeForEvent(notification) {
    this.calendarService
      .proposeNewTime(
        this.filter.newTime,
        notification.eventId,
        notification.attendeeId,
      )
      .subscribe(res => {
        this.tostr.success('New time proposed successfully', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
      });
    this.proposeNewTimeRef.close();
  }

  respondToNewProposedTime(notificationData, accepted) {
    if (accepted) {
      this.calendarService
        .getEventByItsId(notificationData.eventId)
        .subscribe(resp => {
          this.event = resp;
          const start = moment(resp['startDateTime']);
          const end = moment(resp['endDateTime']);
          const newStart = moment(new Date(notificationData.proposedTimeExact),'MM/DD/YYYY h:mm:ss A').format();
          const newEnd = moment(newStart)
            .add(moment.duration(end.diff(start)).asHours(), 'h')
            .toISOString();
          this.calendarService
            .updateEvent(
              {startTime: newStart, endTime: newEnd},
              notificationData.eventId,
            )
            .subscribe(res => {
              this.changeNotificationStatus(
                notificationData.notificationId,
                accepted,
              );
              this.tostr.success(
                'New Proposed Time accepted successfully.',
                'SUCCESS',
                {
                  timeOut: environment.messageTimeout,
                },
              );
            });
        });
    } else {
      this.changeNotificationStatus(notificationData.notificationId, accepted);
    }
  }

  changeNotificationStatus(notificationId, accepted) {
    this._subscriptions.push(
      this.notificationsListService
        .updateNotification(notificationId)
        .subscribe(resp => {
          if (resp['success']) {
            this.tostr.success(
              `The new proposed time has been ${
                accepted ? 'accepted' : 'declined'
              } successfully.`,
              'SUCCESS',
            );
            this.getNotificationsList();
          }
        }),
    );
  }

  openNewTimePopup(notificationData) {
    this.proposeNewTimeRef = this.dialogService.open(this.proposeNewTime, {
      closeOnBackdropClick: false,
      context: notificationData,
    });
  }

  closeNewTimePopup() {
    this.filter.newTime = null;
    this.proposeNewTimeRef.close();
  }

  getNotificationsList() {
    this._subscriptions.push(
      this.notificationsListService
        .getNotificationsHistory()
        .subscribe(resp => {
          if (resp.length > 0) {
            this.notificationsData = resp;
          } else {
            this.tostr.info('You have no new Notifications.', 'ATTENTION', {
              timeOut: environment.messageTimeout,
            });
          }
        }),
    );
  }

  refreshNotifications() {
    this.getNotificationsList();
    this.p1 = 1;
    this.userFacade.setWebNotification(null);
  }
}
