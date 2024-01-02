type Ticket = {color: string, stations: number, price: number}
const Tickets: Ticket[] = [
    {color: "#ffff1f", stations: 9, price:6},
    {color: "#5de34b", stations: 16, price:8},
    {color: "#de6dd4", stations: 23, price:12},
    {color: "rgb(253 186 116)", stations: 100, price:15},
] as const;






class Station {
    name: string;
    lines: Set<Line>; 
    ticket: Ticket|null;  
    highlighted: boolean;
  
    constructor(name: string) {
      this.name = name;
      this.lines = new Set<Line>();
      this.ticket = null;
      this.highlighted = false;
    }
  }
  
  class Line {
    name: string;
    stations: Station[];
    network: Network | null;
  
    constructor(name: string) {
      this.name = name;
      this.stations = [];
      this.network = null;
    }
  
    addStation(station: Station): void {
      this.stations.push(station);
      station.lines.add(this);
    }

    intersection(line: Line): Station {
        let nearestIntersection: Station;
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
    stations: Map<string,Station>;
  
    constructor(name: string) {
      this.name = name;
      this.lines = [];
      this.adjacencyList = new Map();
      this.stations = new Map<string,Station>();
      return this
    }
  
    addLine(name: string, line: string[]): Network {
        const metroLine = new Line(name);
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
        const intersections: Map<Set<Line>, Set<Station>> = new Map();
        [...this.stations.values()].filter((station) => station.lines.size > 1).forEach(station => {
          const [line1, line2] = station.lines;
          const key = line1.name+line2.name
          if (!intersections.has(key)) {
            intersections.set(key, new Set());
          }
          intersections.get(key).add(station);

        })
        return intersections
      }

    

      getPathSameLine(startStationName: string, endStationName: string): Station[] {
        const startStation = this.stations.get(startStationName);
        const endStation = this.stations.get(endStationName);
        const commonLine = [...startStation.lines].find(i => endStation.lines.has(i))
        if (commonLine) {
            const startIdx =[...commonLine.stations].findIndex((station) => station === startStation);
            const endIdx =[...commonLine.stations].findIndex((station) => station === endStation);
            return startIdx > endIdx ? commonLine.stations.slice(endIdx, startIdx+ 1).reverse(): commonLine.stations.slice(startIdx, endIdx + 1);
        }
        else {
            throw new Error("Stations are not on the same line");
        }
      }
      getPath(startStationName: string, endStationName: string): Station[] {
        const startStation = this.stations.get(startStationName) as Station;
        const endStation = this.stations.get(endStationName) as Station;
        for (const sLine of startStation?.lines) {
            for (const eLine of endStation?.lines) {
                if (sLine.name === eLine.name) {
                    return this.getPathSameLine(startStationName, endStationName);
                }
                let intersection = sLine.intersection(eLine);
                if (intersection) {
                    return [...this.getPathSameLine(startStationName, intersection.name).slice(0,-1), ...this.getPathSameLine(intersection.name, endStationName)];
                }
            }
        }
      }
      printAdjacencyList(): void {
        console.log("Adjacency List:");
    
        for (const [station, neighbors] of this.adjacencyList.entries()) {
          const neighborNames = Array.from(neighbors).map((neighbor) => neighbor.name);
          console.log(`${station.name} -> ${neighborNames.join(", ")}`);
        }
      }
    

  }
  
  
export  {Network, Tickets, Station, Line, type Ticket}