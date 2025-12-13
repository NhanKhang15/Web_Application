import React, { useMemo } from "react";
import { motion } from "framer-motion";
import SubSidebar from "../../slidebar/screens/SubSidebar";

export default function CardShell({
    children,
    subKey,
    onSubChange,
    variant = "sub",
    customLeft = null,
    plClass,
    stickyTop,
}) {
    const { cardClasses, contentClasses, extraPaddingClasses } = useMemo(() => {
        const defaultLeftPad =
            variant === "sub"
                ? "pl-0 md:pl-24 lg:pl-32"  // No left padding on mobile
                : "pl-0 md:pl-6 lg:pl-10";
        const leftPad = plClass ?? defaultLeftPad;

        const PC_EXTRA_PL = "pl-0 md:pl-[clamp(60px,4.7vw,96px)]";

        return {
            cardClasses:
                "relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-[15px] shadow-[0_2px_15px_rgba(0,0,0,0.15)] min-h-screen h-auto z-20 overflow-hidden",
            contentClasses: `p-3 sm:p-6 lg:p-8 ${leftPad} min-h-0 min-w-0 flex flex-col flex-1`,
            extraPaddingClasses: PC_EXTRA_PL,
        };
    }, [variant, plClass]);

    return (
        <div className={`${cardClasses} flex flex-col min-w-0`}>
            {/* SubSidebar: on mobile it's in flow, on desktop it's sticky/absolute */}
            {subKey && onSubChange && (
                <>
                    {/* Mobile: SubSidebar in normal flow at top */}
                    <div className="md:hidden">
                        <SubSidebar active={subKey} onChange={onSubChange} />
                    </div>

                    {/* Desktop: Sticky SubSidebar */}
                    <motion.div
                        className="hidden md:block"
                        style={{
                            position: "sticky",
                            top: stickyTop ?? 0,
                            zIndex: 39,
                            willChange: "top",
                        }}
                    >
                        <SubSidebar active={subKey} onChange={onSubChange} />
                    </motion.div>
                </>
            )}

            {/* Custom left element (for auction/seller sidebars) - uses flex layout */}
            {!subKey && customLeft ? (
                <>
                    {/* Mobile: customLeft renders its own mobile view internally */}
                    <div className="md:hidden">
                        {customLeft}
                    </div>

                    {/* Desktop: Flex row with sidebar and content side by side */}
                    <div className="hidden md:flex flex-1 overflow-hidden">
                        {/* Sidebar - pushes content */}
                        <div className="flex-shrink-0">
                            {customLeft}
                        </div>
                        {/* Content - takes remaining space */}
                        <div className={`flex-1 min-w-0 p-2 sm:p-3 lg:p-4`}>
                            {children}
                        </div>
                    </div>

                    {/* Mobile content */}
                    <div className={`md:hidden overflow-x-hidden ${contentClasses}`}>
                        {children}
                    </div>
                </>
            ) : (
                <div className={contentClasses}>
                    <div className={extraPaddingClasses}>{children}</div>
                </div>
            )}
        </div>
    );
}
