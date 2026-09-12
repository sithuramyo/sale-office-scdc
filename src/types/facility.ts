export type SpatialEntityType='facility'|'building'|'floor'|'room'|'area'|'device';
export type ViewerMode='OVERVIEW'|'BUILDING_FOCUS'|'FLOOR_FOCUS'|'SYSTEM_LAYER'|'DEVICE_FOCUS';
export interface SpatialEntity {id:string;type:SpatialEntityType;label:string;subtitle:string;parentId?:string;buildingId?:string;floorId?:string;sourceKeys:string[];status?:'online'|'warning'|'offline'|'unknown';metadata?:Record<string,unknown>}
export interface FloorContract {id:string;label:string;sourceKeys:string[];hideAboveKeys:string[];focusBounds:{min:[number,number,number];max:[number,number,number]}}
export interface Manifest {sha256:string;bytes:number;meshNodes:number;floorKeys:string[];entities:SpatialEntity[];layers:Record<string,string[]>;floors:FloorContract[]}
export interface ViewerState {selectedAsset:string|null;selectedEntity:string|null;hoveredEntity:string|null;selectedBuilding:string|null;selectedFloor:string|null;activeLayers:Record<string,boolean>;activeCameraPreset:string;viewerMode:ViewerMode;drawerOpen:boolean;dayNightMode:'day'|'night';isolated:boolean}
