import { Injectable } from '@nestjs/common';
import { Point } from '../../database/types/point.type';

const EARTH_RADIUS_KM = 6371;

@Injectable()
export class BotMovementService {
  calculateNextPosition(
    current: Point,
    home: Point,
    roamRadiusKm: number,
    movementStyle: string,
    speedKmH: number,
    timeSinceLastMoveMs: number,
  ): Point {
    const distanceKm = (speedKmH * timeSinceLastMoveMs) / 3_600_000;

    switch (movementStyle) {
      case 'stationary':
        return this.addJitter(current, 0.05);
      case 'commute':
        return this.commute(current, home, roamRadiusKm, distanceKm);
      case 'wander':
        return this.wander(current, home, roamRadiusKm, distanceKm);
      case 'random_walk':
      default:
        return this.randomWalk(current, home, roamRadiusKm, distanceKm);
    }
  }

  private randomWalk(
    current: Point,
    home: Point,
    roamRadiusKm: number,
    distanceKm: number,
  ): Point {
    const bearing = Math.random() * 2 * Math.PI;
    const next = this.movePoint(current, bearing, distanceKm);
    return this.clampToRadius(next, home, roamRadiusKm);
  }

  private wander(
    current: Point,
    home: Point,
    roamRadiusKm: number,
    distanceKm: number,
  ): Point {
    // Momentum-based: bias toward current heading with some randomness
    const toHomeAngle = this.bearingBetween(current, home);
    const distFromHome = this.haversineDistance(current, home);
    const homePull = distFromHome / roamRadiusKm; // 0-1, stronger as we get farther

    // Blend random direction with home-pull
    const randomBearing = Math.random() * 2 * Math.PI;
    const bearing = randomBearing * (1 - homePull * 0.5) + toHomeAngle * (homePull * 0.5);

    const next = this.movePoint(current, bearing, distanceKm);
    return this.clampToRadius(next, home, roamRadiusKm);
  }

  private commute(
    current: Point,
    home: Point,
    roamRadiusKm: number,
    distanceKm: number,
  ): Point {
    // Generate a destination roughly opposite side of home
    const hour = new Date().getHours();
    const isCommuting = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

    if (isCommuting) {
      // Move toward a "work" point (offset from home)
      const workOffset = roamRadiusKm * 0.6;
      const workPoint: Point = {
        latitude: home.latitude + this.kmToLatDeg(workOffset),
        longitude: home.longitude + this.kmToLngDeg(workOffset, home.latitude),
      };
      const bearing = this.bearingBetween(current, hour <= 9 ? workPoint : home);
      const next = this.movePoint(current, bearing, distanceKm);
      return this.clampToRadius(next, home, roamRadiusKm);
    }

    // Outside commute hours, minor movement
    return this.addJitter(current, 0.2);
  }

  private movePoint(origin: Point, bearingRad: number, distanceKm: number): Point {
    const lat1 = this.toRad(origin.latitude);
    const lng1 = this.toRad(origin.longitude);
    const angularDistance = distanceKm / EARTH_RADIUS_KM;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad),
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
      );

    return {
      latitude: this.toDeg(lat2),
      longitude: this.toDeg(lng2),
    };
  }

  private clampToRadius(point: Point, center: Point, radiusKm: number): Point {
    const dist = this.haversineDistance(point, center);
    if (dist <= radiusKm) return point;

    // Move point back toward center to be at the edge of the radius
    const bearing = this.bearingBetween(center, point);
    return this.movePoint(center, bearing, radiusKm * 0.95);
  }

  private addJitter(point: Point, maxKm: number): Point {
    const jitterKm = Math.random() * maxKm;
    const bearing = Math.random() * 2 * Math.PI;
    return this.movePoint(point, bearing, jitterKm);
  }

  private haversineDistance(a: Point, b: Point): number {
    const lat1 = this.toRad(a.latitude);
    const lat2 = this.toRad(b.latitude);
    const dLat = lat2 - lat1;
    const dLng = this.toRad(b.longitude - a.longitude);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  }

  private bearingBetween(from: Point, to: Point): number {
    const lat1 = this.toRad(from.latitude);
    const lat2 = this.toRad(to.latitude);
    const dLng = this.toRad(to.longitude - from.longitude);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return Math.atan2(y, x);
  }

  private kmToLatDeg(km: number): number {
    return km / 111.32;
  }

  private kmToLngDeg(km: number, latitude: number): number {
    return km / (111.32 * Math.cos(this.toRad(latitude)));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private toDeg(rad: number): number {
    return (rad * 180) / Math.PI;
  }
}
