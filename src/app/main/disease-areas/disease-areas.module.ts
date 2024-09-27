import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DiseaseAreasRoutingModule} from './disease-areas-routing.module';
import {DiseaseAreasComponent} from './disease-areas.component';
import {DiseaseAreasActionIconComponent} from './disease-areas-action-icon/disease-areas-action-icon.component';
import {SharedModule} from '@vmsl/shared/shared.module';
import {VmslGridModule} from '@vmsl/shared/vmsl-grid/vmsl-grid.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {NgxPermissionsModule} from 'ngx-permissions';
import {DiseaseAreasAdapter} from '../../shared/adapters/disease-areas-adapter.service';
import {CreateDiseaseAreaComponent} from './create-disease-area/create-disease-area.component';
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';

@NgModule({
  declarations: [
    DiseaseAreasComponent,
    DiseaseAreasActionIconComponent,
    CreateDiseaseAreaComponent,
  ],
  imports: [
    CommonModule,
    DiseaseAreasRoutingModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    NgxPermissionsModule.forChild(),
    VmslGridModule,
    SharedModule,
  ],
  providers: [DiseaseAreasService, DiseaseAreasAdapter],
})
export class DiseaseAreasModule {}
