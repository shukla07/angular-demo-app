import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TeamsManagementRoutingModule} from './teams-management-routing.module';
import {TeamsManagementComponent} from './teams-management.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NbDialogModule} from '@nebular/theme';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {NgxMatIntlTelInputModule} from 'ngx-mat-intl-tel-input';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgxPaginationModule} from 'ngx-pagination';
import {SharedModule} from '@vmsl/shared/shared.module';
import {TeamsListAdapter} from './shared/adapters/teams-list-adapter.service';
import {TeamsAvailabilityDaysComponent} from './teams-availability-days/teams-availability-days.component';
import {TeamsActionIconsComponent} from './teams-action-icons/teams-action-icons.component';
import {CreateTeamComponent} from './create-team/create-team.component';
import {TeamProfileComponent} from './team-profile/team-profile.component';
import {FlatpickrModule} from 'angularx-flatpickr';
import {TeamsManagementService} from './shared/teams-management.service';
import {TeamsListHeaderComponent} from './teams-list-header/teams-list-header.component';

@NgModule({
  declarations: [
    TeamsManagementComponent,
    TeamsAvailabilityDaysComponent,
    TeamsActionIconsComponent,
    CreateTeamComponent,
    TeamProfileComponent,
    TeamsListHeaderComponent,
  ],
  imports: [
    CommonModule,
    TeamsManagementRoutingModule,
    ThemeModule.forRoot(),
    NbDialogModule.forChild(),
    NgxDropzoneModule,
    NgxMatIntlTelInputModule,
    NgxPermissionsModule.forChild(),
    NgxPaginationModule,
    SharedModule,
    FlatpickrModule.forRoot(),
  ],
  providers: [TeamsManagementService, TeamsListAdapter],
})
export class TeamsManagementModule {}
