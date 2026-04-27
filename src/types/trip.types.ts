export interface TripResponse {
    id: string;
    userId: string;
    name: string;
    totalDistance: number;
    totalDuration: number;
    idlingDuration: number;
    stoppageDuration: number;
    overSpeedTime: number;
    overSpeedDistance: number;
    avgSpeed: number;
    maxSpeed: number;
    startTime: string; // Dates are automatically serialized to ISO strings in JSON responses
    endTime: string;
}

export interface GPSPointDTO {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed: number;
    status: string;
    ignition: 'on' | 'off';
    isOverspeeding: boolean;
}

export interface TripDetailResponse extends TripResponse {
    gpsData: GPSPointDTO[];
}
