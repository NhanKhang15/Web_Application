// src/widget/sceens/CardShell.jsx
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
  stickyTop, // <<< thêm prop để nhận top động (equals contentPadTop)
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
        "relative bg-white rounded-[15px] shadow-[0_2px_15px_rgba(0,0,0,0.15)] min-h-0 z-20",
      contentClasses: `p-4 sm:p-6 lg:p-8 ${leftPad} min-h-0 flex flex-col`,
      extraPaddingClasses: PC_EXTRA_PL,
    };
  }, [variant, plClass]);

  return (
    <div className={cardClasses}>
      {variant === "sub" ? (
        // Sub nav stick dưới header (top = stickyTop động)
        <motion.div
          style={{
            position: "sticky",
            top: stickyTop ?? 0,
            zIndex: 39, // dưới header (50), trên nền
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
