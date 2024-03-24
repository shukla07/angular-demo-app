import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VmslGridModule} from './vmsl-grid/vmsl-grid.module';
import 'ag-grid-community';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {HeaderComponent} from './components/header/header.component';
import {PasswordComponent} from './components/password/password.component';
import {ToastrModule} from 'ngx-toastr';
import {RouterModule} from '@angular/router';
import {NgxPermissionsModule} from 'ngx-permissions';
import {UserFacadeService} from './facades/user-facade.service';
import {UserListAdapter} from './adapters/user-list-adapter.service';
import {AddUserAdapter} from './adapters/user-adapter.service';
import {TeamsFacadeService} from './facades/teams-facade.service';
import {TeamsSettingsAdapter} from './adapters/team-settings-adapter.service';
import {AddEditTeamAdapter} from './adapters/add-edit-team-adapter.service';
import {ContactListAdapter} from './adapters/contact-list-adapter.service';
import {TeamQueueAdapter} from './adapters/queue-adapter.service';
import {TeamsListAdapter} from '../main/teams-management/shared/adapters/teams-list-adapter.service';
import {FooterComponent} from './components/footer/footer.component';
import {AzureMsalFacadeService} from './facades/azure-msal-facade.service';
import {PubnubService} from './facades/pubnub.service';
import {ScheduleTeamMeetingAdapter} from './adapters/schedule-team-meeting-adapter.service';
import {ScheduleQueueAdapter} from './adapters/schedule-queue-adapter.service';
import {GetAzureTenantConfigAdapter} from '../main/profile/shared/adapters/get-azure-tenant-config-adapter.service';
import {ColumnSortingHeaderComponent} from './components/column-sorting-header/column-sorting-header.component';
import {TherapeuticAreasService} from './facades/therapeutic-areas.service';
import {TerritoryManagementService} from './facades/territory-management.service';
import {DiseaseAreasService} from './facades/disease-areas.service';
import {TherapeuticAreasAdapter} from './adapters/therapeutic-areas-adapter.service';
import {DiseaseAreasAdapter} from './adapters/disease-areas-adapter.service';
import {TerritoriesAdapter} from './adapters/territories-adapter.service';
import {ProfileAccessRulesComponent} from './components/profile-access-rules/profile-access-rules.component';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {GetInboxMailsAdapter} from './adapters/get-inbox-mails-adapter.service';
import {CommonService} from './facades/common.service';
import {ContentManagementService} from './facades/content-management.service';
import {ContentAdapter} from './adapters/content-adapter.service';
import {ContentPopupComponent} from './components/content-popup/content-popup.component';
import {TeamsManagementService} from '../main/teams-management/shared/teams-management.service';
import {NgxPaginationModule} from 'ngx-pagination';
@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PasswordComponent,
    ColumnSortingHeaderComponent,
    ProfileAccessRulesComponent,
    ContentPopupComponent,
  ],
  imports: [
    CommonModule,
    VmslGridModule,
    RouterModule,
    ThemeModule.forRoot(),
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
    NgxPermissionsModule.forChild(),
    FilterPipeModule,
    NgxPaginationModule,
  ],
  providers: [
    UserFacadeService,
    PubnubService,
    UserListAdapter,
    AddUserAdapter,
    TeamsFacadeService,
    TeamsSettingsAdapter,
    AddEditTeamAdapter,
    ContactListAdapter,
    TeamQueueAdapter,
    TeamsListAdapter,
    ScheduleTeamMeetingAdapter,
    ScheduleQueueAdapter,
    GetAzureTenantConfigAdapter,
    AzureMsalFacadeService,
    TherapeuticAreasService,
    TerritoryManagementService,
    DiseaseAreasService,
    TerritoriesAdapter,
    TherapeuticAreasAdapter,
    DiseaseAreasAdapter,
    GetInboxMailsAdapter,
    CommonService,
    ContentAdapter,
    ContentManagementService,
    TeamsManagementService,
  ],
  exports: [
    VmslGridModule,
    HeaderComponent,
    FooterComponent,
    PasswordComponent,
    ProfileAccessRulesComponent,
    ContentPopupComponent,
  ],
})
export class SharedModule {}
