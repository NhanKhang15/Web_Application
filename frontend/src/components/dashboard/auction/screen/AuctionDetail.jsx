import React, { useState, useMemo } from "react";
import Slider from "react-slick";
import { Clock, Heart, ChevronLeft, ChevronRight, Timer, CheckCircle2, AlertCircle, History } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuction } from "../hook/useAuction";

export default function AuctionDetail({ item }) {
    // ======== Thông tin sản phẩm gốc ========
    const product = {
        id: item?.id || 1,
        name: item?.car || "AUDI RS7",
        model: "Sportback 4.0 TFSI quattro",
        price: "81,890.00",
        bids: 10,
        closes: "Sun 30th Sep, 12:00 pm",
        images: [
            "https://cdn.motor1.com/images/mgl/x0k7O/s1/audi-rs7-sportback.webp",
            "https://cdn.motor1.com/images/mgl/9ooWp/s1/2021-audi-rs7-sportback-interior.jpg",
            "https://cdn.motor1.com/images/mgl/ko8k6/s1/2021-audi-rs7-sportback-engine.jpg",
        ],
        features: {
            Year: "07-2020",
            "Km Driven": "118,605 km",
            Price: "$81,890.00",
            Fuel: "Petrol",
            Transmission: "Automatic",
            Power: "600 cv – 441 kW",
            Color: "Grey",
            Interior: "Black",
            Seats: "4",
            Doors: "5",
            "Emission Class": "Euro 6d-Temp",
            "CO2 Emission": "265g CO2/km",
            "Urban Consumption": "16.3L/100km",
            "Extra Urban": "8.9L/100km",
            Combined: "11.6L/100km",
        },
        shipping: {
            Shipping: "No ship! Need to meet owner.",
            Location: "Saitama, Tokyo, Japan",
            "Ships to": "None",
            Delivery: "None",
            Return: "None",
        },
        similar: [
            {
                id: 1,
                name: "Nissan 650fs",
                year: "1998",
                img: "https://auto.hindustantimes.com/htmobile1/nissan_xtrail/images/exterior_nissan-x-trail_front-left-side_600x400.jpg?imwidth=420",
            },
            {
                id: 2,
                name: "Mustang black",
                year: "2017",
                img: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?fm=jpg&q=60&w=3000",
            },
            {
                id: 3,
                name: "BMW m5 super sport",
                year: "2016",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6gZg4Z3OiDLAM15xpJIH59Uznh4ZxbMaQtw&s",
            },
        ],
    };

    // ======== Hook đấu giá (đếm ngược, bid, lưu lịch sử) ========
    const endsInISO = useMemo(() => new Date(Date.now() + 45 * 60 * 1000).toISOString(), []);
    const { bids, currentBid, nextMinBid, placeBid, secondsLeft, isEnded, reset } = useAuction({
        auctionId: product.id,
        initialPrice: product.price,
        minIncrement: 100,
        softCloseSeconds: 60,
        endsAt: endsInISO,
    });

    const [amount, setAmount] = useState("");
    const [msg, setMsg] = useState(null);

    const fmt = (n) => Number(n).toLocaleString();
    const hhmmss = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
    };

    const submit = () => {
        setMsg(null);
        try {
            placeBid(Number(amount));
            setMsg({ ok: true, text: `✅ Bid placed: $${fmt(amount)}` });
            setAmount("");
        } catch (e) {
            setMsg({ ok: false, text: e.message });
        }
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
    };

    return (
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full max-w-[1100px] ml-0 px-5 py-4 text-gray-800 dark:text-gray-100 rounded-xl">
            {/* LEFT COLUMN */}
            <div className="flex-1 px-6 pt-4 pb-10 bg-gray-50 dark:bg-[#0B0F13] rounded-xl shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{product.name}</span>
                </div>

                <div className="mb-6 rounded-lg shadow-md w-full max-w-[800px] mx-auto overflow-visible">
                    <Slider {...settings}>
                        {product.images.map((src, i) => (
                            <div key={i}>
                                <img src={src} alt={`slide-${i}`} className="w-full h-[400px] object-cover rounded-lg" />
                            </div>
                        ))}
                    </Slider>
                </div>

                <div className="flex flex-wrap gap-3 mb-8 max-w-[800px] mx-auto">
                    {product.images.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`thumb-${i}`}
                            className="w-24 h-20 rounded-lg border border-gray-300 dark:border-gray-700 object-cover cursor-pointer hover:opacity-80"
                        />
                    ))}
                    <div className="w-24 h-20 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-medium">
                        +27
                    </div>
                </div>

                <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
                    <h2 className="text-lg font-bold mb-3 uppercase">Description</h2>
                    <h3 className="font-semibold mb-2 text-md">Features - {product.name}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                        {Object.entries(product.features).map(([key, value]) => (
                            <p key={key}>
                                <span className="font-medium">{key}:</span> {value}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:max-w-[360px] shrink-0 bg-white dark:bg-[#14191F] rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-5 space-y-5">
                <div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{product.model}</p>

                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Closes in:</span>
                        <span className={`font-semibold ${isEnded ? "text-red-500" : "text-green-600"}`}>
                            {hhmmss(secondsLeft)}
                        </span>
                    </div>

                    <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                        <Heart className="w-4 h-4" /> Add to Watchlist
                    </button>
                </div>

                {/* Bid section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 mb-1">CURRENT BID:</p>
                    <h2 className="text-3xl font-extrabold text-green-600">${fmt(currentBid)}</h2>
                    <p className="text-xs text-gray-400">{bids.length} bids</p>

                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Timer className="w-4 h-4 mr-1" /> Next min bid: ${fmt(nextMinBid)}
                    </div>

                    {msg && (
                        <div className={`mt-3 text-sm flex items-center gap-2 ${msg.ok ? "text-green-600" : "text-red-500"}`}>
                            {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {msg.text}
                        </div>
                    )}

                    <div className="flex gap-2 mt-4">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isEnded}
                            placeholder={`≥ ${nextMinBid}`}
                            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-[#0B0F13]"
                        />
                        <button
                            onClick={submit}
                            disabled={isEnded}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-semibold"
                        >
                            Submit
                        </button>
                    </div>

                    <div className="mt-2 flex gap-2 text-xs">
                        {[50, 100, 250].map((s) => (
                            <button
                                key={s}
                                onClick={() => setAmount(String(nextMinBid + s))}
                                className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700"
                            >
                                +{s}
                            </button>
                        ))}
                        <button onClick={reset} className="ml-auto px-2 py-1 rounded border border-gray-300 dark:border-gray-700">
                            Reset demo
                        </button>
                    </div>
                </div>

                {/* Bid history */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h2 className="text-md font-semibold mb-3 uppercase flex items-center gap-2">
                        <History className="w-4 h-4" /> Bid History
                    </h2>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {bids.length === 0 && <p className="text-xs text-gray-500">No bids yet.</p>}
                        {bids.map((b) => (
                            <div key={b.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-[#1A1F25] rounded-md px-3 py-2">
                                <span>{b.bidder}</span>
                                <span>${fmt(b.amount)}</span>
                                <span className="text-xs text-gray-500">{new Date(b.time).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h2 className="text-md font-semibold mb-3 text-purple-600 uppercase">Shipping & Payment</h2>
                    <div className="space-y-2 text-sm leading-relaxed">
                        {Object.entries(product.shipping).map(([key, value]) => (
                            <p key={key}>
                                <span className="font-medium">{key}:</span> {value}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Similar Items */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h2 className="text-md font-semibold mb-3 uppercase">Similar Items</h2>
                    <div className="space-y-3">
                        {product.similar.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center gap-3 bg-gray-50 dark:bg-[#1A1F25] rounded-md p-2 hover:bg-gray-100 dark:hover:bg-[#222831] cursor-pointer"
                            >
                                <img src={s.img} alt={s.name} className="w-14 h-10 object-cover rounded" />
                                <div>
                                    <p className="font-medium text-sm">{s.name}</p>
                                    <p className="text-xs text-gray-500">{s.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Custom arrows
function SampleNextArrow({ onClick }) {
    return (
        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/60 hover:bg-gray-800 text-white rounded-full p-2 z-10" onClick={onClick}>
            <ChevronRight className="w-5 h-5" />
        </button>
    );
}
function SamplePrevArrow({ onClick }) {
    return (
        <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/60 hover:bg-gray-800 text-white rounded-full p-2 z-10" onClick={onClick}>
            <ChevronLeft className="w-5 h-5" />
        </button>
    );
}
