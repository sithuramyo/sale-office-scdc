'use client';
import {useEffect,useRef,useState} from 'react';
import {Icon} from '@/components/ui/Icon';
import {ASSET_TYPES} from '@/config/asset-types';
import type {FacilityAssetDefinition as Asset,FacilityAssetRuntimeState} from '@/types/facility-assets';
import type {AssetRegistry} from '@/lib/asset-registry';
type Project=(p:[number,number,number])=>{x:number;y:number;visible:boolean}|null;
function location(a:Asset){return [a.buildingId,a.floorId,a.roomId,a.areaId].filter(Boolean).join(' / ')||'Site';}
export function FacilityAssetMarker({asset,status,selected,element,onHover,onSelect}:{asset:Asset;status:string;selected:boolean;element:(el:HTMLButtonElement|null)=>void;onHover:(id:string|null)=>void;onSelect:(id:string)=>void}){
 return <button ref={element} hidden data-asset-id={asset.id} data-status={status} data-asset-type={asset.type} className={'asset-marker '+(selected?'selected':'')} aria-label={asset.label} aria-pressed={selected} onPointerEnter={()=>onHover(asset.id)} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover(asset.id)} onBlur={()=>onHover(null)} onClick={()=>onSelect(asset.id)}><Icon name={ASSET_TYPES[asset.type].icon}/><i/>{asset.demo&&<span className="demo-mark">D</span>}</button>;
}
export function FacilityAssets({items,registry,selected,onSelect,project}:{items:Asset[];registry:AssetRegistry;selected:string|null;onSelect:(id:string)=>void;project:Project}){
 const markers=items.filter(a=>a.position!==null&&(!a.evidence||a.evidence.displayPolicy.review3dEligible));
 const elements=useRef(new Map<string,HTMLButtonElement>()),tip=useRef<HTMLDivElement>(null);const [hover,setHover]=useState<string|null>(null);
 const hovered=items.find(a=>a.id===hover);
 useEffect(()=>{let frame=0;
 const tick=()=>{for(const a of items){const el=elements.current.get(a.id),p=a.position?project(a.position):null;if(el){el.hidden=!p?.visible;if(p)el.style.transform='translate('+p.x+'px,'+p.y+'px) translate(-50%,-50%)';}
 if(a.id===hover&&tip.current){tip.current.hidden=!p?.visible;if(p)tip.current.style.transform='translate('+Math.max(8,Math.min(innerWidth-245,p.x+18))+'px,'+Math.max(85,Math.min(innerHeight-120,p.y-45))+'px)';}}
 frame=requestAnimationFrame(tick);};if(items.length)tick();return()=>cancelAnimationFrame(frame);
 },[items,project,hover]);
 return <div className="asset-overlay">{markers.map(a=><FacilityAssetMarker key={a.id} asset={a} status={registry.runtimeById.get(a.id)?.status||'unknown'} selected={selected===a.id} element={el=>{if(el)elements.current.set(a.id,el);else elements.current.delete(a.id)}} onHover={setHover} onSelect={onSelect}/>)}{hovered&&<div ref={tip} role="tooltip" className="world-tooltip glass asset-tooltip"><Icon name={ASSET_TYPES[hovered.type].icon}/><div><strong>{hovered.label}</strong><small>{ASSET_TYPES[hovered.type].label} · {location(hovered)}</small><small>{hovered.evidence?'DESIGN · Review position only':registry.runtimeById.get(hovered.id)?.status||'unknown'}{hovered.demo?' · DEMO':''}</small></div></div>}</div>;
}
export function FacilityAssetDetail({asset,runtime,onClose,embedded=false}:{asset:Asset;runtime?:FacilityAssetRuntimeState;onClose:()=>void;embedded?:boolean}){
 if(asset.evidence)return <DesignAssetDetail asset={asset} onClose={onClose} embedded={embedded}/>;
 const value=(v:unknown)=>typeof v==='object'?JSON.stringify(v):String(v);
 return <section className={'asset-detail '+(embedded?'':'glass floating-asset-detail')} aria-label="Asset detail"><div className="panel-title"><span className="eyebrow">{asset.demo?'DEMO ASSET':'CONNECTED ASSET'}</span><button aria-label="Close asset detail" onClick={onClose}><Icon name="close"/></button></div><h3><Icon name={ASSET_TYPES[asset.type].icon}/>{asset.label}</h3><p>{ASSET_TYPES[asset.type].label} · <span data-asset-status>{runtime?.status||'unknown'}</span></p><p>{location(asset)}</p><dl>{Object.entries({...asset.metadata,...runtime?.values}).map(([key,v])=><div key={key}><dt>{key}</dt><dd>{value(v)}</dd></div>)}</dl>{asset.demo&&<small>Synthetic test location</small>}</section>;
}


const buildingNames:Record<string,string>={office:'Sales Office',warehouse:'Warehouse',site:'Site',gate1:'Gate 1',gate2:'Gate 2'};
const readable=(v:string)=>v.replaceAll('_',' ').toLowerCase().replace(/^./,c=>c.toUpperCase());
function DesignAssetDetail({asset,onClose,embedded}:{asset:Asset;onClose:()=>void;embedded:boolean}){
 const e=asset.evidence!;
 return <section className={'asset-detail '+(embedded?'':'glass floating-asset-detail')} aria-label="Asset detail">
 <div className="panel-title"><span className="eyebrow">DESIGN ASSET</span><button aria-label="Close asset detail" onClick={onClose}><Icon name="close"/></button></div>
 <h3><Icon name={ASSET_TYPES[asset.type].icon}/>{asset.label}</h3><p>{buildingNames[asset.buildingId||'']||e.building} / {e.floor}{e.roomId&&` / ${e.roomId}`}</p>
 <div className="evidence-badges"><span>DESIGN</span><span className={asset.position?'review':'pending'}>{asset.position?'REVIEW POSITION':e.registrationStatus==='UNREGISTERED'?'UNREGISTERED':'LIST ONLY'}</span></div>
 <p className="evidence-message">{asset.position?'A design review location. Installation and mounting height have not been verified.':'No review marker is available. This record remains in the design inventory.'}</p>
 <dl><div><dt>Installation</dt><dd>Unverified</dd></div><div><dt>Telemetry</dt><dd>Not integrated</dd></div><div><dt>Drawing registration</dt><dd>{e.registrationStatus==='REGISTERED'?'Registered':'Unregistered'}</dd></div><div><dt>Mounting height</dt><dd>Not verified</dd></div><div><dt>Device model</dt><dd>Not available</dd></div></dl>
 {e.assetType==='CCTV'&&<p className="evidence-message">Camera identity and installed quantity are unresolved.{e.overlapGroupId?' This candidate has an unresolved overlap.':''} Height and pitch need verification.</p>}
 <details><summary>What still needs verification <b>{e.unresolvedFields.length}</b></summary><ul>{e.unresolvedFields.map((v,i)=><li key={i}>{readable(v.replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('.',' / '))}</li>)}</ul></details>
 <details><summary>Source evidence &amp; provenance</summary><dl>{Object.entries({'Source handle':e.sourceHandle,'Coordinate evidence':String(e.positionEvidence.registered),'Identity':e.identityStatus,'Display policy':e.displayPolicy.reviewState,'Mount context':e.mountContext||'Unresolved','Overlap':e.overlapGroupId?`${e.overlapGroupId} / ${e.overlapStatus}`:'No overlap group recorded'}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><ul>{e.evidenceNotes.map((v,i)=><li key={i}>{v}</li>)}</ul>{e.sourceRefs.map((r,i)=><p key={i}>{r.file}{r.sourceHandle&&` · ${r.sourceHandle}`}</p>)}</details>
 </section>;
}
export function FacilityAssetList({items,selected,onSelect,contextBuilding=null,contextFloor=null}:{items:Asset[];selected:string|null;onSelect:(id:string)=>void;contextBuilding?:string|null;contextFloor?:string|null}){
 const [query,setQuery]=useState(''),[type,setType]=useState(''),[building,setBuilding]=useState(contextBuilding||''),[floor,setFloor]=useState(contextFloor||''),[registration,setRegistration]=useState(''),[evidence,setEvidence]=useState('');
 const filtered=items.filter(a=>(a.label+' '+a.id+' '+a.buildingId+' '+a.floorId).toLowerCase().includes(query.toLowerCase())&&(!type||a.type===type)&&(!building||a.buildingId===building)&&(!floor||a.floorId===floor)&&(!registration||a.evidence?.registrationStatus===registration)&&(!evidence||(evidence==='review'?!!a.position:evidence==='list'?!a.position:evidence==='unverified'?a.evidence?.installationStatus==='UNVERIFIED':a.evidence?.positionEvidence.registered===evidence)));
 const clear=()=>{setQuery('');setType('');setBuilding('');setFloor('');setRegistration('');setEvidence('');};
 return <section className="asset-list" aria-label="Design asset register"><p>147 DESIGN records · Installation unverified</p>
 <input aria-label="Search design assets" placeholder="Search name or source handle" value={query} onChange={e=>setQuery(e.target.value)}/>
 <div className="register-filters">
 <select aria-label="Asset type" value={type} onChange={e=>setType(e.target.value)}><option value="">All asset types</option>{['cctv','wifi_ap','data_point','network_rack'].map(t=><option key={t} value={t}>{ASSET_TYPES[t as Asset['type']].label}</option>)}</select>
 <select aria-label="Building filter" value={building} onChange={e=>{setBuilding(e.target.value);setFloor('');}}><option value="">Entire facility</option>{[...new Set(items.map(a=>a.buildingId))].map(b=><option key={b} value={b}>{buildingNames[b||'']||b}</option>)}</select>
 <select aria-label="Floor filter" value={floor} onChange={e=>setFloor(e.target.value)}><option value="">All floors / areas</option>{[...new Set(items.filter(a=>!building||a.buildingId===building).map(a=>a.floorId))].map(f=><option key={f} value={f}>{f}</option>)}</select>
 <select aria-label="Registration filter" value={registration} onChange={e=>setRegistration(e.target.value)}><option value="">Any registration</option><option value="REGISTERED">Registered</option><option value="UNREGISTERED">Unregistered</option></select>
 <select aria-label="Evidence filter" value={evidence} onChange={e=>setEvidence(e.target.value)}><option value="">All evidence states</option><option value="review">Review position</option><option value="list">List only</option><option value="unverified">Installation unverified</option>{[...new Set(items.map(a=>String(a.evidence?.positionEvidence.registered)))].map(v=><option key={v} value={v}>{readable(v)}</option>)}</select>
 <button onClick={clear}>Clear filters</button></div>
 <p className="result-count" role="status">{filtered.length} results · {filtered.filter(a=>a.position).length} review positions</p>
 <div className="register-results">{filtered.map(a=><button key={a.id} data-record-id={a.id} aria-pressed={a.id===selected} onClick={()=>onSelect(a.id)}><Icon name={ASSET_TYPES[a.type].icon}/><span>{a.label}<small>{buildingNames[a.buildingId||'']} / {a.floorId}</small></span><em>{a.position?'Review ↗':a.evidence?.registrationStatus==='UNREGISTERED'?'Unregistered':'List only'}</em></button>)}</div>
 {!filtered.length&&<div className="empty-register"><strong>No matching design records</strong><p>Try another floor or clear the filters to search the whole facility.</p><button onClick={clear}>Show all records</button></div>}
 </section>;
}
