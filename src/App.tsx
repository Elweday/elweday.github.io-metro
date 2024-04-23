import "./index.css";
import { metro } from "./utils/stations";
import { useState, useRef } from "react";
import type { StationName } from "./utils/allLocations";
import { calculatePerpendicularAngle, useLocation } from "./utils/geo"; 
import { LatLng } from "spherical-geometry-js";

const yFactor = 1.5;

export const LocationPin = (props: {scalingFunc: (p: LatLng) => {x: number, y: number}}) => {
  const location = useLocation(1000);
  const pos = props.scalingFunc(location);
  return pos && <circle cx={pos.x} cy={pos.y*yFactor} r="2" fill={"white"} />
}

function App() {
	const lines = metro.lines;
  const [start, setStart] = useState<StationName>(undefined);
  const [end, setEnd] = useState<StationName>(undefined);
  const dialogRef = useRef<HTMLDialogElement>();


  const trip =  start && end && metro.newTrip(start, end);  
	return (
		<>
    {trip && (
    <dialog ref={dialogRef}>

    <div className="dialog">
      <div className="dialog-header">
        <h2 className="dialog-title">Instructions</h2>
        <button className="dialog-close" onClick={() => dialogRef.current.close()}>x</button>

      </div>
      <ul className="instructions">
        <li style={{fontWeight: "bold", fontSize: "1rem"}}>Buy a <span style={{color: trip.ticket.color}}>{trip.ticket.price} L.E.</span> ticket from  <span style={{color: trip.path[0].lines.values().next().value.color}}> {trip.path[0].name}.</span></li>
        {trip?.instructions?.map(((instruction, i)=> <li key={i} style={{fontSize: "0.6rem"}}>{instruction}</li>))}
        <li style={{fontWeight: "bold", fontSize: "1rem"}}>Get off at <span style={{color: trip.path[trip.path.length-1].lines.values().next().value.color}}> {trip.path[trip.path.length-1].name}.</span></li>
      </ul>
        <div style={{color: "black", opacity: "0.8", position: "absolute", borderRadius: "3px", width: "3.5rem", height: "6rem" , backgroundColor: trip.ticket.color, right: "1rem", top: "4rem"}}>
          <span style={{position: "absolute", opacity: "0.4", backgroundColor: "brown", left: "1.5rem", height: "100%", width: "0.5rem"}} />
          <div style={{padding: "0.2rem", textAlign: "center", }}>
          <span style={{fontWeight: "1000", fontSize: "1rem"}}></span>
          </div>
        </div>
    </div>
    </dialog>

  )}
      <div className="container">
			<div className="content" style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "0.5rem"}}>
				<h1 style={{textAlign: "center", color: "white", display:"flex", justifyContent: "center", alignItems: "center"}}>
          <span style={{ fontWeight: "600", fontFamily: "serif", }}>Metrospection</span>
          <img src="/logo.webp"  style={{height: "3rem"}}  alt="cairo metro logo" />

        </h1>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem"}}>
        <div className="select">
        <select defaultValue={undefined} value={start} onChange={(e) => {
          // @ts-expect-error TODO: type Station Name should be exported and coerced.
          setStart(e.target.value)
        }}>
          <option selected disabled value={undefined}> Start Station</option>
          {[...metro.stations.values()].map(s => <option key={s.name} >{s.name}</option>)}
        </select>

        </div>
        
        <div className="select">

        <select defaultValue={undefined} value={end} onChange={(e) => {
          // @ts-expect-error TODO: type Station Name should be exported and coerced.
          setEnd(e.target.value)
          }}>
        <option selected disabled value={undefined}> End Station</option>

          {[...metro.stations.values()].map(s => <option key={s.name} >{s.name}</option>)}
        </select>
        </div>

        </div>

        {
          (start && end) && <button className="more-info-button" onClick={()=>dialogRef.current?.showModal()}>? </button>
        }
        

				<svg strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%", maxWidth:"500px" }} viewBox="-10 -10 120 170">

					{lines.map((l) => {
						return l.stations
							.map((s, j) => {
								const prev = l.stations[j - 1];
                const p = prev ? {x: prev.position.x, y: prev.position.y *yFactor} : null;
                const c = {x: s.position.x, y: s.position.y * yFactor};
                const isHighlighted = trip ? trip.path.includes(s) : true;
                const dimOpacity = 0.2;
                const angle = p? calculatePerpendicularAngle(c, p): "" ;
                

								return (
									<g key={s.name}>
										<circle cx={c.x} opacity={isHighlighted ? 1 : dimOpacity} cy={c.y} r="1.5" fill={l.color} />
										<text x={c.x + (s.name.length * 0.8)} origin={`${c.x} ${c.y}`} transform={angle} y={c.y} textAnchor="middle" alignmentBaseline="middle"  opacity={isHighlighted ? 1 : 0} fill={l.color} fontSize={2.8}>
											{s.name}
										</text>
										{p && <line x1={c.x} y1={c.y} x2={p.x} y2={p.y} strokeWidth={0.8} opacity={isHighlighted ? 1 : dimOpacity} stroke={l.color}  />}
									</g>
								);
							})
					})}
          {/* <LocationPin scalingFunc={metro.scalingFunc} /> */}
				</svg>
			</div>
      <div className="blob"></div>
      </div>
		</>
	);
}

export default App;
