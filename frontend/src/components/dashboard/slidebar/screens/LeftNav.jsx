// src/slidebar/screens/LeftNav.jsx
import React from "react";
import { navigationItems } from "../lib/navigationItems";

export default function LeftNav({ activeKey: controlledKey, onChange }) {
  const [internalKey, setInternalKey] = React.useState(controlledKey || "user");
  const activeKey = controlledKey ?? internalKey;

  const navRef = React.useRef(null);
  const itemRefs = React.useRef({});
  const [marker, setMarker] = React.useState({ top: 0, height: 64 });

  React.useLayoutEffect(() => {
    const el = itemRefs.current[activeKey];
    if (el) setMarker({ top: el.offsetTop, height: el.offsetHeight || 64 });
  }, [activeKey]);

  const selectItem = (key) => {
    if (!controlledKey) setInternalKey(key);
    onChange?.(key);
  };

  return (
    // ~120px @1920px, nhưng co giãn bằng clamp (tỉ lệ)
    <aside className="flex w-[clamp(6rem,6.25vw,9rem)] bg-[#efeff2] flex-col h-full">
      {/* KHÔNG còn header avatar ở đây */}
      <div className="flex-1 relative">
        {/* Vạch đỏ active */}
        <div
          className="absolute left-0 w-[0.35vw] bg-[#e43137] rounded-r-full transition-all duration-300"
          style={{ top: marker.top, height: marker.height }}
          aria-hidden
        />
        {/* Highlight box */}
        <div
          className="absolute left-[0.3vw] w-[calc(100%-0.6vw)] bg-white rounded-md shadow-[0_0.2rem_0.35rem_rgba(0,0,0,0.16)] transition-all duration-300"
          style={{ top: marker.top, height: marker.height }}
          aria-hidden
        />
        <nav ref={navRef} className="pt-6 relative" role="tablist" aria-orientation="vertical">
          <ul>
            {navigationItems.map((n) => {
              const isActive = n.key === activeKey;
              return (
                <li key={n.key}>
                  <button
                    ref={(el) => (itemRefs.current[n.key] = el)}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectItem(n.key)}
                    className={`h-[8vh] min-h-14 w-full relative z-10 flex flex-col items-center justify-center mb-6 outline-none
                      ${isActive ? "text-[#e43137]" : "text-[#122025] hover:text-[#e43137]/80"}
                      focus-visible:ring-2 focus-visible:ring-[#e43137]/40`}
                  >
                    <img
                      src={n.icon}
                      alt={n.label}
                      className="w-5 h-5 mb-1 pointer-events-none transition duration-200"
                      style={{
                        filter: isActive
                          ? "invert(19%) sepia(97%) saturate(5219%) hue-rotate(354deg) brightness(97%) contrast(105%)"
                          : "none",
                      }}
                    />
                    <span className={`text-[0.7rem] tracking-wide ${isActive ? "font-bold text-[#e43137]" : "font-normal text-[#122025]"}`}>
                      {n.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
