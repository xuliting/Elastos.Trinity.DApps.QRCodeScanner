import { Component, ViewChild } from '@angular/core';
import { Platform, IonRouterOutlet } from '@ionic/angular';
//import { StatusBar } from '@ionic-native/status-bar';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { ScanPage } from './pages/scan/scan.page';
import { AppService } from './app.service';
import { Router } from '@angular/router';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'my-app',
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(IonRouterOutlet, {static: true}) routerOutlet: IonRouterOutlet;
  rootPage:any = ScanPage;

  constructor(
    private platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private appService: AppService,
    private router: Router) {
      
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.setupBackKeyNavigation();

      this.router.navigate(["scan"]);
    });
  }

  /**
   * Listen to back key events. If the default router can go back, just go back.
   * Otherwise, exit the application.
   */
  setupBackKeyNavigation() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.routerOutlet.pop();
      } else {
        appManager.close();
      }
    });
  }
}
