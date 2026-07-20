export type OfficeDirection = "up" | "down" | "left" | "right";

export type OfficeLocationKind =
  | "door"
  | "coffee"
  | "printer"
  | "reception"
  | "meetingRoom"
  | "exit"
  | "custom";

export interface OfficePoint {
  x: number;
  y: number;
}

export interface OfficeCheckpoint extends OfficePoint {
  id: string;
}

export interface OfficeSeat extends OfficePoint {
  id: string;
  facing: OfficeDirection;
}

export interface OfficeLocation extends OfficePoint {
  id: string;
  kind: OfficeLocationKind;
}

export class OfficeNavigator {
  private seats = new Map<string, OfficeSeat>();
  private checkpoints = new Map<string, OfficeCheckpoint>();
  private locations = new Map<string, OfficeLocation>();

  constructor() {}

  // Registration

  registerSeat(seat: OfficeSeat): void {
    this.seats.set(seat.id, seat);
  }

  registerCheckpoint(checkpoint: OfficeCheckpoint): void {
    this.checkpoints.set(checkpoint.id, checkpoint);
  }

  registerLocation(location: OfficeLocation): void {
    this.locations.set(location.id, location);
  }

  removeLocation(id: string): void {
    this.locations.delete(id);
  }

  clear(): void {
    this.seats.clear();
    this.checkpoints.clear();
    this.locations.clear();
  }

  // Queries

  getSeat(id: string): OfficeSeat | undefined {
    return this.seats.get(id);
  }

  getCheckpoint(id: string): OfficeCheckpoint | undefined {
    return this.checkpoints.get(id);
  }

  getLocation(id: string): OfficeLocation | undefined {
    return this.locations.get(id);
  }

  hasSeat(id: string): boolean {
    return this.seats.has(id);
  }

  hasCheckpoint(id: string): boolean {
    return this.checkpoints.has(id);
  }

  hasLocation(id: string): boolean {
    return this.locations.has(id);
  }

  // Positions

  getSeatPosition(id: string): OfficePoint | undefined {
    const seat = this.getSeat(id);
    return seat ? this.toPoint(seat) : undefined;
  }

  getCheckpointPosition(id: string): OfficePoint | undefined {
    const checkpoint = this.getCheckpoint(id);
    return checkpoint ? this.toPoint(checkpoint) : undefined;
  }

  getLocationPosition(id: string): OfficePoint | undefined {
    const location = this.getLocation(id);
    return location ? this.toPoint(location) : undefined;
  }

  // Distances

  distance(a: OfficePoint, b: OfficePoint): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceBetweenLocations(idA: string, idB: string): number | undefined {
    const a = this.getLocationPosition(idA);
    const b = this.getLocationPosition(idB);
    if (!a || !b) return undefined;
    return this.distance(a, b);
  }

  distanceBetweenSeats(idA: string, idB: string): number | undefined {
    const a = this.getSeatPosition(idA);
    const b = this.getSeatPosition(idB);
    if (!a || !b) return undefined;
    return this.distance(a, b);
  }

  // Searches

  nearestSeat(point: OfficePoint): OfficeSeat | undefined {
    return this.nearestFrom(point, this.seats);
  }

  nearestCheckpoint(point: OfficePoint): OfficeCheckpoint | undefined {
    return this.nearestFrom(point, this.checkpoints);
  }

  nearestLocation(point: OfficePoint): OfficeLocation | undefined {
    return this.nearestFrom(point, this.locations);
  }

  private nearestFrom<T extends OfficePoint>(
    point: OfficePoint,
    source: Map<string, T>
  ): T | undefined {
    let nearest: T | undefined;
    let nearestDistance = Infinity;

    for (const item of source.values()) {
      const currentDistance = this.distance(point, item);
      if (currentDistance < nearestDistance) {
        nearestDistance = currentDistance;
        nearest = item;
      }
    }

    return nearest;
  }

  // Special points

  middlePoint(a: OfficePoint, b: OfficePoint): OfficePoint {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
  }

  offsetPoint(point: OfficePoint, dx: number, dy: number): OfficePoint {
    return {
      x: point.x + dx,
      y: point.y + dy,
    };
  }

  // Routes

  getRoute(start: OfficePoint, end: OfficePoint): OfficePoint[] {
    return [start, end];
  }

  // Helpers

  toPoint(source: OfficePoint): OfficePoint {
    return { x: source.x, y: source.y };
  }

  clonePoint(point: OfficePoint): OfficePoint {
    return { x: point.x, y: point.y };
  }

  equals(a: OfficePoint, b: OfficePoint): boolean {
    return a.x === b.x && a.y === b.y;
  }
}
