import React from "react";
import Slider from "react-slick";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
 * Component này hiển thị Modal (Slider thứ 2)
 * Props:
 * - images: Mảng URL ảnh
 * - initialIndex: Vị trí (index) ảnh bắt đầu
 * - onClose: Hàm để đóng modal
 */
export default function ImageGalleryModal({ images, initialIndex, onClose }) {
    if (initialIndex === null) {
        return null; // Không render gì nếu bị đóng
    }

    const modalSliderSettings = {
        dots: false,
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        initialSlide: initialIndex, // Bắt đầu từ ảnh được bấm
    };

    return (
        <AnimatePresence>
            <motion.div
                key="preview"
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                onClick={onClose} // Đóng khi bấm vào nền
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Ngăn modal đóng khi bấm vào slider */}
                <div
                    className="w-full max-w-4xl p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Slider {...modalSliderSettings}>
                        {images.map((src, i) => (
                            <div key={i}>
                                <img
                                    src={src}
                                    alt={`modal-slide-${i}`}
                                    className="w-full h-[85vh] object-contain rounded-lg"
                                />
                            </div>
                        ))}
                    </Slider>
                </div>

                <button
                    className="absolute top-6 right-8 text-white text-4xl font-light hover:opacity-80"
                    onClick={onClose}
                >
                    ×
                </button>
            </motion.div>
        </AnimatePresence>
    );
}