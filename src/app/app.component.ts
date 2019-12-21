import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
//import { StatusBar } from '@ionic-native/status-bar';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { ScanPage } from './pages/scan/scan.page';
import { AppService } from './app.service';

@Component({
  selector: 'my-app',
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = ScanPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private appService: AppService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
