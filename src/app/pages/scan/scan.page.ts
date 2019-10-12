import { Component, OnInit, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from 'ionic-angular'
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
//import { Native } from '../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

declare let appService: any;

@Component({
    selector: 'app-scan',
    templateUrl: './scan.page.html',
    styles: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {
    torchLightOn: boolean;
    isCameraShown: boolean = false;
    contentWasScanned: boolean = false;
    scannedText: string = "";
    scanSub: Subscription = null;

    constructor(public route: ActivatedRoute,
        private qrScanner: QRScanner,
        private platform: Platform,
        private ngZone: NgZone,
        private alertController: AlertController) {
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

                    this.runScannedContent(this.scannedText)
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

    /**
     * Executes the scanned content. If the content is recognized as a URL, we send a URL intent.
     * Otherwise, we send a "handlescannedcontent" intent so that user can pick an app to use this content
     * (ex: scanned content is a ELA address, so user may choose to open the wallet app to send ELA to this address)
     */
    runScannedContent(scannedContent: string) {
        try {
            new URL(scannedContent);

            console.log("Sending scanned content as a URL intent");
            appService.sendUrlIntent(scannedContent, ()=>{
                // URL intent sent
                console.log("Intent sent successfully")
                this.exitApp()
            }, (err)=>{
                console.error("Intent sending failed", err)
                this.ngZone.run(() => {
                    this.showNooneToHandleIntent()
                })
            })
        } catch (_) {
            // Content can't be parsed as a URL: fallback solution is to use it as raw content
            console.log("Sending scanned content as raw content to an handlescannedcontent intent action");
            appService.sendIntent("handlescannedcontent", {data: scannedContent}, ()=>{
                // Raw intent sent
                console.log("Intent sent successfully")
                this.exitApp()
            }, (err)=>{
                console.error("Intent sending failed", err)
                this.ngZone.run(() => {
                    this.showNooneToHandleIntent()
                })
            })
        }
    }

    async showNooneToHandleIntent() {
        let alert = await this.alertController.create({
          message: 'Sorry, no installed DApp can currently manage this QR code.',
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

        appService.close();
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
