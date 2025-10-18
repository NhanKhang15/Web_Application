import { useCallback, useEffect, useMemo, useRef, useState } from "react";


export function useAuction({
                               auctionId,
                               initialPrice = 0,
                               minIncrement = 100, // minimum step
                               softCloseSeconds = 60, // auto-extend if bid in last N seconds
                               endsAt: endsAtISO, // ISO string like "2025-10-30T12:00:00Z"
                           }) {
    const storageKey = `auction:${auctionId}`;
    const parsedEndsAt = useMemo(() => new Date(endsAtISO).getTime(), [endsAtISO]);


    const [bids, setBids] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
            return saved.bids || [];
        } catch {
            return [];
        }
    });


    const basePriceNum = useMemo(() => Number(String(initialPrice).replace(/[^\d.]/g, "")) || 0, [initialPrice]);


    const currentBid = useMemo(() => (bids[0]?.amount ?? basePriceNum), [bids, basePriceNum]);


    const [endsAt, setEndsAt] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
            return saved.endsAt || parsedEndsAt;
        } catch {
            return parsedEndsAt;
        }
    });


    const [now, setNow] = useState(Date.now());
    const tickRef = useRef(null);


// persist
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify({bids, endsAt}));
    }, [bids, endsAt, storageKey]);


// timer
    useEffect(() => {
        tickRef.current && clearInterval(tickRef.current);
        tickRef.current = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(tickRef.current);
    }, []);


    const secondsLeft = Math.max(0, Math.floor((endsAt - now) / 1000));
    const isEnded = secondsLeft === 0;


    const nextMinBid = useMemo(() => currentBid + minIncrement, [currentBid, minIncrement]);


    const placeBid = useCallback((amount, bidder = "You") => {
        const amountNum = Number(amount);
        if (!Number.isFinite(amountNum)) throw new Error("Invalid number");
        if (isEnded) throw new Error("Auction ended");
        if (amountNum < nextMinBid) throw new Error(`Bid must be ≥ ${nextMinBid.toLocaleString()}`);


        setBids((prev) => [{id: crypto.randomUUID(), bidder, amount: amountNum, time: Date.now()}, ...prev]);


// soft close: extend if in last softCloseSeconds
        const secs = Math.floor((endsAt - Date.now()) / 1000);
        if (secs <= softCloseSeconds) {
            setEndsAt(Date.now() + (softCloseSeconds + 1) * 1000);
        }
    }, [isEnded, nextMinBid, endsAt, softCloseSeconds]);


    const reset = useCallback(() => {
        setBids([]);
        setEndsAt(parsedEndsAt);
        localStorage.removeItem(storageKey);
    }, [parsedEndsAt, storageKey]);


    return {
        bids,
        currentBid,
        nextMinBid,
        placeBid,
        secondsLeft,
        isEnded,
        endsAt,
    }
}