import { StationLocation, StationName } from './allLocations';
import { LatLng, computeDistanceBetween, computeHeading } from 'spherical-geometry-js';
import { metro } from './stations';


class Station {
    name: StationName;
    lines: Set<Line>; 
    ticket: Ticket|null;  
    highlighted: boolean;
    location : LatLng
    position: {x: number, y: number}
  
    constructor(name: StationName) {
      this.name = name;
      this.location = StationLocation[name];
      this.lines = new Set<Line>();
      this.ticket = null;
      this.highlighted = false;
    }
  }
  
  class Line {
    name: string;
    stations: Station[];
    network: Network | null;
    color: string
  
    constructor(name: string, color: string) {
      this.name = name;
      this.stations = [];
      this.network = null;
      this.color = color;
    }
  
    addStation(station: Station): void {
      this.stations.push(station);
      station.lines.add(this);
    }

    intersection(line: Line): Station {
        let nearestIntersection: Station ;
        let minIndexDiff = Infinity;
      
        line.stations.forEach(otherLineStation => {
          const indexInThisLine = this.stations.findIndex(s => s === otherLineStation);
      
          if (indexInThisLine !== -1) {
            const indexDiff = Math.abs(indexInThisLine);
      
            if (indexDiff < minIndexDiff) {
              minIndexDiff = indexDiff;
              nearestIntersection = otherLineStation;
            }
          }
        });
      
        return nearestIntersection;
      }
      
  }
  
  class Network {
    name: string;
    lines: Line[];
    adjacencyList: Map<Station, Set<Station>>;
    stations: Map<StationName,Station>;
    scalingFunc: (p : {longitude: number, latitude: number}) => { x: number, y: number}
  
    constructor(name: string) {
      this.name = name;
      this.lines = [];
      this.adjacencyList = new Map();
      this.stations = new Map<StationName,Station>();
      return this
    }

    distribute() {
        let latRange = [-Infinity, Infinity];
        let lngRange = [-Infinity, Infinity];
        this.stations.forEach((station) => {
            if (station.location.latitude < latRange[1]) latRange[1] = station.location.latitude;
            if (station.location.latitude > latRange[0]) latRange[0] = station.location.latitude;
            if (station.location.longitude < lngRange[1]) lngRange[1] = station.location.longitude;
            if (station.location.longitude > lngRange[0]) lngRange[0] = station.location.longitude;
        })
        this.scalingFunc = (p:{longitude: number, latitude: number}) => {
          const x = 100 * (p.latitude - latRange[0]) / (latRange[1] - latRange[0]) 
          const y = 100 * (p  .longitude - lngRange[0]) / (lngRange[1] - lngRange[0])
          return {x, y}
        }
        this.stations.forEach((station) => {
          station.position = this.scalingFunc(station.location);
        })

        return this;
    }
    newTrip(start: StationName, end: StationName): Trip {
        return new Trip(this, start, end);
    }
  
    addLine(name: string, color : string, line: StationName[]): Network {
        const metroLine = new Line(name, color);
        const newStations: Station[] = line.map((stationName) => {
            let station = this.stations.get(stationName);
            if (!station) station = new Station(stationName);
            return station;
        });
    
        newStations.forEach((station, index) => {
            metroLine.addStation(station);
            this.stations.set(station.name, station);
    
            // Construct the adjacency list
            if (!this.adjacencyList.has(station)) {
                this.adjacencyList.set(station, new Set());
            }
    
            // Connect stations from the same line
            if (index > 0) {
                const previousStation = newStations[index - 1];
                this.adjacencyList.get(station)!.add(previousStation);
                this.adjacencyList.get(previousStation)!.add(station);
            }
    
            // Connect stations from different lines
            if (index === newStations.length - 1 && index > 0) {
                const previousLineLastStation = newStations[index - 1];
                const stationList = this.adjacencyList.get(station);
                const prevList = this.adjacencyList.get(previousLineLastStation);
                stationList.add(previousLineLastStation)
                prevList.add(station);
            }
        });
        
        this.lines.push(metroLine);

    
        return this;
    }
      getIntersections (): Map<string, Set<Station>> {
        const intersections: Map<string, Set<Station>> = new Map();
        [...this.stations.values()].filter((station) => station.lines.size > 1).forEach(station => {
          const [line1, line2] = station.lines;
          const key1= `${line1.name}-${line2.name}`
          const key2 = `${line2.name}-${line1.name}`

          if (!intersections.has(key1) && !intersections.has(key2)) {
            intersections.set(key1, new Set());
            intersections.set(key2, new Set());
          }
          intersections.get(key1).add(station);
          intersections.get(key2).add(station);


        })
        return intersections
      }

      getPathSameLine(startStationName: StationName, endStationName: StationName): {path: Station[], direction: Station | undefined}  {
        const startStation = this.stations.get(startStationName);
        const endStation = this.stations.get(endStationName);
        const commonLine = [...startStation.lines].find(i => endStation.lines.has(i))
        if (commonLine) {
            const startIdx = commonLine.stations.findIndex((station) => station === startStation);
            const endIdx = commonLine.stations.findIndex((station) => station === endStation);
            const commonLinePath = startIdx > endIdx ? [...commonLine.stations].reverse():commonLine.stations;
            const direction = commonLinePath[commonLinePath.length-1];
            const path =  startIdx > endIdx ? commonLine.stations.slice(endIdx, startIdx+ 1).reverse(): commonLine.stations.slice(startIdx, endIdx + 1);
            return {path, direction};
        }
        else {
            throw new Error("Stations are not on the same line");
        }
      }
      getPath(startStationName: StationName, endStationName: StationName): [Station[], string[]] {
        const startStation = this.stations.get(startStationName) as Station;
        const endStation = this.stations.get(endStationName) as Station;
        const commonLines = (startStation.lines as any).intersection(endStation.lines) as  Set<Line>;
        const commonLinesArray = Array.from(commonLines);
        if (commonLinesArray.length > 0) {
          const {path, direction} = this.getPathSameLine(startStationName, endStationName)
          const instructions = [
            `Take  ${direction?.name} direction, ${commonLinesArray[0].name}`,
            `Ride ${path.length} stations.`
          ]
          return [path, instructions];
        }
        
        const intersections = metro.getIntersections();
        let currentLength: number = Infinity;
        let bestPath: Station[] = [];
        let instructions: string[] = [];
        for (const sLine of startStation?.lines) {
          for (const eLine of endStation?.lines) {
            const key = `${sLine.name}-${eLine.name}`
            const results = intersections.get(key);

            if (!results) continue;
            Array.from(results as Set<Station>).forEach((intersection) => {
                const {path: prepath1, direction: direction1} = this.getPathSameLine(startStationName, intersection.name);
                const {path: path2, direction: direction2} = this.getPathSameLine(intersection.name, endStationName);
                const path1 = prepath1.slice(0,-1)
                const length = path1.length + path2.length;
                if (length < currentLength) {
                    currentLength = length;
                    bestPath = [...path1, ...path2];
                    instructions = [
                        `Ride ${path1.length} stations on ${direction1?.name} direction, ${sLine.name}.`,
                        `Switch to ${eLine.name} on ${intersection?.name}.`,
                        `Ride ${path2.length} stations on ${direction2?.name} direction.`,
                    ]
                }
            })
          }
        }
        return [bestPath, instructions];

      }
  }

type Ticket = {color: string, stations: number, price: number}
const Tickets: Ticket[] = [
      {color: "#ffff1f", stations: 9, price:6},
      {color: "#5de34b", stations: 16, price:8},
      {color: "#de6dd4", stations: 23, price:12},
      {color: "rgb(253 186 116)", stations: Number.MAX_SAFE_INTEGER, price:15},
  ] as const;
  

function from (coord1: LatLng) {
    return (coord2: LatLng) => computeDistanceBetween(coord1, coord2);  
}
  

function toRad(angle: number)  {
    const deg =  (angle + 360) % 360;
    return deg * Math.PI / 180
}


class Trip {
    path: Station[];
    ticket: Ticket;
    index = 0;
    next = 0;
    currentLocation: LatLng;
    instructions ?: string[];

  constructor(metro : Network, start: StationName, end: StationName) {
    const [path, instructions] = metro.getPath(start, end);
    this.path = path;
    this.instructions = instructions;
    this.ticket = Tickets.find((ticket: Ticket) => ticket.stations >= path.length) as Ticket;
  }


  getWeightedPathPercentage() {
    const current = this.currentLocation;
    const prev = this.path[this.index].location;
    const next = this.path[this.next].location;
    const to = from(prev);
    const currentDsistance = to(current);
    const totalDistance = to(next);
    const directPathAngle = toRad(computeHeading(current, next));
    const currentPathAngle = toRad(computeHeading(prev, current));
    const angleDiff = Math.abs(directPathAngle - currentPathAngle);
    const distanceDotProduct = currentDsistance * Math.cos(angleDiff);
    return distanceDotProduct / totalDistance;
  }

  nextStation() {
        if (this.index < this.path.length - 1) {
            this.index++;
            return this.path[this.index];
        }
  }


}

  
export  {Network, Tickets, Station, Line, Trip, type Ticket}