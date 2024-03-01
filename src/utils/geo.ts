
import { LatLng } from "spherical-geometry-js";
import { useState, useEffect } from "react";
export function calculatePerpendicularAngle(c: { x: number; y: number }, p: { x: number; y: number }): string {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const angle = Math.atan2(dy, dx);
    const perpendicularAngle = angle + (Math.PI / 2);
    const degrees = (perpendicularAngle) * (180 / Math.PI);
    if (degrees > 90) {
      return `rotate(${-30} ${c.x} ${c.y})`;
    }
    else if (degrees > 50) {
      return `rotate(${30} ${c.x} ${c.y})`;
    } 
  }

export const useLocation = (timeInterval: number) => {

    function makeCoord(pos: GeolocationPosition){
        return new LatLng(pos.coords.latitude, pos.coords.longitude);
    }
    
    const [location, setLocation] = useState<LatLng>();
    const options = { enableHighAccuracy: true, maximumAge: 0 };
    const onSuccess = (pos: GeolocationPosition) => {
        setLocation(makeCoord(pos))
    }
    const onError = (err: GeolocationPositionError) => console.log(err);

    useEffect(() => {
        const getLocation = () => window.navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        getLocation();
        const interval = setInterval(() => {
            getLocation();
        }, timeInterval);
        return () => clearInterval(interval);
    },[])

    return location
}


