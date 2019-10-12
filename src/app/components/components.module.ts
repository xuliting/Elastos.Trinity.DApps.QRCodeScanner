import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HeaderBarComponent } from './header-bar/header-bar.component';


@NgModule({
  declarations: [HeaderBarComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [HeaderBarComponent],
  providers: [
  ],
  entryComponents: [],
  schemas:[CUSTOM_ELEMENTS_SCHEMA] // Needed to find ion-back-button, etc
})
export class ComponentsModule { }
