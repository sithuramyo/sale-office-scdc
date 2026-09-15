import type {DesignAsset} from './design-asset';
import type {SpatialEntity} from './facility';
export type FacilityAssetType='data_point'|'network_rack'|'cctv'|'wifi_ap'|'network'|'access_control'|'fire_sensor'|'sensor'|'iot'|'meeting_room'|'it_equipment';
export type AssetStatus=NonNullable<SpatialEntity['status']>;
/** Coordinates are native Three.js / glTF Y-up world metres. No conversion. */
export interface FacilityAssetDefinition extends Pick<SpatialEntity,'id'|'label'|'parentId'|'buildingId'|'floorId'|'metadata'> {
 type:FacilityAssetType;facilityId?:string;roomId?:string;areaId?:string;
 position:[number,number,number]|null;evidence?:DesignAsset;rotation?:[number,number,number];enabled?:boolean;demo?:boolean;
}
export interface FacilityAssetRuntimeState {assetId:string;status:AssetStatus;observedAt?:string;values?:Record<string,unknown>}
/** Future API adapters update runtime state without changing spatial definitions. */
export interface FacilityAssetRuntimeSnapshot {states:ReadonlyArray<FacilityAssetRuntimeState>;receivedAt?:string}
