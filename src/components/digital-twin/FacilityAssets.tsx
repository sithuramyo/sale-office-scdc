'use client';
import {useEffect,useRef,useState} from 'react';
import {Icon} from '@/components/ui/Icon';
import {ASSET_TYPES} from '@/config/asset-types';
import type {FacilityAssetDefinition as Asset,FacilityAssetRuntimeState} from '@/types/facility-assets';
import type {AssetRegistry} from '@/lib/asset-registry';
type Project=(p:[number,number,number])=>{x:number;y:number;visible:boolean}|null;
function location(a:Asset){return [a.buildingId,a.floorId,a.roomId,a.areaId].filter(Boolean).join(' / ')||'Site';}
export function FacilityAssetMarker({asset,status,selected,element,onHover,onSelect}:{asset:Asset;status:string;selected:boolean;element:(el:HTMLButtonElement|null)=>void;onHover:(id:string|null)=>void;onSelect:(id:string)=>void}){
 return <button ref={element} hidden data-asset-id={asset.id} data-status={status} className={'asset-marker '+(selected?'selected':'')} aria-label={asset.label} aria-pressed={selected} onPointerEnter={()=>onHover(asset.id)} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover(asset.id)} onBlur={()=>onHover(null)} onClick={()=>onSelect(asset.id)}><Icon name={ASSET_TYPES[asset.type].icon}/><i/>{asset.demo&&<span className="demo-mark">D</span>}</button>;
}
export function FacilityAssets({items,registry,selected,onSelect,project}:{items:Asset[];registry:AssetRegistry;selected:string|null;onSelect:(id:string)=>void;project:Project}){
 const elements=useRef(new Map<string,HTMLButtonElement>()),tip=useRef<HTMLDivElement>(null);const [hover,setHover]=useState<string|null>(null);
 const hovered=items.find(a=>a.id===hover);
 useEffect(()=>{let frame=0;
 const tick=()=>{for(const a of items){const el=elements.current.get(a.id),p=project(a.position);if(el){el.hidden=!p?.visible;if(p)el.style.transform='translate('+p.x+'px,'+p.y+'px) translate(-50%,-50%)';}
 if(a.id===hover&&tip.current){tip.current.hidden=!p?.visible;if(p)tip.current.style.transform='translate('+Math.max(8,Math.min(innerWidth-245,p.x+18))+'px,'+Math.max(85,Math.min(innerHeight-120,p.y-45))+'px)';}}
 frame=requestAnimationFrame(tick);};if(items.length)tick();return()=>cancelAnimationFrame(frame);
 },[items,project,hover]);
 return <div className="asset-overlay">{items.map(a=><FacilityAssetMarker key={a.id} asset={a} status={registry.runtimeById.get(a.id)?.status||'unknown'} selected={selected===a.id} element={el=>{if(el)elements.current.set(a.id,el);else elements.current.delete(a.id)}} onHover={setHover} onSelect={onSelect}/>)}{hovered&&<div ref={tip} role="tooltip" className="world-tooltip glass asset-tooltip"><Icon name={ASSET_TYPES[hovered.type].icon}/><div><strong>{hovered.label}</strong><small>{ASSET_TYPES[hovered.type].label} · {location(hovered)}</small><small>{registry.runtimeById.get(hovered.id)?.status||'unknown'}{hovered.demo?' · DEMO':''}</small></div></div>}</div>;
}
export function FacilityAssetDetail({asset,runtime,onClose,embedded=false}:{asset:Asset;runtime?:FacilityAssetRuntimeState;onClose:()=>void;embedded?:boolean}){
 const value=(v:unknown)=>typeof v==='object'?JSON.stringify(v):String(v);
 return <section className={'asset-detail '+(embedded?'':'glass floating-asset-detail')} aria-label="Asset detail"><div className="panel-title"><span className="eyebrow">{asset.demo?'DEMO ASSET':'CONNECTED ASSET'}</span><button aria-label="Close asset detail" onClick={onClose}><Icon name="close"/></button></div><h3><Icon name={ASSET_TYPES[asset.type].icon}/>{asset.label}</h3><p>{ASSET_TYPES[asset.type].label} · <span data-asset-status>{runtime?.status||'unknown'}</span></p><p>{location(asset)}</p><dl>{Object.entries({...asset.metadata,...runtime?.values}).map(([key,v])=><div key={key}><dt>{key}</dt><dd>{value(v)}</dd></div>)}</dl>{asset.demo&&<small>Synthetic test location</small>}</section>;
}
