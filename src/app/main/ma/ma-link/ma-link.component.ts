import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {
  NbDialogModule,
  NbDialogRef,
  NbDialogService,
  NbTabComponent,
} from '@nebular/theme';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {MALink} from './ma-link.model';
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';
import {TherapeuticAreasService} from '@vmsl/shared/facades/therapeutic-areas.service';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';
import {MaCallingService} from '../shared/ma-calling.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {NgSelectComponent} from '@ng-select/ng-select';
import {PubNubAngular} from 'pubnub-angular2';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {
  TeamAvailability,
  TeamInfo,
} from '../../teams-management/shared/models/team-info.model';
import * as moment from 'moment';
import {UserVisibility} from '@vmsl/core/enums/user-presence.enum';

@Component({
  selector: 'vmsl-ma-link',
  templateUrl: './ma-link.component.html',
  styleUrls: ['./ma-link.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MaLinkComponent extends RouteComponentBase {
  @ViewChild('territorySelect') territorySelect: NgSelectComponent;
  @ViewChild('daSelect') daSelect: NgSelectComponent;
  @ViewChild('taSelect') taSelect: NgSelectComponent;
  @ViewChild('jobTitle') jobTitle: NgSelectComponent;
  @ViewChild('teamSelect') teamSelect: NgSelectComponent;
  @ViewChild('userSelect') userSelect: NgSelectComponent;
  @ViewChild('missedCallDialog', {read: TemplateRef})
  missedCallDialog: TemplateRef<NbDialogModule>;
  diseaseArea = [];
  territory = [];
  therapeuticArea = [];
  callerList = [];
  maLink = new MALink();
  teams: TeamInfo[] = [];
  users: UserInfo[];
  connecting = false;
  pubnubListnerObj: Object;
  missedCallTimeout;
  activeUsers: UserInfo[] = [];
  activeTeams: TeamInfo[] = [];
  presetQuestion: Object[];
  jobTitles: Object[];
  missedCallDialogRef: NbDialogRef<NbDialogModule>;
  firstEventId: string;
  loadingTeams: boolean;
  userInfavsIds: string[];

  constructor(
    protected route: ActivatedRoute,
    protected location: Location,
    readonly dialogRef: NbDialogRef<MaLinkComponent>,
    private readonly diseaseAreaFacade: DiseaseAreasService,
    private readonly therapeuticAreaFacade: TherapeuticAreasService,
    private readonly territoryFacade: TerritoryManagementService,
    private readonly maFacade: MaCallingService,
    private readonly store: UserSessionStoreService,
    private readonly userFacade: UserFacadeService,
    private readonly pubnub: PubNubAngular,
    private readonly toasterService: ToastrService,
    private readonly dialogService: NbDialogService,
    private readonly userFacadeService: UserFacadeService,
  ) {
    super(route, location);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getDiseaseAreas();
    this.getTherapeuticAreas();
    this.getTerritories();
    this.getJobTitle();
    this.getPresetQuestion();
    this.pubnubListner();
  }

  pubnubListner() {
    this.pubnubListnerObj = {
      message: m => {
        const callData = JSON.parse(m.message);
        if (callData?.notificationType === 'MoD') {
          switch (callData.notificationData?.callStatus) {
            case 'PickedCall':
              this.store.removeCallTab();
              this.toasterService.success(
                `${callData.notificationData.picker.firstName} ${callData.notificationData.picker.lastName} has joined the meeting link`,
                'User Connected',
                {
                  timeOut: environment.messageTimeout,
                },
              );
              clearTimeout(this.missedCallTimeout);
              this.dialogRef.close();
              break;
            case 'MissedCall':
              this.store.removeCallTab();
              this.connecting = false;
              clearTimeout(this.missedCallTimeout);
              this.toasterService.info(
                'All user/users are busy',
                'Missed Call',
                {
                  timeOut: environment.messageTimeout,
                },
              );
              break;
            case 'DisconnectedCall':
              this.store.removeCallTab();
              this.connecting = false;
              clearTimeout(this.missedCallTimeout);
              if (callData.notificationData.from !== this.store.getUser().id) {
                this.toasterService.info(
                  callData.notificationData.message,
                  'Declined Call',
                  {
                    timeOut: environment.messageTimeout,
                  },
                );
              }
          }
        }
      },
    };
    this.pubnub.addListener(this.pubnubListnerObj);
  }

  getJobTitle() {
    this._subscriptions.push(
      this.userFacade.getJobTitles().subscribe(res => {
        this.jobTitles = res.filter(jobTitle => jobTitle.isModAllowed);
      }),
    );
  }

  getPresetQuestion() {
    this._subscriptions.push(
      this.maFacade.getPresetQuestion().subscribe(res => {
        this.presetQuestion = res;
      }),
    );
  }

  getDiseaseAreas() {
    this._subscriptions.push(
      this.diseaseAreaFacade.getDiseaseAreasFiltered().subscribe(res => {
        this.diseaseArea = res;
      }),
    );
  }
  getTherapeuticAreas() {
    this._subscriptions.push(
      this.therapeuticAreaFacade
        .getTherapeuticAreasFiltered()
        .subscribe(res => {
          this.therapeuticArea = res;
        }),
    );
  }
  getTerritories() {
    this._subscriptions.push(
      this.territoryFacade.getTerritoriesFiltered().subscribe(res => {
        this.territory = res;
      }),
    );
  }

  selectDiseaseArea(event) {
    if (event) {
      if (!this.maLink.diseaseArea.find(ele => event.id === ele.id)) {
        this.maLink.diseaseArea.push(event);
        this.maSearch();
      }
    }
    this.daSelect.handleClearClick();
    this.daSelect.blur();
  }

  selectTherapeuticArea(event) {
    if (event) {
      if (!this.maLink.therapeuticArea.find(ele => event.id === ele.id)) {
        this.maLink.therapeuticArea.push(event);
        this.maSearch();
      }
    }
    this.taSelect.handleClearClick();
    this.taSelect.blur();
  }

  selectTerritory(event) {
    if (event) {
      if (!this.maLink.territory.find(ele => event.id === ele.id)) {
        this.maLink.territory.push(event);
        this.maSearch();
      }
      this.territorySelect.handleClearClick();
      this.territorySelect.blur();
    }
  }

  selectJobTitle(event) {
    if (event) {
      if (!this.maLink.jobTitle.find(ele => event.id === ele.id)) {
        this.maLink.jobTitle.push(event);
        this.maSearch();
      }
      this.jobTitle.handleClearClick();
      this.jobTitle.blur();
    }
  }

  selectTeam(event) {
    if (event) {
      if (!this.callerList.find(ele => event.teamId === ele.teamId)) {
        this.callerList.push(event);
      }
    }
    this.teamSelect.handleClearClick();
    this.teamSelect.blur();
  }

  selectUser(event) {
    if (event) {
      if (!this.callerList.find(ele => event.id === ele.id)) {
        this.callerList.push(event);
      }
    }
    this.userSelect.handleClearClick();
    this.userSelect.blur();
  }

  emptyCallerList(tab: NbTabComponent) {
    this.callerList = [];
    this.maLink.territory = [];
    this.maLink.therapeuticArea = [];
    this.maLink.diseaseArea = [];
    this.maLink.jobTitle = [];
    this.maLink.totalFMD = null;
    this.maLink.activeFMD = null;
    this.maLink.activeFMDList = [];
    if (tab.tabTitle === 'Search Team') {
      this.maLink.isUserCall = false;
      this.getOnlineTeams();
    }
    if (tab.tabTitle === 'Search Individuals') {
      this.maLink.isTeamCall = false;
      this.getOnlineUsers();
    }
    if (tab.tabTitle === 'Global Search') {
      this.maLink.isTeamCall = false;
      this.maLink.isUserCall = false;
    }
  }

  getOnlineTeams() {
    this.loadingTeams = true;
    let teamChannels = [];
    this.activeTeams = [];
    this.maLink.isTeamCall = true;
    if (!this.teams.length) {
      this.maFacade.getAllTeams().subscribe(res => {
        this.teams = res;
        teamChannels = this.teams.map(ele => ele.teamId);
        this.getAvailableTeams(teamChannels);
      });
    } else {
      this.getAvailableTeams(teamChannels);
    }
  }

  getAvailableTeams(teamChannels) {
    this.pubnub.hereNow(
      {
        channels: teamChannels,
        includeState: true,
        includeUUIDs: true,
      },
      async (status, response) => {
        this.activeTeams = [];
        for (const ele of this.teams) {
          if (
            this.getAvailableTime(ele) &&
            response.channels[ele.teamId] &&
            ele.allowAdHocCalls &&
            (await this.checkMslAvailability(ele))
          ) {
            this.activeTeams = [...this.activeTeams, ele].sort((a, b) =>
              a.teamName.localeCompare(b.teamName),
            );
          }
        }
        this.loadingTeams = false;
      },
    );
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
          ele['uuid'] !== this.store.getUser().id &&
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
  getUserFavouritesIds() {
    this.userInfavsIds = [];
    this.userFacadeService.getUserFavourites().subscribe(resp => {
      this.userInfavsIds = resp.userInFav;
    });
  }
  getOnlineUsers() {
    const PRIVATE_MODE = 2;
    this.getUserFavouritesIds();
    this.maLink.isUserCall = true;
    const commonChannel = this.store.getUser().tenantId;
    this._subscriptions.push(
      this.maFacade.getAllUsers().subscribe(res => {
        this.users = res;
        this.activeUsers = [];
        this.pubnub.hereNow(
          {
            channels: [commonChannel],
            includeState: true,
            includeUUIDs: true,
          },
          (status, response) => {
            response.channels[commonChannel].occupants.forEach(ele => {
              for (const user of this.users) {
                if (
                  ele.uuid !== this.store.getUser().id &&
                  ele.uuid === user.id &&
                  (user.userVisibility === 1 ||
                    (user.userVisibility === PRIVATE_MODE &&
                      this.userInfavsIds.includes(user.userTenantId))) &&
                  ele.state?.status !== 'Busy'
                ) {
                  this.activeUsers = [...this.activeUsers, user].sort((a, b) =>
                    a.fullName.localeCompare(b.fullName),
                  );
                }
              }
            });
          },
        );
      }),
    );
  }

  removeDA(event) {
    this.callerList = [];
    this.maLink.diseaseArea = this.maLink.diseaseArea.filter(
      ele => event.id !== ele.id,
    );
    this.maSearch();
  }

  removeTA(event) {
    this.callerList = [];
    this.maLink.therapeuticArea = this.maLink.therapeuticArea.filter(
      ele => event.id !== ele.id,
    );
    this.maSearch();
  }

  removeTerritory(event) {
    this.callerList = [];
    this.maLink.territory = this.maLink.territory.filter(
      ele => event.id !== ele.id,
    );
    this.maSearch();
  }

  removejobTitle(event) {
    this.callerList = [];
    this.maLink.jobTitle = this.maLink.jobTitle.filter(
      ele => event.id !== ele.id,
    );
    this.maSearch();
  }

  removeCaller(event) {
    if (event.teamId) {
      this.callerList = this.callerList.filter(
        ele => event.teamId !== ele.teamId,
      );
    } else {
      this.callerList = this.callerList.filter(ele => event.id !== ele.id);
    }
  }

  maSearch() {
    if (
      this.maLink.diseaseArea.length ||
      this.maLink.therapeuticArea.length ||
      this.maLink.territory.length ||
      this.maLink.jobTitle.length
    ) {
      this._subscriptions.push(
        this.maFacade.maSearch(this.maLink).subscribe(res => {
          this.callerList = res.activeFMDList.map(ele => ele.id);
          this.maLink.totalFMD = res.totalFMD;
          this.maLink.activeFMD = res.activeFMD;
          this.maLink.activeFMDList = res.activeFMDList.map(ele => {
            const user = new UserInfo();
            user.id = ele.id;
            user.firstName = ele.firstName;
            user.lastName = ele.lastName;
            return user;
          });
        }),
      );
    } else {
      this.maLink.totalFMD = null;
      this.maLink.activeFMD = null;
      this.maLink.activeFMDList = [];
    }
  }

  makeCall() {
    const missCallDuration = 45000;
    this.maLink.selected = this.callerList;
    this._subscriptions.push(
      this.maFacade.makeCall(this.maLink).subscribe(res => {
        this.maLink.isVmslCall = res['onVmslCall'];
        this.connecting = true;
        this.maLink.linkedEventId = this.maLink.linkedEventId
          ? this.maLink.linkedEventId
          : res.eventId;
        this.maLink.eventId = res.eventId;
        this.missedCallTimeout = setTimeout(() => {
          this.missedCall();
        }, missCallDuration);
        if (!this.maLink.isVmslCall) {
          this.store.setCallTab(true);
        }
      }),
    );
  }

  retry() {
    this.missedCallDialogRef.close();
    this.connecting = true;
    this.makeCall();
  }

  disconnectCall() {
    this.store.removeCallTab();
    this._subscriptions.push(
      this.maFacade
        .disconnectMissedCall('disconnected', this.maLink)
        .subscribe(res => {
          this.connecting = false;
          clearTimeout(this.missedCallTimeout);
        }),
    );
  }

  missedCall() {
    this._subscriptions.push(
      this.maFacade
        .disconnectMissedCall('missed', this.maLink)
        .subscribe(res => {
          this.connecting = false;
          this.missedCallDialogRef = this.dialogService.open(
            this.missedCallDialog,
          );
        }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListnerObj);
    clearTimeout(this.missedCallTimeout);
    this.store.removeCallTab();
  }
}
