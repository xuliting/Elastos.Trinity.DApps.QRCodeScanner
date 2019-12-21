import { Injectable } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ScanPageRouteParams } from './pages/scan/scan.page';

declare let appManager: AppManagerPlugin.AppManager;

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private intentRequest: AppManagerPlugin.ReceivedIntent;

    constructor(private platform: Platform, private navCtrl: NavController, private router: Router) {
        this.init();
    }

    private async init() {
        await this.platform.ready();

        console.log("Checking if there are pending intents");
        appManager.hasPendingIntent((hasPendingIntent: boolean)=>{
            if (hasPendingIntent) {
                // Do nothing, the intent listener will show the appropriate screen.
                console.log("There are some pending intents.");
            }
            else {
                console.log("No pending intent.");

                // No intent was received at boot. So we go through the regular screens.
                this.showScanScreen(false);
            }
        }, (err: string)=>{
            console.error(err);

            // Error while checking - fallback to default behaviour
            this.showScanScreen(false);
        });

        if (this.platform.platforms().indexOf("cordova") >= 0) {
            // Listen to incoming intent events.
            appManager.setIntentListener((intent: AppManagerPlugin.ReceivedIntent)=>{
                console.log("received intent ", intent);

                // Remember the received intent for later use
                this.intentRequest = intent;

                // Show the scan screen
                this.showScanScreen(true);
            });
        }
    }

    private showScanScreen(fromIntentRequest: boolean) {
        this.navCtrl.setDirection('root');

        let queryParams = {
            fromIntent: fromIntentRequest
        };
        this.router.navigate(["/scan"], {
            queryParams: queryParams
        });
    }

    public sendScanQRCodeIntentResponse(scannedContent: string): Promise<void> {
        console.log("Sending scanqrcode intent response");
        
        return new Promise((resolve, reject)=>{
            appManager.sendIntentResponse("scanqrcode", {
                scannedContent: scannedContent
            }, this.intentRequest.intentId, (response)=>{
                resolve();
            }, (err: any)=>{
                reject();
            });
        });   
    }
}
