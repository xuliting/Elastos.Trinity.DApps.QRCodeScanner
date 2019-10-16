import { NgModule, ErrorHandler } from '@angular/core';
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
    {provide: ErrorHandler, useClass: ErrorHandler}
  ]
})
export class AppModule {}
