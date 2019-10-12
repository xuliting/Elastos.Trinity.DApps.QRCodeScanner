import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { ModalController, AngularDelegate } from '@ionic/angular';
import { MyApp } from './app.component';

import { HeaderBarComponent } from './components/header-bar/header-bar.component';
import { ScanPage } from './pages/scan/scan.page';

import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

@NgModule({
  declarations: [
    MyApp,
    ScanPage,
    HeaderBarComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    RouterModule.forRoot([])
  ],
  exports: [
    HeaderBarComponent
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ScanPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    QRScanner,
    ModalController,
    AngularDelegate,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA] // Needed to find ion-back-button, etc
})
export class AppModule {}
