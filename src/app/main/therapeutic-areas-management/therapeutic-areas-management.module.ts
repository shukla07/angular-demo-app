import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TherapeuticAreasManagementRoutingModule} from './therapeutic-areas-management-routing.module';
import {CreateTherapeuticAreaComponent} from './create-therapeutic-area/create-therapeutic-area.component';
import {TherapeuticAreasActionIconComponent} from './therapeutic-areas-action-icon/therapeutic-areas-action-icon.component';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgxPaginationModule} from 'ngx-pagination';
import {TherapeuticAreasAdapter} from '../../shared/adapters/therapeutic-areas-adapter.service';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SharedModule} from '@vmsl/shared/shared.module';
import {TherapeuticAreasManagementComponent} from './therapeutic-areas-management.component';
import {TherapeuticAreasService} from '@vmsl/shared/facades/therapeutic-areas.service';

@NgModule({
  declarations: [
    TherapeuticAreasManagementComponent,
    TherapeuticAreasActionIconComponent,
    CreateTherapeuticAreaComponent,
  ],
  imports: [
    CommonModule,
    TherapeuticAreasManagementRoutingModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    NgxPermissionsModule.forChild(),
    SharedModule,
  ],
  providers: [TherapeuticAreasService, TherapeuticAreasAdapter],
})
export class TherapeuticAreasManagementModule {}
