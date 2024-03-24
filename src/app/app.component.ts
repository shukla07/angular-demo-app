import {Component} from '@angular/core';
import {NbIconLibraries} from '@nebular/theme';
import * as FullStory from '@fullstory/browser';

import {FontPack} from './core/enums';
import {environment} from '@vmsl/env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'kyodome';

  constructor(private readonly iconLibraries: NbIconLibraries) {
    this.iconLibraries.registerFontPack(FontPack.FontAwesomeSolid, {
      packClass: 'fas',
      iconClassPrefix: 'fa',
    });
    this.iconLibraries.registerFontPack(FontPack.FontAwesomeRegular, {
      packClass: 'far',
      iconClassPrefix: 'fa',
    });
    if (environment.orgId) {
      FullStory.init({
        orgId: environment.orgId,
        debug: environment.debug,
        namespace: environment.namespace,
        recordCrossDomainIFrames: true,
        recordOnlyThisIFrame: false,
        devMode: !environment.production,
      });
    }
  }
}
