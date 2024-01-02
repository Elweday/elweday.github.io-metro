

import {Network, Tickets, Line, Station, type Ticket} from "./metro";
const [line1, line2, line3] = [
    ["Helwan","Ain Helwan","Helwan University","Wadi Hof","Hadayek Helwan","El-Maasara","Tora El-Asmant","Kozzika","Tora El-Balad","Sakanat El-Maadi","Maadi","Hadayek El-Maadi","Dar El-Salam","El-Zahraa'","Mar Girgis","El-Malek El-Saleh","Al-Sayeda Zeinab","Saad Zaghloul","Sadat","Nasser","Orabi","Al-Shohadaa","Ghamra","El-Demerdash","Manshiet El-Sadr","Kobri El-Qobba","Hammamat El-Qobba","Saray El-Qobba","Hadayeq El-Zaitoun","Helmeyet El-Zaitoun","El-Matareyya","Ain Shams","Ezbet El-Nakhl","El-Marg","New El-Marg"],
    ["El-Mounib","Sakiat Mekky","Omm El-Masryeen","El Giza","Faisal","Cairo University","El Bohoth","Dokki","Opera","Sadat","Mohamed Naguib","Attaba","Al-Shohadaa","Masarra","Road El-Farag","St. Teresa","Khalafawy","Mezallat","Kolleyyet El-Zeraa","Shubra El-Kheima"],
	["Adly Mansour","El Haykestep","Omar Ibn El-Khattab","Qobaa","Hesham Barakat","El-Nozha","Nadi El-Shams","Alf Maskan","Heliopolis Square","Haroun","Al-Ahram","Koleyet El-Banat","Stadium","Fair Zone","Abbassia","Abdou Pasha","El Geish","Bab El Shaaria","Attaba","Sadat"].toReversed()
]
const metro = new Network("Metro")
	.addLine("Line 1", line1)
	.addLine("Line 2", line2)
	.addLine("Line 3", line3);
const colors = [ "red", "lightgreen", "blue"] 
const lines = [line3, line2, line1]
function colorize(color: string, rect: SVGRectElement, idx: number) {
    const textEl = rect.parentElement?.lastChild as SVGTextElement;
    rect.animate({"fill": color}, {delay: 5 * idx, duration: 200, fill: "forwards"})
    textEl.animate({fill: "white"}, {delay: 5 * idx, duration: 200, fill: "forwards"});
}
function addText(rect: SVGRectElement, lineIdx: number, rectIdx: number) {
    const s = document.createElementNS("http://www.w3.org/2000/svg","text")
    s.setAttribute("x", String(+(rect.getAttribute("x") as string)  +10 ))
    s.setAttribute("y", String(+(rect.getAttribute("y") as string) ))
    s.setAttribute("text-anchor", "center")
    s.setAttribute("fill", colors[lineIdx])
    s.setAttribute("font-size", "9")
    s.innerHTML = lines[lineIdx][rectIdx]
    const g = rect.parentNode as SVGGElement
    g.appendChild(s);
    
}
document.addEventListener("DOMContentLoaded", (e)=>{
    
    // Coloring paths
    
    document.querySelectorAll(".line").forEach((g, lineIdx) => {
        g.querySelectorAll("rect").forEach((rect, rectIdx, rects) => {
            if (lines[lineIdx][rectIdx] == "Nasser") console.log(rect)
            addText(rect, lineIdx, rectIdx)
            rect.dataset.station = lines[lineIdx][rectIdx]
            rect.dataset.line = String(lineIdx+1)
            rect.addEventListener("click", click(lineIdx, rectIdx))
        })
    
    })
    resetColors()

})
function resetColors() {
    document.querySelectorAll("path").forEach((path, idx) => {
        path.style.setProperty("stroke-width", "4px")
        path.style.setProperty("stroke", colors[idx])
    })
    document.querySelectorAll("rect").forEach((rect, idx) => colorize(colors[parseInt(rect.dataset.line as string)-1], rect, idx))
}
function click(lineIdx: number, rectIdx:number) {
    return (e: MouseEvent) => {
        resetColors()
        const startingStation = lines[lineIdx][rectIdx]
        console.log(startingStation)
        const otherStations = lines
            .reduce((acc, line) => {return acc.concat(line)})  
            .filter((station) => station != startingStation)
            .map((station) => {
                console.log(station)
                const pathLength = metro.getPath(startingStation, station).length -1  ;
                const ticket =  Tickets.find((ticket: Ticket) => ticket.stations >= pathLength);
                ticket.station = station
                ticket.pathLength = pathLength
                return {station, pathLength, color: ticket.color}
            })
            .sort((a,b) => a.pathLength - b.pathLength)
        console.log(otherStations)
        // const path = metro.getPath(startingStation, lines[lineIdx][rectIdx])   
        // (document.querySelector("#nstations") as HTMLElement).textContent = path.length;
        // (document.querySelector("#price") as HTMLElement).textContent = String(ticket.price);
        otherStations.forEach(({station, color}, idx) => {
                const el = document.querySelectorAll(`[data-station="${station}"]`) as NodeListOf<SVGRectElement>;
                el.forEach((subEl) => {
                    colorize(color, subEl, idx)
                    
                })
        })
    }
        
    }
