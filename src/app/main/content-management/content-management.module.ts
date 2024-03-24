import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ContentManagementRoutingModule} from './content-management-routing.module';
import {ContentManagementComponent} from './content-management.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgSelectModule} from '@ng-select/ng-select';
import {ContentAdapter} from '../../shared/adapters/content-adapter.service';
import {CreateContentComponent} from './create-content/create-content.component';
import {ContentManagementService} from '@vmsl/shared/facades/content-management.service';
import {ContentHeaderComponent} from './content-header/content-header.component';
import {SharedModule} from '@vmsl/shared/shared.module';
import {ViewContentComponent} from './view-content/view-content.component';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgxDropzoneModule} from 'ngx-dropzone';

@NgModule({
  declarations: [
    ContentManagementComponent,
    CreateContentComponent,
    ContentHeaderComponent,
    ViewContentComponent,
  ],
  imports: [
    CommonModule,
    ContentManagementRoutingModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    NgxPermissionsModule.forChild(),
    NgSelectModule,
    SharedModule,
    PdfViewerModule,
    NgxDropzoneModule,
  ],
  providers: [ContentManagementService, ContentAdapter],
})
export class ContentManagementModule {}
