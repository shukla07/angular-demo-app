import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OpentokService} from './opentok.service';
import {PublisherComponent} from './publisher/publisher.component';
import {SubscriberComponent} from './subscriber/subscriber.component';
import {OpentokComponent} from './opentokApp.component';
import {OpentokRoutingModule} from './opentok-routing.module';

@NgModule({
  declarations: [OpentokComponent, PublisherComponent, SubscriberComponent],
  imports: [CommonModule, OpentokRoutingModule],
  providers: [OpentokService],
})
export class OpentokModule {}
