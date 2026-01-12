import { Injectable } from '@angular/core';
import { GeoPoint, GeofenceZone, ParkArea } from '../models/geofence.model';

@Injectable({
  providedIn: 'root'
})
export class GeofenceService {
  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * 
              Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate area of a polygon using Shoelace formula
   */
  calculatePolygonArea(points: GeoPoint[]): number {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].latitude * points[j].longitude;
      area -= points[j].latitude * points[i].longitude;
    }
    
    // Convert to square meters (approximate)
    return Math.abs(area) * 111000 * 111000 / 2;
  }

  /**
   * Divide a rectangular area into equal parts
   */
  divideAreaIntoZones(
    center: GeoPoint,
    width: number, // in meters
    height: number, // in meters
    divisionsX: number,
    divisionsY: number
  ): GeofenceZone[] {
    const zones: GeofenceZone[] = [];
    
    // Calculate degrees per meter (approximate)
    const latPerMeter = 1 / 111000;
    const lonPerMeter = 1 / (111000 * Math.cos(this.toRadians(center.latitude)));
    
    const zoneWidth = width / divisionsX;
    const zoneHeight = height / divisionsY;
    
    const startLat = center.latitude - (height / 2) * latPerMeter;
    const startLon = center.longitude - (width / 2) * lonPerMeter;
    
    for (let y = 0; y < divisionsY; y++) {
      for (let x = 0; x < divisionsX; x++) {
        const zoneId = `zone-${x}-${y}`;
        const zoneName = `Zone ${x + 1}-${y + 1}`;
        
        // Calculate zone boundaries
        const topLeft: GeoPoint = {
          latitude: startLat + y * zoneHeight * latPerMeter,
          longitude: startLon + x * zoneWidth * lonPerMeter
        };
        
        const topRight: GeoPoint = {
          latitude: topLeft.latitude,
          longitude: topLeft.longitude + zoneWidth * lonPerMeter
        };
        
        const bottomRight: GeoPoint = {
          latitude: topLeft.latitude + zoneHeight * latPerMeter,
          longitude: topRight.longitude
        };
        
        const bottomLeft: GeoPoint = {
          latitude: bottomRight.latitude,
          longitude: topLeft.longitude
        };
        
        const zoneCenter: GeoPoint = {
          latitude: (topLeft.latitude + bottomRight.latitude) / 2,
          longitude: (topLeft.longitude + bottomRight.longitude) / 2
        };
        
        const zone: GeofenceZone = {
          id: zoneId,
          name: zoneName,
          area: [topLeft, topRight, bottomRight, bottomLeft, topLeft], // Closed polygon
          center: zoneCenter,
          type: 'General',
          description: `${zoneName} - ${(zoneWidth * zoneHeight).toFixed(0)} m²`
        };
        
        zones.push(zone);
      }
    }
    
    return zones;
  }

  /**
   * Divide a circular area into equal wedge-shaped sectors
   */
  divideCircleIntoSectors(
    center: GeoPoint,
    radius: number, // in meters
    segments: number,
    baseName: string
  ): GeofenceZone[] {
    const zones: GeofenceZone[] = [];

    if (segments <= 0 || radius <= 0) {
      return zones;
    }

    const latPerMeter = 1 / 111000;
    const lonPerMeter = 1 / (111000 * Math.cos(this.toRadians(center.latitude)));

    const angleStep = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;

      const outer1: GeoPoint = {
        latitude: center.latitude + (radius * Math.sin(startAngle)) * latPerMeter,
        longitude: center.longitude + (radius * Math.cos(startAngle)) * lonPerMeter
      };

      const outer2: GeoPoint = {
        latitude: center.latitude + (radius * Math.sin(endAngle)) * latPerMeter,
        longitude: center.longitude + (radius * Math.cos(endAngle)) * lonPerMeter
      };

      const zoneCenter: GeoPoint = {
        latitude: (center.latitude + outer1.latitude + outer2.latitude) / 3,
        longitude: (center.longitude + outer1.longitude + outer2.longitude) / 3
      };

      const zoneName = `${baseName} ${i + 1}`;

      const zone: GeofenceZone = {
        id: `sector-${i + 1}`,
        name: zoneName,
        area: [center, outer1, outer2, center],
        center: zoneCenter,
        type: 'General',
        description: `${zoneName} - circular sector`
      };

      zones.push(zone);
    }

    return zones;
  }

  /**
   * Check if a point is inside a polygon
   */
  isPointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude;
      const yi = polygon[i].latitude;
      const xj = polygon[j].longitude;
      const yj = polygon[j].latitude;
      
      const intersect = ((yi > point.latitude) !== (yj > point.latitude)) &&
                       (point.longitude < (xj - xi) * (point.latitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Convert geographic coordinates to map pixel coordinates
   */
  geoToPixel(
    point: GeoPoint,
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
    mapWidth: number,
    mapHeight: number
  ): { x: number; y: number } {
    const x = ((point.longitude - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * mapWidth;
    const y = ((bounds.maxLat - point.latitude) / (bounds.maxLat - bounds.minLat)) * mapHeight;
    return { x, y };
  }
}

