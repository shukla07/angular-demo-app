import {
  Component,
  ViewEncapsulation,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {TeamsFacadeService} from '../../shared/facades/teams-facade.service';
import {
  TeamAvailability,
  TeamInfo,
} from '../teams-management/shared/models/team-info.model';
import {NbDialogModule, NbDialogService, NbDialogRef} from '@nebular/theme';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {PubNubAngular} from 'pubnub-angular2';
import * as moment from 'moment';
import {PubnubService} from '@vmsl/shared/facades/pubnub.service';
import {timezones} from '../../../assets/array/timezones';
import {ChatFacadeService} from '../chat/shared/chat-facade.service';
import {UserVisibility} from '@vmsl/core/enums/user-presence.enum';

@Component({
  selector: 'vsml-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TeamsComponent extends RouteComponentBase {
  permissionKey = Permission;
  currentUserRoleType: string;
  teamFilter = {teamName: ''};
  availableTeams: TeamInfo[];
  unavailableTeams: TeamInfo[];
  teams: TeamInfo[];
  p1 = 1;
  p2 = 1;
  settingDialogRef: NbDialogRef<NbDialogModule>;
  profileDialogRef: NbDialogRef<NbDialogModule>;
  @ViewChild('teamSettingsDialog', {read: TemplateRef})
  teamSettingsDialog: TemplateRef<NbDialogModule>;
  @ViewChild('viewTeamsDialog', {read: TemplateRef})
  viewTeamsDialog: TemplateRef<NbDialogModule>;
  loading = false;
  isHcp = this.store.getUser().role === '7';
  getTeamsInLoop;
  timeZoneList = timezones;
  availabilityDays: string[];
  teamSettings: TeamInfo;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly store: UserSessionStoreService,
    private readonly teamsFacadeService: TeamsFacadeService,
    private readonly dialogService: NbDialogService,
    private readonly toastrService: ToastrService,
    private readonly pubnub: PubNubAngular,
    private readonly router: Router,
    private readonly pubnubService: PubnubService,
    private readonly chatFacade: ChatFacadeService,
  ) {
    super(route, location);
  }
  ngOnInit() {
    super.ngOnInit();
    this.currentUserRoleType = this.store.getUser().role;
    this.getTeams();
    if (this.isHcp) {
      this.getTeamsEveryMinute();
    }
  }

  getTeams() {
    const teamChannels = [];
    this._subscriptions.push(
      this.teamsFacadeService.getTeams(this.isHcp).subscribe(resp => {
        this.teams = resp;
        this.teams.forEach(ele => {
          teamChannels.push(ele.teamId);
        });
        if (this.isHcp) {
          this.getAvailableTeams(teamChannels);
        }
      }),
    );
  }

  getAvailableTeams(teamChannels) {
    this.pubnub.hereNow(
      {
        channels: teamChannels,
        includeState: true,
        includeUUIDs: true,
      },
      async (status, response) => {
        this.availableTeams = [];
        this.unavailableTeams = [];
        for (const ele of this.teams) {
          if (
            this.getAvailableTime(ele) &&
            response.channels[ele.teamId] &&
            ele.allowAdHocCalls &&
            (await this.checkMslAvailability(ele))
          ) {
            this.availableTeams.push(ele);
          } else {
            this.unavailableTeams.push(ele);
          }
        }
      },
    );
  }

  getTeamsEveryMinute() {
    const interval = 60000;
    this.getTeamsInLoop = setInterval(() => {
      this.getTeams();
    }, interval);
  }

  checkMslAvailability(team: TeamInfo) {
    const tempArray = [];
    return new Promise((resolve, rej) => {
      this.pubnub.hereNow(
        {
          channels: [this.store.getUser().tenantId],
          includeState: true,
          includeUUIDs: true,
        },
        (status, res) => {
          const onlineUsers =
            res.channels[this.store.getUser().tenantId].occupants;
          for (const element of team.availableMsls) {
            tempArray.push(
              this.getAvailabilityPromise(element, team, onlineUsers),
            );
          }
          return Promise.all(tempArray).then(value =>
            resolve(value.some(newStatus => Boolean(newStatus) === true)),
          );
        },
      );
    });
  }

  getAvailabilityPromise(
    element: Object,
    team: TeamInfo,
    onlineUsers: Array<Object>,
  ) {
    return new Promise((resolve, reject) => {
      for (const ele of onlineUsers) {
        if (
          ele['uuid'] === element['id'] &&
          element['visibility'] === UserVisibility.Online &&
          (!ele['state'] || ele['state'].status !== 'Busy')
        ) {
          team.online = true;
          return resolve(team.online);
        }
      }
      return resolve(team.online);
    });
  }

  getAvailableTime(team) {
    const format = 'HH:mm';
    const time = moment().tz(team.timeZone).format(format);
    const currentDay = moment.utc().format('dddd').toLowerCase();
    let day: Partial<TeamAvailability>;
    team.availability.forEach(teamDay => {
      if (teamDay.day === currentDay && teamDay.checked) {
        day = teamDay;
      }
    });
    if (!day) {
      return false;
    }
    const includesNextDay = moment(day.availableTill, 'h:mm A').isBefore(
      moment(day.availableFrom, 'h:mm A'),
    );
    if (includesNextDay) {
      if (
        moment(day.availableTill, 'h:mm A').format(format) <= time &&
        time <= moment(day.availableFrom, 'h:mm A').format(format)
      ) {
        return false;
      }
      return true;
    } else {
      if (
        moment(day.availableFrom, 'h:mm A').format(format) <= time &&
        time <= moment(day.availableTill, 'h:mm A').format(format)
      ) {
        return true;
      }
    }
    return false;
  }

  open(
    dialog: TemplateRef<NbDialogModule>,
    data: TeamInfo,
    teamSettingsDialog: boolean,
  ) {
    if (teamSettingsDialog) {
      this.teamSettings = Object.assign({}, data);
      this.settingDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: this.teamSettings,
      });
    } else if (this.store.getUser().role === '6') {
      this.profileDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: data,
      });
    } else {
      //empty else block
    }
  }

  saveTeamsSettings(teamData, form) {
    if (form.invalid) {
      return;
    }
    this.loading = true;
    this._subscriptions.push(
      this.teamsFacadeService.saveTeamsSettings(teamData).subscribe(resp => {
        if (resp['success']) {
          this.store.removeTeams();
          this.getTeams();
          this.settingDialogRef.close();
          this.loading = false;
          this.toastrService.success(
            'Team Settings have been updated',
            'SUCCESS',
            {
              timeOut: environment.messageTimeout,
            },
          );
        }
      }),
    );
  }

  onClickCancel() {
    this.settingDialogRef.close();
  }

  videoCall(team) {
    const timeout = 30000;
    if (this.store.getCallTab()) {
      this.toastrService.info(
        'You appear to be on a call. Please wait for 30 seconds and try again.',
        'ATTENTION',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else {
      this.store.setCallTab(true);
      setTimeout(() => {
        this.pubnubService.removeCallTabIfNotBusy();
      }, timeout);
      window.open(`/main/meeting?teamTo=${team.teamId}&meetingType=video`);
    }
  }

  openTeamsCalendar(team) {
    this.router.navigate([
      `/main/teams/teams-calendar/${team.teamId}/${team.teamName}`,
    ]);
  }

  audioCall(team) {
    const timeout = 30000;
    if (this.store.getCallTab()) {
      this.toastrService.info(
        'You appear to be on a call. Please wait for 30 seconds and try again.',
        'ATTENTION',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else {
      this.store.setCallTab(true);
      setTimeout(() => {
        this.pubnubService.removeCallTabIfNotBusy();
      }, timeout);
      window.open(`/main/meeting?teamTo=${team.teamId}&meetingType=audio`);
    }
  }

  ngOnDestroy() {
    clearInterval(this.getTeamsInLoop);
  }

  getNames(data: string[]) {
    const capitalizeDays = [];
    if (data) {
      data.forEach(day => {
        capitalizeDays.push(
          ` ${day[0].toUpperCase() + day.substr(1).toLowerCase()}`,
        );
      });
    }
    return capitalizeDays;
  }

  chat(team) {
    this.chatFacade.setChatId(team);
  }
}
