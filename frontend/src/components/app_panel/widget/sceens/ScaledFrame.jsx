import React from "react";
import { useScale } from "../../../../lib/useScale";

// A wrapper that fixes the design canvas size and scales uniformly to fit
// the viewport, preserving layout proportions even when the browser zooms.
export default function ScaledFrame({
    children,
    baseWidth = 1920,
    baseHeight = 1080,
    className = "",
    mode = "cover", 
}) {
    const { scale, scaleX, scaleY, canvasWidth, canvasHeight } = useScale({
        baseWidth,
        baseHeight,
    });

    const outerStyle = {
        // center the scaled canvas
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#efeff2",
    };

    const innerStyle = {
        width: canvasWidth,
        height: canvasHeight,
        transform:
            mode === "cover"
                ? `scale(${scaleX}, ${scaleY})`
                : `scale(${scale})`,
        transformOrigin: "top left",
    };

    return (
        <div style={outerStyle} className={className}>
            <div style={innerStyle}>
                {children}
            </div>
        </div>
    );
}


