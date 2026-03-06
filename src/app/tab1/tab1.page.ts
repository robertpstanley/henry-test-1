import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  loading = true;
  error = '';
  watchId: string | number | undefined;

  constructor() {}

  async ngOnInit() {
    // Wait a bit for the view to initialize
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    if (this.watchId) {
      if (Capacitor.isNativePlatform()) {
        Geolocation.clearWatch({ id: this.watchId as string });
      } else {
        navigator.geolocation.clearWatch(this.watchId as number);
      }
    }
  }

  async initMap() {
    try {
      let lat: number;
      let lng: number;

      // Check if running on native platform or web
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Geolocation for native platforms
        const permission = await Geolocation.checkPermissions();
        
        if (permission.location !== 'granted') {
          const request = await Geolocation.requestPermissions();
          if (request.location !== 'granted') {
            this.error = 'Location permission denied';
            this.loading = false;
            return;
          }
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } else {
        // Use browser's native Geolocation API for web
        if (!navigator.geolocation) {
          this.error = 'Geolocation is not supported by your browser';
          this.loading = false;
          return;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      // Initialize the map
      this.map = L.map('map').setView([lat, lng], 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      // Fix for default marker icon issue with Leaflet + webpack
      const iconRetinaUrl = 'assets/marker-icon-2x.png';
      const iconUrl = 'assets/marker-icon.png';
      const shadowUrl = 'assets/marker-shadow.png';
      const iconDefault = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = iconDefault;

      // Add marker for current location
      this.marker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup('You are here!')
        .openPopup();

      // Fix map tile loading issue - invalidate size after a short delay
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);

      this.loading = false;

      // Watch position for updates
      this.watchPosition();
    } catch (error: any) {
      console.error('Error getting location:', error);
      this.error = error.message || 'Failed to get location. Please enable location services.';
      this.loading = false;
    }
  }

  async watchPosition() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor for native platforms
        this.watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
          },
          (position, err) => {
            if (err) {
              console.error('Watch position error:', err);
              return;
            }

            if (position && this.map && this.marker) {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              this.marker.setLatLng([lat, lng]);
            }
          }
        );
      } else {
        // Use browser's native Geolocation API for web
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (this.map && this.marker) {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              this.marker.setLatLng([lat, lng]);
            }
          },
          (error) => {
            console.error('Watch position error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    } catch (error) {
      console.error('Error setting up position watch:', error);
    }
  }
}

// Made with Bob
