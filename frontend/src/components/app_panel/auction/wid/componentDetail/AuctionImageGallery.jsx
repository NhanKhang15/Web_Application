import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// --- Custom Arrows cho Thumbnails (Giữ nguyên) ---
function ThumbNextArrow({ onClick, className }) {
    const isDisabled = className && className.includes("slick-disabled");
    return (
        <button
            type="button"
            className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white shadow-sm transition-all ${isDisabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onClick={onClick}
        >
            <ChevronRight className="w-4 h-4" />
        </button>
    );
}

function ThumbPrevArrow({ onClick, className }) {
    const isDisabled = className && className.includes("slick-disabled");
    return (
        <button
            type="button"
            className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white shadow-sm transition-all ${isDisabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onClick={onClick}
        >
            <ChevronLeft className="w-4 h-4" />
        </button>
    );
}

export default function AuctionImageGallery({ images, onImageClick }) {
    const { t } = useTranslation();

    // State để đồng bộ swipe (lướt)
    const [nav1, setNav1] = useState(null);
    const [nav2, setNav2] = useState(null);

    // Ref để điều khiển thủ công
    const sliderRef1 = useRef(null);
    const sliderRef2 = useRef(null);

    // Khởi tạo đồng bộ
    useEffect(() => {
        setNav1(sliderRef1.current);
        setNav2(sliderRef2.current);
    }, []);

    // Hàm xử lý khi bấm vào thumbnail (FIX LỖI KHÔNG ĐỒNG BỘ)
    const handleThumbnailClick = (index) => {
        // 1. Ép slider chính nhảy đến ảnh đó
        sliderRef1.current?.slickGoTo(index);
    };

    const mainSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        asNavFor: nav2,
        arrows: false,
    };

    const thumbSettings = {
        slidesToShow: 5,
        slidesToScroll: 1,
        asNavFor: nav1,
        dots: false,
        centerMode: true,
        focusOnSelect: true, // Vẫn giữ để hỗ trợ library
        centerPadding: "0px",
        swipeToSlide: true,
        nextArrow: <ThumbNextArrow />,
        prevArrow: <ThumbPrevArrow />,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 4 } },
            { breakpoint: 600, settings: { slidesToShow: 3 } }
        ]
    };

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-[400px] grid place-items-center bg-gray-200/60 dark:bg-gray-800 rounded-lg text-gray-500">
                {t('No_image')}
            </div>
        );
    }

    return (
        <div className="w-full max-w-[800px] mx-auto">
            {/* --- SLIDER CHÍNH --- */}
            <div className="relative mb-4 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
                <Slider
                    {...mainSettings}
                    ref={sliderRef1}
                >
                    {images.map((src, i) => (
                        <div key={i} className="outline-none">
                            <img
                                src={src}
                                alt={`slide-${i}`}
                                onClick={() => onImageClick && onImageClick(i)}
                                className="w-full h-[400px] object-cover cursor-zoom-in"
                            />
                        </div>
                    ))}
                </Slider>
            </div>

            {/* --- THUMBNAILS SLIDER --- */}
            {images.length > 1 && (
                <div className="px-4">
                    <Slider
                        {...thumbSettings}
                        ref={sliderRef2}
                        className="thumb-slider"
                    >
                        {images.map((src, i) => (
                            <div
                                key={i}
                                className="px-1 outline-none"
                                // 👇 QUAN TRỌNG: Bắt sự kiện click thủ công ở đây
                                onClick={() => handleThumbnailClick(i)}
                            >
                                <div className="relative aspect-[4/3] group">
                                    <img
                                        src={src}
                                        alt={`thumb-${i}`}
                                        className="w-full h-full object-cover rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer opacity-60 hover:opacity-100 transition-opacity ui-selected:opacity-100"
                                    />
                                    <div className="absolute inset-0 ring-2 ring-[#e43137] rounded-md opacity-0 group-[.slick-current_&]:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            <style>{`
                .thumb-slider .slick-current img {
                    opacity: 1 !important;
                    border-color: #e43137;
                }
            `}</style>
        </div>
    );
}