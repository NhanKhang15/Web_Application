import { useCallback, useEffect, useMemo, useRef, useState } from "react";


export function useAuction({
    auctionId,
    initialPrice = 0,
    minIncrement = 100,
    softCloseSeconds = 60,
    startsAt: startsAtISO,
    endsAt: endsAtISO,
}) {
    const storageKey = `auction:${auctionId}`;
    const parsedStartsAt = useMemo(() => {
        const value = startsAtISO ? new Date(startsAtISO).getTime() : Date.now();
        return Number.isFinite(value) ? value : Date.now();
    }, [startsAtISO]);
    const parsedEndsAt = useMemo(() => new Date(endsAtISO).getTime(), [endsAtISO]);

    const loadSavedState = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch {
            return {};
        }
    };

    const buildInitialState = () => {
        const saved = loadSavedState();
        const savedEndsAt = typeof saved.endsAt === "number" ? saved.endsAt : null;
        const hasActiveSavedAuction = !!(savedEndsAt && savedEndsAt > Date.now());

        return {
            bids: hasActiveSavedAuction && Array.isArray(saved.bids) ? saved.bids : [],
            endsAt: hasActiveSavedAuction ? savedEndsAt : parsedEndsAt,
        };
    };

    const initialStateRef = useRef(null);
    if (initialStateRef.current === null) {
        initialStateRef.current = buildInitialState();
    }

    const [bids, setBids] = useState(initialStateRef.current.bids);


    const basePriceNum = useMemo(() => Number(String(initialPrice).replace(/[^\d.]/g, "")) || 0, [initialPrice]);


    const currentBid = useMemo(() => (bids[0]?.amount ?? basePriceNum), [bids, basePriceNum]);


    const [endsAt, setEndsAt] = useState(initialStateRef.current.endsAt);


    const [now, setNow] = useState(Date.now());
    const tickRef = useRef(null);


    // persist
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify({ bids, endsAt }));
    }, [bids, endsAt, storageKey]);


    // timer
    useEffect(() => {
        tickRef.current && clearInterval(tickRef.current);
        tickRef.current = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(tickRef.current);
    }, []);


    const secondsLeft = useMemo(() => {
        const totalDuration = Math.max(0, endsAt - parsedStartsAt);
        const elapsedSinceStart = Math.max(0, now - parsedStartsAt);
        return Math.max(0, Math.floor((totalDuration - elapsedSinceStart) / 1000));
    }, [endsAt, now, parsedStartsAt]);
    const isEnded = secondsLeft === 0;


    const nextMinBid = useMemo(() => currentBid + minIncrement, [currentBid, minIncrement]);


    const placeBid = useCallback((amount, bidder = "You") => {
        const amountNum = Number(amount);
        if (!Number.isFinite(amountNum)) throw new Error("ERR_INVALID_NUMBER");
        if (isEnded) throw new Error("ERR_AUCTION_ENDED");
        if (amountNum < nextMinBid) {
            // Ném lỗi với key và biến
            const error = new Error("ERR_BID_TOO_LOW");
            error.context = { minBid: nextMinBid.toLocaleString() }; // Truyền biến
            throw error;
        }

        setBids((prev) => [{ id: crypto.randomUUID(), bidder, amount: amountNum, time: Date.now() }, ...prev]);

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
        reset,
    }
}