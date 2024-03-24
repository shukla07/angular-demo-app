import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TerritoriesManagementRoutingModule} from './territories-management-routing.module';
import {TerritoriesManagementComponent} from './territories-management.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {NgxPermissionsModule} from 'ngx-permissions';
import {VmslGridModule} from '@vmsl/shared/vmsl-grid/vmsl-grid.module';
import {TerritoriesAdapter} from '../../shared/adapters/territories-adapter.service';
import {TerritoriesManagementActionIconComponent} from './territories-management-action-icon/territories-management-action-icon.component';
import {CreateTerritoryComponent} from './create-territory/create-territory.component';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';

@NgModule({
  declarations: [
    TerritoriesManagementComponent,
    TerritoriesManagementActionIconComponent,
    CreateTerritoryComponent,
  ],
  imports: [
    CommonModule,
    TerritoriesManagementRoutingModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    NgxPermissionsModule.forChild(),
    VmslGridModule,
  ],
  providers: [TerritoryManagementService, TerritoriesAdapter],
})
export class TerritoriesManagementModule {}
