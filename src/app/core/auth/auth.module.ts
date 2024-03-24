import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgxPermissionsModule } from "ngx-permissions";
import { AuthService } from "./auth.service";
import { StoreModule } from "../store/store.module";
import { Adapters } from "./adapters";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxPermissionsModule.forChild(),
    HttpClientModule,
    StoreModule
  ],
  exports: [StoreModule],
  providers: [AuthService, ...Adapters]
})
export class AuthModule {}
