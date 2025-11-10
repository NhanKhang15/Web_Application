import React, { useRef } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {useTranslation} from "react-i18next";

// --- Định nghĩa Arrow (Chỉ dùng cho component này) ---
function NextArrow({ onClick }) {
    return (
        <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/60 hover:bg-gray-800 text-white rounded-full p-2 z-10"
            onClick={onClick} aria-label="Next"
        >
            <ChevronRight className="w-5 h-5" />
        </button>
    );
}
function PrevArrow({ onClick }) {
    return (
        <button
            type="button"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/60 hover:bg-gray-800 text-white rounded-full p-2 z-10"
            onClick={onClick} aria-label="Previous"
        >
            <ChevronLeft className="w-5 h-5" />
        </button>
    );
}

/**
 * Component này hiển thị Slider chính và các ảnh thumbnail
 * Props:
 * - images: Mảng các URL ảnh (ví dụ: displayImages)
 * - onImageClick: Hàm (nhận index) để gọi khi bấm vào thumbnail
 */
export default function AuctionImageGallery({ images, onImageClick }) {
    const { t } = useTranslation();
    const mainSliderRef = useRef(null);

    const settings = {
        dots: true,
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    return (
        <>
            {/* SLIDER CHÍNH */}
            <div className="relative mb-6 rounded-lg shadow-md w-full max-w-[800px] mx-auto overflow-visible">
                {images.length > 0 ? (
                    <Slider ref={mainSliderRef} {...settings}>
                        {images.map((src, i) => (
                            <div key={i}>
                                <img
                                    src={src}
                                    alt={`slide-${i}`}
                                    className="w-full h-[400px] object-cover rounded-lg"
                                />
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="w-full h-[400px] grid place-items-center bg-gray-200/60 rounded-lg text-gray-500">
                        {t('No_image')}
                    </div>
                )}
            </div>

            {/* THUMBNAILS */}
            <div className="flex flex-wrap gap-3 mb-8 max-w-[800px] mx-auto">
                {images.slice(0, 7).map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`thumb-${i}`}
                        className="w-24 h-20 rounded-lg border border-gray-300 dark:border-gray-700 object-cover cursor-pointer hover:opacity-80"
                        // Gọi hàm prop từ cha, truyền index (vị trí)
                        onClick={() => onImageClick(i)}
                    />
                ))}
                {images.length > 7 && (
                    <button
                        type="button"
                        // Mở modal tại vị trí ảnh thứ 8 (index = 7)
                        onClick={() => onImageClick(7)}
                        className="w-24 h-20 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-medium cursor-pointer hover:bg-gray-300"
                    >
                        +{images.length - 7}
                    </button>
                )}
            </div>
        </>
    );
}