import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { ModalController, AngularDelegate } from '@ionic/angular';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { MyApp } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ComponentsModule } from './components/components.module';
import { ScanPageModule } from './pages/scan/scan.module';

import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://352d312bc39c4f56b6ca26dca76b9be0@sentry.io/1875732"
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}

  handleError(error) {
    console.error("Globally catched exception:", error);

    console.log(document.URL);
    // Only send reports to sentry if we are not debugging.
    if (document.URL.includes('localhost')) { // Prod builds or --nodebug CLI builds use "http://localhost"
      Sentry.captureException(error.originalError || error);
    }
  }
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    ScanPageModule,
    IonicModule.forRoot(),
  ],
  exports: [],
  bootstrap: [MyApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    QRScanner,
    ModalController,
    AngularDelegate,
    Platform,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: ErrorHandler, useClass: SentryErrorHandler}
  ]
})
export class AppModule {}
