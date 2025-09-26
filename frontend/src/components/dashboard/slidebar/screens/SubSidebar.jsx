import React from "react";
import { subSidebarItems } from "../lib/subSidebarItems";

export default function SubSidebar({
  active,
  onChange,
  topClass = "top-1",
  bottomClass = "bottom-6",
  leftClass = "left-6",
}) {
  return (
    <aside
      className={`
        absolute ${leftClass} ${topClass} ${bottomClass}
        flex w-[72px] bg-white rounded-[15px]
        flex-col items-center py-8 space-y-8
        z-10
      `}
      aria-label="Secondary navigation"
      role="navigation"
    >
      {subSidebarItems.map((it) => {
        const isActive = active === it.key;
        const isDisabled = it.disabled;

        return (
          <button
            key={it.key}
            type="button"
            title={it.title}
            aria-label={it.title}
            aria-pressed={isActive}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange?.(it.key)}
            className={`relative group outline-none ${isDisabled ? "opacity-40 cursor-default" : "cursor-pointer"
              }`}
          >
            {/* thanh chỉ thị active NẰM TRONG mép trái của sub-sidebar */}
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2
                          h-8 w-[4px] rounded-full transition
                          ${isActive ? "bg-[#457DFB] opacity-100" : "bg-transparent opacity-0"}`}
            />
            <span
              className={`block rounded-xl p-2 transition
                          ${isActive ? "ring-2 ring-[#457DFB]/40" : "ring-0"}
                          group-hover:bg-neutral-100
                          focus-visible:ring-2 focus-visible:ring-[#457DFB]/60`}
            >
              <img
                src={it.icon}
                alt={it.title}
                className={`
                  ${it.key === "line" ? "w-[21px] h-[42px]" : ""}
                  ${it.key === "user" ? "w-[31px] h-[30px]" : ""}
                  ${it.key === "bell" ? "w-8 h-8" : ""}
                  ${it.key === "note" ? "w-[15px] h-6" : ""}
                  ${it.key === "chart" ? "w-[37px] h-[37px]" : ""}
                `}
              />
            </span>
          </button>
        );
      })}
    </aside>
  );
}
