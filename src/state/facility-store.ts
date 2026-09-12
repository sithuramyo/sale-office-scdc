import type {ViewerState} from '@/types/facility';
export const initialState:ViewerState={selectedEntity:null,hoveredEntity:null,selectedBuilding:null,selectedFloor:null,activeLayers:{buildings:true,roads:true,site:true,landscape:true},activeCameraPreset:'overview',viewerMode:'OVERVIEW',drawerOpen:false,dayNightMode:'day',isolated:false};
export type Action={type:'select';id:string;building:boolean}|{type:'floor';id:string}|{type:'restore'}|{type:'reset'}|{type:'layer';id:string;visible:boolean}|{type:'isolate'}|{type:'close'}|{type:'hover';id:string|null}|{type:'preset';id:string}|{type:'night'};
export function reducer(s:ViewerState,a:Action):ViewerState{
 switch(a.type){
 case 'select':return {...s,selectedEntity:a.id,selectedBuilding:a.building?a.id:null,selectedFloor:null,drawerOpen:true,viewerMode:'BUILDING_FOCUS',activeCameraPreset:a.id,isolated:false};
 case 'floor':return {...s,selectedFloor:a.id,selectedBuilding:'office',selectedEntity:'office',isolated:false,viewerMode:'FLOOR_FOCUS'};
 case 'restore':return {...s,selectedFloor:null,isolated:false,viewerMode:s.selectedEntity?'BUILDING_FOCUS':'OVERVIEW'};
 case 'reset':return {...initialState,dayNightMode:s.dayNightMode,activeLayers:{...initialState.activeLayers}};
 case 'layer':return {...s,activeLayers:{...s.activeLayers,[a.id]:a.visible}};
 case 'isolate':return {...s,selectedFloor:null,viewerMode:'BUILDING_FOCUS',isolated:!s.isolated};
 case 'close':return {...s,drawerOpen:false};
 case 'hover':return {...s,hoveredEntity:a.id};
 case 'preset':return {...s,activeCameraPreset:a.id};
 case 'night':return {...s,dayNightMode:s.dayNightMode==='day'?'night':'day'};
 }
}
