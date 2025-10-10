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
                ? "pl-24 md:pl-32 lg:pl-36"
                : "pl-6 md:pl-10 lg:pl-[320px]";
        const leftPad = plClass ?? defaultLeftPad;

        const PC_EXTRA_PL = "pl-[clamp(60px,4.7vw,96px)]";

        return {
            cardClasses:
                "relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-[15px] shadow-[0_2px_15px_rgba(0,0,0,0.15)] min-h-screen h-auto z-20",
            contentClasses: `p-4 sm:p-6 lg:p-8 ${leftPad} min-h-0 min-w-0 flex flex-col flex-1`,
            extraPaddingClasses: PC_EXTRA_PL,
        };
    }, [variant, plClass]);

    return (
        <div className={`${cardClasses} flex flex-col min-w-0`}>
            {/* 👇 Chỉ hiển thị SubSidebar nếu được truyền subKey & onSubChange */}
            {subKey && onSubChange ? (
                <motion.div
                    style={{
                        position: "sticky",
                        top: stickyTop ?? 0,
                        zIndex: 39,
                        willChange: "top",
                    }}
                >
                    <SubSidebar active={subKey} onChange={onSubChange} />
                </motion.div>
            ) : (
                customLeft
            )}

            <div className={contentClasses}>
                <div className={extraPaddingClasses}>{children}</div>
            </div>
        </div>
    );
}
