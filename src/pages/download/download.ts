import { Component } from '@angular/core';

import { Platform, ToastController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FileEntry } from '@ionic-native/file';

import { FileUtility } from '../../utilities/FileUtility';
import { XMLUtility } from '../../utilities/XMLUtility';
import { FileName } from '../viewFiles/viewFiles';

@Component({
  selector: 'page-download',
  templateUrl: 'download.html'
})
export class DownloadPage {

  url: string = "";
  fileName: string = "";
  downloading: boolean = false;

  constructor(public platform: Platform, public storage: Storage, public fileUtil: FileUtility, public xmlUtil: XMLUtility, public toastCtrl: ToastController) { }

  download() {
    this.downloading = true;
    let name = this.fileName;
    if (!this.fileName.endsWith(".xml"))
      name += ".xml";

    let url: string = this.url;
    if (!url.match(/https?:\/\/.*/))
      url = "http://" + url;
    // downloads the file to a temp directory to check if it is valid
    this.fileUtil.downloadFile(url, name, true).subscribe((file: FileEntry) => {
      this.xmlUtil.checkFileValidity(file, true).subscribe((result: string) => {
        if (result === "Aliquot") {
          let path = "chroni/Aliquots/" + name;
          this.fileUtil.moveFile(name, path, true).subscribe(
            (newFile: FileEntry) => {
              this.displayToast(newFile.name + " has been successfully downloaded to the Aliquots directory");
              this.downloading = false;
              this.url = "";
              this.fileName = "";
            }, (error) => {
              this.displayToast("ERROR: " + name + " could not be downloaded to the Aliquots directory");
              this.downloading = false;
              this.fileUtil.removeFile(name, true);
            });
        } else if (result === "Report Settings") {
          let path = "chroni/Report Settings/" + name;
          this.fileUtil.moveFile(name, path, true).subscribe(
            (newFile: FileEntry) => {
              this.displayToast(name + " has been successfully downloaded to the Report Settings directory");
              this.downloading = false;
              this.url = "";
              this.fileName = "";
            }, (error) => {
              this.displayToast("ERROR: " + name + " could not be downloaded to the Report Settings directory");
              this.downloading = false;
              this.fileUtil.removeFile(name, true);
            });
        } else {
          this.displayToast("ERROR: the file specified is not a valid Aliquot or Report Settings XML file");
          this.downloading = false;
          this.fileUtil.removeFile(name, true);
        }
      }, (error) => {
        this.displayToast("ERROR: the file specified is not a valid Aliquot or Report Settings XML file");
        this.downloading = false;
        this.fileUtil.removeFile(name, true);
      });
    }, (error) => {
      this.displayToast("ERROR: invalid URL");
      this.downloading = false;
      this.fileUtil.removeFile(name, true);
    });
  }

  displayToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }

}
