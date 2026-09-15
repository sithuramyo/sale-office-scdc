/** World positions use Three.js Y-up metres; sourcePosition remains native DXF. */
export interface DesignPosition {x:number;y:number|null;z:number}
export interface DesignAsset {
 id:string;assetType:'CCTV'|'WIFI_AP'|'DATA_POINT'|'NETWORK_RACK';displayName:string;
 building:string;floor:string;roomId:string|null;sourceHandle:string;
 lifecycle:'DESIGN';registrationStatus:'REGISTERED'|'UNREGISTERED';installationStatus:'UNVERIFIED';telemetryStatus:'NOT_INTEGRATED';
 registeredPosition:DesignPosition|null;actualPosition:null;visualPosition:DesignPosition|null;
 mountContext:string|null;mountHeight:null;mountHeightStatus:string;
 positionEvidence:Record<string,unknown>;orientation:Record<string,unknown>;
 identityStatus:string;overlapGroupId:string|null;overlapStatus:string|null;
 evidenceNotes:string[];unresolvedFields:string[];sourceRefs:{file:string;sourceHandle?:string}[];
 displayPolicy:{review3dEligible:boolean;reviewState:string;installedAssetDisplayEligible:boolean};
}
