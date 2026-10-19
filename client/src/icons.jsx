const P={
home:<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>,
orders:<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></>,
msg:<path d="M4 5h16v11H9l-5 4z"/>,
user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></>,
work:<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/></>,
pin:<><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
bell:<><path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
gear:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></>,
search:<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
mic:<><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
spark:<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></>,
map:<><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></>,
list:<path d="M4 6h16M4 12h16M4 18h16"/>,
nav:<path d="M4 11l16-7-7 16-2-7z"/>,
locate:<><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></>,
back:<path d="M15 5l-7 7 7 7"/>,
chev:<path d="M6 9l6 6 6-6"/>,
tailor:<><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/></>,
food:<><path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M8 8c-1-1.5 1-2 0-3.5M12 8c-1-1.5 1-2 0-3.5M16 8c-1-1.5 1-2 0-3.5"/></>,
beauty:<><rect x="8" y="12" width="8" height="9" rx="1"/><path d="M9 12V8l3-5 3 5v4"/></>,
tutor:<path d="M4 5h16v11H9l-5 4z"/>,
online:<><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/></>
};
export const Icon=({n})=><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[n]}</svg>;
export const CatIcon=({n})=><Icon n={n}/>;
