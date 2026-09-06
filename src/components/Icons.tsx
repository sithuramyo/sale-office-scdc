export function IconDefs(){return <svg aria-hidden="true" className="icon-defs" xmlns="http://www.w3.org/2000/svg"><defs>
    <symbol id="i-cube" viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z M4 7.5 12 12l8-4.5M12 12v9M8 5.25l8 4.5"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></symbol>
    <symbol id="i-office" viewBox="0 0 24 24"><path d="M5 21V3h12v18M3 21h18M9 7h1m3 0h1M9 11h1m3 0h1M9 15h1m3 0h1M9 21v-3h4v3"/></symbol>
    <symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14ZM7 21V11h10v10M7 14h10M7 17h10"/></symbol>
    <symbol id="i-site" viewBox="0 0 24 24"><path d="m3 7 6-3 6 3 6-3v16l-6 3-6-3-6 3ZM9 4v16m6-13v16"/></symbol>
    <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></symbol>
    <symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 5 5 3-3 4 4"/></symbol>
    <symbol id="i-reset" viewBox="0 0 24 24"><path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
    <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
    <symbol id="i-expand" viewBox="0 0 24 24"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/></symbol>
    <symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
    <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></symbol>
    <symbol id="i-play" viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z"/></symbol>
    <symbol id="i-pause" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></symbol>
    <symbol id="i-hand" viewBox="0 0 24 24"><path d="M8 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v9c0 4-3 7-7 7-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-2l2 2"/></symbol>
  </defs></svg>};
export function Icon({name,className=""}:{name:string;className?:string}){return <svg aria-hidden="true" className={className}><use href={"#i-"+name}/></svg>}
