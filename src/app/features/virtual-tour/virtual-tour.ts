import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { GeofenceService } from '../../core/services/geofence.service';
import { GeofenceZone, GeoPoint, ParkArea } from '../../core/models/geofence.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-virtual-tour',
  imports: [CommonModule, FormsModule],
  templateUrl: './virtual-tour.html',
  styleUrl: './virtual-tour.scss',
})
export class VirtualTour implements OnInit, AfterViewInit {
  get parkAreas() {
    return this.dataService.getParkAreas()();
  }
  
  selectedZone: GeofenceZone | null = null;
  showGeofenceConfig = false;
  isGettingLocation = false;
  locationError: string | null = null;
  
  // Geofencing configuration
  centerLat: number = 0;
  centerLon: number = 0;
  areaWidth: number = 1000; // meters
  areaHeight: number = 1000; // meters
  divisionsX: number = 4;
  divisionsY: number = 4;
  radiusMeters: number = 0; // optional circular mode
  guestName: string = '';
  
  // Configuration steps
  configStep: 'location' | 'area' | 'divisions' = 'location';
  
  // Map center and bounds
  mapCenter: GeoPoint = { latitude: 0, longitude: 0 };
  mapBounds = {
    minLat: 0,
    maxLat: 0,
    minLon: 0,
    maxLon: 0
  };
  
  // Zones for visualization
  zones: GeofenceZone[] = [];

  // Leaflet map instance
  private map?: L.Map;
  
  constructor(
    private dataService: DataService,
    private geofenceService: GeofenceService
  ) {}

  ngOnInit() {
    // Load existing zones if any
    this.loadZones();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    if (this.map) {
      return;
    }

    // Default center if no coordinates yet (Mumbai)
    const lat = this.centerLat || 19.0760;
    const lon = this.centerLon || 72.8777;

    this.map = L.map('leafletMap', {
      center: [lat, lon],
      zoom: 14
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }


  adjustCoordinates(latDelta?: number, lonDelta?: number) {
    if (latDelta !== undefined) {
      this.centerLat += latDelta;
    }
    if (lonDelta !== undefined) {
      this.centerLon += lonDelta;
    }
    if (this.centerLat && this.centerLon) {
      this.mapCenter = { latitude: this.centerLat, longitude: this.centerLon };
    }
  }

  proceedToAreaStep() {
    if (!this.centerLat || !this.centerLon) {
      alert('Please get your current location or enter coordinates manually');
      return;
    }
    this.configStep = 'area';
  }

  proceedToDivisionsStep() {
    if (!this.areaWidth || !this.areaHeight || this.areaWidth < 100 || this.areaHeight < 100) {
      alert('Please enter valid area dimensions (minimum 100 meters)');
      return;
    }
    this.configStep = 'divisions';
  }

  backToLocationStep() {
    this.configStep = 'location';
  }

  backToAreaStep() {
    this.configStep = 'area';
  }

  loadZones() {
    const areas = this.parkAreas;
    if (areas.length > 0 && areas[0].zones.length > 0) {
      this.zones = areas[0].zones;
      if (this.zones.length > 0) {
        this.mapCenter = this.zones[0].center;
        this.calculateMapBounds();

        // Center Leaflet map on existing zones
        if (this.map) {
          this.map.setView(
            [this.mapCenter.latitude, this.mapCenter.longitude],
            this.map.getZoom() ?? 14
          );
        }
      }
    }
  }

  calculateMapBounds() {
    if (this.zones.length === 0) return;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    
    this.zones.forEach(zone => {
      zone.area.forEach(point => {
        minLat = Math.min(minLat, point.latitude);
        maxLat = Math.max(maxLat, point.latitude);
        minLon = Math.min(minLon, point.longitude);
        maxLon = Math.max(maxLon, point.longitude);
      });
    });
    
    // Add padding
    const padding = 0.001;
    this.mapBounds = {
      minLat: minLat - padding,
      maxLat: maxLat + padding,
      minLon: minLon - padding,
      maxLon: maxLon + padding
    };
  }

  initializeGeofencing() {
    if (!this.centerLat || !this.centerLon) {
      alert('Please set the center coordinates');
      return;
    }

    // If radius is provided, use circular eco-friendly area divided into 6 sectors
    const useCircle = this.radiusMeters && this.radiusMeters > 0;

    if (!useCircle) {
      if (!this.areaWidth || !this.areaHeight) {
        alert('Please set the area dimensions');
        return;
      }

      if (!this.divisionsX || !this.divisionsY) {
        alert('Please set the division counts');
        return;
      }
    }

    this.mapCenter = { latitude: this.centerLat, longitude: this.centerLon };
    if (this.map) {
      this.map.setView(
        [this.mapCenter.latitude, this.mapCenter.longitude],
        this.map.getZoom() ?? 14
      );
    }
    
    // Generate zones
    if (useCircle) {
      const baseName = this.guestName
        ? `${this.guestName}'s Eco Area`
        : 'Eco Area';
      this.zones = this.geofenceService.divideCircleIntoSectors(
        this.mapCenter,
        this.radiusMeters,
        6,
        baseName
      );
    } else {
      this.zones = this.geofenceService.divideAreaIntoZones(
        this.mapCenter,
        this.areaWidth,
        this.areaHeight,
        this.divisionsX,
        this.divisionsY
      );
    }
    
    // Calculate map bounds
    this.calculateMapBounds();
    
    // Save to data service
    const totalArea = useCircle
      ? Math.PI * this.radiusMeters * this.radiusMeters
      : this.areaWidth * this.areaHeight;
    const divisions = this.zones.length;
    
    // Clear existing areas
    this.dataService.initializeParkAreas(this.mapCenter, totalArea, divisions);
    
    // Add zones to the first area
    const areas = this.dataService.getParkAreas()();
    if (areas.length > 0) {
      this.zones.forEach(zone => {
        this.dataService.addGeofenceZone(areas[0].id, zone);
      });
    }
    
    this.showGeofenceConfig = false;
    this.configStep = 'location';
    alert(`Successfully created ${this.zones.length} geofencing zones!`);
  }

  onHotspotClick(hotspot: any) {
    // Find zone that contains this hotspot (if zones exist)
    if (this.zones.length > 0) {
      const hotspotPoint = this.getHotspotCoordinates(hotspot);
      const containingZone = this.zones.find(zone => 
        this.geofenceService.isPointInPolygon(hotspotPoint, zone.area)
      );
      
      if (containingZone) {
        this.selectedZone = containingZone;
        return;
      }
    }
    
    // Fallback to creating a zone from hotspot
    this.selectedZone = {
      id: hotspot.id,
      name: hotspot.name,
      area: [],
      center: this.mapCenter,
      type: hotspot.type as any,
      description: `Information about ${hotspot.name}`
    };
  }

  getHotspotCoordinates(hotspot: any): GeoPoint {
    // Convert percentage-based hotspot to actual coordinates
    if (this.zones.length === 0) {
      return this.mapCenter;
    }
    
    const latRange = this.mapBounds.maxLat - this.mapBounds.minLat;
    const lonRange = this.mapBounds.maxLon - this.mapBounds.minLon;
    
    return {
      latitude: this.mapBounds.minLat + (hotspot.y / 100) * latRange,
      longitude: this.mapBounds.minLon + (hotspot.x / 100) * lonRange
    };
  }

  closeZoneDetails() {
    this.selectedZone = null;
  }

  getZonePolygonPath(zone: GeofenceZone): string {
    if (zone.area.length === 0 || !this.mapBounds.minLat) return '';
    
    const mapWidth = 800; // Approximate map width in pixels
    const mapHeight = 500; // Approximate map height in pixels
    
    return zone.area.map((point, index) => {
      const pixel = this.geofenceService.geoToPixel(
        point,
        this.mapBounds,
        mapWidth,
        mapHeight
      );
      return `${index === 0 ? 'M' : 'L'} ${pixel.x} ${pixel.y}`;
    }).join(' ') + ' Z';
  }

  getZoneCenterPixel(zone: GeofenceZone): { x: number; y: number } {
    if (!this.mapBounds.minLat) {
      return { x: 400, y: 250 }; // Center of map as fallback
    }
    const mapWidth = 800;
    const mapHeight = 500;
    return this.geofenceService.geoToPixel(
      zone.center,
      this.mapBounds,
      mapWidth,
      mapHeight
    );
  }

  onZoneClick(zone: GeofenceZone) {
    this.selectedZone = zone;
  }

  /**
   * Get current location using browser geolocation API
   */
  getCurrentLocation() {
    this.isGettingLocation = true;
    this.locationError = null;

    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by your browser';
      this.isGettingLocation = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.centerLat = position.coords.latitude;
        this.centerLon = position.coords.longitude;
        this.mapCenter = { 
          latitude: this.centerLat, 
          longitude: this.centerLon 
        };
        if (this.map) {
          this.map.setView(
            [this.centerLat, this.centerLon],
            this.map.getZoom() ?? 15
          );
        }
        this.isGettingLocation = false;
        this.locationError = null;
        this.configStep = 'area';
      },
      (error) => {
        this.isGettingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Location access denied. Please enable location permissions or enter coordinates manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location information unavailable. Please enter coordinates manually.';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out. Please enter coordinates manually.';
            break;
          default:
            this.locationError = 'An unknown error occurred. Please enter coordinates manually.';
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }
}