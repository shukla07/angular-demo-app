import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "./api.service";
import { Adapters } from "./adapters";

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [ApiService, ...Adapters]
})
export class ApiModule {}
