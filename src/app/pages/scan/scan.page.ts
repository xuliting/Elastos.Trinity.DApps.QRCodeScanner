import { Component, OnInit, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular'
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
//import { Native } from '../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';

declare let appManager: AppManagerPlugin.AppManager;

export type ScanPageRouteParams = {
    fromIntent: boolean
}

@Component({
    selector: 'app-scan',
    templateUrl: './scan.page.html',
    styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {
    torchLightOn: boolean;
    isCameraShown: boolean = false;
    contentWasScanned: boolean = false;
    scannedText: string = "";
    scanSub: Subscription = null;
    fromIntentRequest: boolean = false;

    constructor(public route: ActivatedRoute,
        private qrScanner: QRScanner,
        private platform: Platform,
        private ngZone: NgZone,
        private appService: AppService,
        private alertController: AlertController) {

        this.route.queryParams.subscribe((params: any) => {
            console.log("params",params);
            this.fromIntentRequest = (params.fromIntent == "true");
        });
    }

    ngOnInit() {
        // Make sure everything is ready including plugins before starting the scanner
        this.platform.ready().then(() => {
            console.log("Platform is ready");
            this.startScanningProcess()
        });
    }

    /**
     * Toggle flash light on or off
     */
    toggleLight() {
        this.torchLightOn = !this.torchLightOn;

        if (!this.torchLightOn)
            this.qrScanner.disableLight();
        else
            this.qrScanner.enableLight();
    }

    showCamera() {
        // Make sure to make ion-app and ion-content transparent to see the camera preview
        window.document.querySelector('ion-app').classList.add('transparentBody')
        this.qrScanner.show();
        this.isCameraShown = true; // Will display controls
    }

    hideCamera() {
        if (!this.isCameraShown) return;

        window.document.querySelector('ion-app').classList.remove('transparentBody')
        this.qrScanner.hide();
        this.qrScanner.destroy();
        this.isCameraShown = false;
    }

    startScanningProcess() {
        this.qrScanner.prepare().then((status: QRScannerStatus) => {
            console.log("Scanner prepared")
            if (status.authorized) {
                // Camera permission was granted. Start scanning
                console.log("Scanner authorized")

                // Show camera preview
                console.log("Showing camera preview")
                this.showCamera()

                // Start scanning and listening to scan results
                this.scanSub = this.qrScanner.scan().subscribe((text: string) => {
                    console.log("Scanned data: ", text)
                    this.scannedText = text;

                    this.ngZone.run(() => {
                        this.contentWasScanned = true
                    });

                    this.hideCamera()
                    this.stopScanning()

                    // Either emit a new intent if the scanner app was opened manually, or
                    // send a intent resposne if this app was opened by a "scanqrcode" intent request.
                    if (!this.fromIntentRequest)
                        this.runScannedContent(this.scannedText)
                    else
                        this.returnScannedContentToIntentRequester(this.scannedText);
                });
                // Wait for user to scan something, then the observable callback will be called
            } else if (status.denied) {
                // Camera permission was permanently denied
                console.log("Access to QRScanner plugin was permanently denied")
            } else {
                // Permission was denied, but not permanently. You can ask for permission again at a later time.
                console.log("Access to QRScanner plugin is currently denied")
            }
        }).catch((e: any) => console.log('Unexpected error: ', e));
    }

    stopScanning() {
        if (this.scanSub) {
            this.scanSub.unsubscribe();
            this.scanSub = null;
        }
    }

    async returnScannedContentToIntentRequester(scannedContent: string) {
        await this.appService.sendScanQRCodeIntentResponse(scannedContent);
        this.exitApp()
    }

    /**
     * Executes the scanned content. If the content is recognized as a URL, we send a URL intent.
     * Otherwise, we send a "handlescannedcontent" intent so that user can pick an app to use this content
     * (ex: scanned content is a ELA address, so user may choose to open the wallet app to send ELA to this address)
     */
    runScannedContent(scannedContent: string) {
        try {
            new URL(scannedContent);

            // Special case - DID FORMAT CHECK - DIDs are considered as URLs by the URL class
            if (this.contentIsElastosDID(scannedContent)) {
                this.sendIntentAsRaw(scannedContent)
            }
            else {
                this.sendIntentAsUrl(scannedContent)
            }
        } catch (_) {
            // Content can't be parsed as a URL: fallback solution is to use it as raw content
            this.sendIntentAsRaw(scannedContent)
        }
    }

    sendIntentAsUrl(scannedContent: string) {
        console.log("Sending scanned content as a URL intent");
        appManager.sendUrlIntent(scannedContent, ()=>{
            // URL intent sent
            console.log("Intent sent successfully")
            this.exitApp()
        }, (err)=>{
            console.error("Intent sending failed", err)
            this.ngZone.run(() => {
                this.showNooneToHandleIntent()
            })
        })
    }

    sendIntentAsRaw(scannedContent: string) {
        let scanIntentAction: string = "";

        // Handle specific content types to redirect to a more appropriate action.
        // DID FORMAT CHECK
        if (this.contentIsElastosDID(scannedContent)) {
            // The scanned content seems to be a Elastos DID -> send this as a scanned "DID".
            scanIntentAction = "handlescannedcontent_did"
        }
        else {
            scanIntentAction = "handlescannedcontent"
        }

        console.log("Sending scanned content as raw content to an "+scanIntentAction+" intent action");
        appManager.sendIntent(scanIntentAction, {data: scannedContent}, {}, ()=>{
            // Raw intent sent
            console.log("Intent sent successfully as action '"+scanIntentAction+"'")
            this.exitApp()
        }, (err)=>{
            console.error("Intent sending failed", err)
            this.ngZone.run(() => {
                this.showNooneToHandleIntent()
            })
        })
    }

    contentIsElastosDID(scannedContent) {
        return (scannedContent.indexOf("did:elastos:") == 0);
    }

    async showNooneToHandleIntent() {
        let alert = await this.alertController.create({
          message: 'Sorry, no installed DApp can currently manage this QR code.',
          backdropDismiss: false,
          buttons: [
           {
              text: 'Ok',
              handler: () => {
                this.exitApp()
              }
            }
          ]
        })

        alert.present()
    }

    exitApp() {
        console.log("Exiting app")

        this.stopScanning();
        this.hideCamera();

        appManager.close();
    }

    /**
     * Leaving the page, do some cleanup.
     */
    ionViewWillLeave() {
        console.log("Scan view is leaving")
        this.stopScanning();
        this.hideCamera();
    }
}
