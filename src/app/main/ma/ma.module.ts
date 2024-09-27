import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaLinkComponent} from './ma-link/ma-link.component';
import {MARoutingModule} from './ma-routing.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {MaSearchAdapter} from './shared/adapters/ma-search-adapter.service';
import {MaCallingService} from './shared/ma-calling.service';
import {MaCallAdapter} from './shared/adapters/ma-call-adapter.service';
import {MaCallActionAdapter} from './shared/adapters/ma-call-action-adapter.service';
import {PickMaCallAdapter} from './shared/adapters/ma-pick-call-adapter.service';
import {AllUserAdapter} from './shared/adapters/all-user-adapter.service';

@NgModule({
  declarations: [MaLinkComponent],
  imports: [
    CommonModule,
    MARoutingModule,
    ThemeModule.forRoot(),
    NgSelectModule,
  ],
  providers: [
    MaCallingService,
    MaSearchAdapter,
    MaCallAdapter,
    MaCallActionAdapter,
    PickMaCallAdapter,
    AllUserAdapter,
  ],
})
export class MAModule {}
