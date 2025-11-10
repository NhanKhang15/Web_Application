import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Portal({ children }) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        let el = document.getElementById("portal-root");
        if (!el) {
            el = document.createElement("div");
            el.id = "portal-root";
            document.body.appendChild(el);
        }
        setContainer(el);
    }, []);

    return container ? createPortal(children, container) : null;
}
