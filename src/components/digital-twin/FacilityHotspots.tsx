'use client';
import {useEffect,useRef} from 'react';import type {Hotspot} from '@/types/facility';
/** Empty in V1. Future markers stay data-driven and separate from the model. */
export function FacilityHotspots({items,activeLayers,project,onSelect}:{items:Hotspot[];activeLayers:Record<string,boolean>;project:(p:[number,number,number])=>{x:number;y:number;visible:boolean}|null;onSelect?:(h:Hotspot)=>void}){
 const root=useRef<HTMLDivElement>(null);const active=items.filter(h=>activeLayers[h.type]);
 useEffect(()=>{if(!active.length)return;let frame=0;const tick=()=>{active.forEach(h=>{const element=root.current?.querySelector<HTMLElement>('[data-hotspot-id="'+h.id+'"]');const point=project(h.position);if(element){element.hidden=!point?.visible;if(point)element.style.transform='translate('+point.x+'px,'+point.y+'px)';}});frame=requestAnimationFrame(tick);};tick();return()=>cancelAnimationFrame(frame);},[active,project]);
 return <div ref={root} className="hotspots">{active.map(h=><button key={h.id} data-hotspot-id={h.id} title={h.label} aria-label={h.label} onClick={()=>onSelect?.(h)}>{h.label}</button>)}</div>;
}
