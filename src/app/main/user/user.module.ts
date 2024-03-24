import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserRoutingModule} from './user-routing.module';
import {UserComponent} from './users/user.component';
import {VmslGridModule} from '@vmsl/shared/vmsl-grid/vmsl-grid.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {AddUserComponent} from './add-user/add-user.component';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {NbDialogModule} from '@nebular/theme';
import {NgxMatIntlTelInputModule} from 'ngx-mat-intl-tel-input';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgxPaginationModule} from 'ngx-pagination';
import {SharedModule} from '@vmsl/shared/shared.module';
import {UserListHeaderComponent} from './user-list-header/user-list-header.component';

@NgModule({
  declarations: [UserComponent, AddUserComponent, UserListHeaderComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    VmslGridModule,
    ThemeModule.forRoot(),
    NbDialogModule.forChild(),
    NgxDropzoneModule,
    NgxMatIntlTelInputModule,
    NgxPermissionsModule.forChild(),
    NgxPaginationModule,
    SharedModule,
  ],
  providers: [],
})
export class UserModule {}
