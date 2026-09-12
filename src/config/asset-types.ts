import type {FacilityAssetType} from '@/types/facility-assets';
export const ASSET_TYPES:Record<FacilityAssetType,{label:string;layer:string;icon:string}>={
 cctv:{label:'Camera',layer:'cctv',icon:'camera'},wifi_ap:{label:'Wi-Fi AP',layer:'wifi',icon:'wifi'},
 network:{label:'Network',layer:'network',icon:'network'},access_control:{label:'Access Control',layer:'access',icon:'lock'},
 fire_sensor:{label:'Fire Sensor',layer:'fire',icon:'fire'},sensor:{label:'Sensor',layer:'sensor',icon:'sensor'},
 iot:{label:'IoT',layer:'iot',icon:'sensor'},meeting_room:{label:'Meeting Room',layer:'meeting',icon:'meeting'},
 it_equipment:{label:'IT Equipment',layer:'it',icon:'network'}
};
