import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  videoUrl: SafeResourceUrl | null = null;
  isRecording = false;

  constructor(private sanitizer: DomSanitizer) {}

  async recordVideo() {
    try {
      this.isRecording = true;
      
      // Request camera permissions and capture video
      const video = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        // Note: Capacitor Camera plugin primarily handles photos
        // For proper video recording, consider using @capacitor-community/media plugin
      });

      if (video.webPath) {
        // Sanitize and set the video URL
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(video.webPath);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      alert('Failed to record video. Please ensure camera permissions are granted.');
    } finally {
      this.isRecording = false;
    }
  }

  clearVideo() {
    this.videoUrl = null;
  }
}
