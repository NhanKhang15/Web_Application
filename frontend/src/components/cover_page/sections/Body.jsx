import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { Button } from "../ui/button.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card.jsx";
import { Separator } from "../ui/separator.jsx";
import { useTranslation } from "react-i18next";

// Import dữ liệu chữ tĩnh
import { SLIDES, FEATURED_SLIDES, CATEGORIES, HERO_BG } from "../lib/auctionData";

// 🟢 Import hàm API chúng ta vừa tạo
import { getPhotosByQueries } from "../lib/unsplash";

// 🟢 CẤU HÌNH ID ẢNH BẠN MUỐN HIỂN THỊ (Lấy ID từ URL Unsplash)
const KEYWORDS = {
    // 3 ảnh cho Hero Slider
    hero: [
        "luxury super car dark background", // Xe sang nền tối
        "auction gavel hammer expensive",   // Búa đấu giá
        "futuristic technology blue"        // Công nghệ tương lai
    ],
    // 4 ảnh cho Categories
    categories: [
        "luxury car showroom",      // Car
        "vintage antique collection",
        "computer motherboard chip",// Electronic
        "fashion runway model"      // Clothing
    ],
    // 4 ảnh cho Featured Items
    featured: [
        "vintage toyota land cruiser offroad", // Xe Toyota cổ
        "rolex watch",                        // Đồng hồ Rolex cận cảnh
        "vintage vinyl records rare",
        "gaming setup rgb lights"             // Đồ điện tử
    ]
};

export default function Body({ onRequireAuth }) {
    const { t } = useTranslation();

    // State lưu ảnh, khởi tạo bằng ảnh tĩnh (fallback) để không bị trắng trang khi đang load
    const [heroImages, setHeroImages] = useState(HERO_BG);
    const [categoryImages, setCategoryImages] = useState(CATEGORIES.map(c => c.bg));
    const [featuredImages, setFeaturedImages] = useState(FEATURED_SLIDES.map(s => s.bg));

    // 🟢 useEffect gọi API tìm kiếm
    useEffect(() => {
        const fetchImages = async () => {
            console.log("🔍 Đang tìm kiếm ảnh trên Unsplash...");

            // 1. Tìm ảnh Hero
            const heroes = await getPhotosByQueries(KEYWORDS.hero);
            setHeroImages(prev => heroes.map((img, i) => img || prev[i]));

            // 2. Tìm ảnh Categories
            const cats = await getPhotosByQueries(KEYWORDS.categories);
            setCategoryImages(prev => cats.map((img, i) => img || prev[i]));

            // 3. Tìm ảnh Featured
            const feats = await getPhotosByQueries(KEYWORDS.featured);
            setFeaturedImages(prev => feats.map((img, i) => img || prev[i]));
        };

        fetchImages();
    }, []);

    // --- Cấu hình Slider ---
    const heroSettings = { dots: true, infinite: true, autoplay: true, autoplaySpeed: 5000, arrows: false, fade: true, speed: 1000 };
    const featuredSettings = { dots: false, infinite: true, autoplay: true, autoplaySpeed: 6000, speed: 800, slidesToShow: 1, slidesToScroll: 1 };

    // --- Sub-components ---
    const HeroBanner = ({ titleWhite, titleRed, description }) => (
        <section className="w-full max-w-2xl relative px-4 md:px-0">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-normal leading-snug">
                <span className="text-white">{titleWhite}</span>
                <span className="text-[#FF3B30]">{titleRed}</span>
            </h1>
            <p className="mt-6 sm:mt-10 md:mt-[72px] text-base sm:text-xl md:text-2xl font-normal text-white leading-relaxed">
                {description}
            </p>
            <div className="mt-8 sm:mt-12 md:mt-[104px]">
                <Button size="lg" className="rounded-[29px] bg-[#FF3B30] hover:bg-[#b83d26]" onClick={onRequireAuth}>
                    {t("check_auctions")}
                </Button>
            </div>
        </section>
    );

    const FeaturedAuctionContent = ({ slide }) => (
        <Card className="bg-transparent shadow-none border-none text-white max-w-2xl">
            <CardHeader>
                <CardTitle className="text-3xl font-bold">
                    <span className="text-white">{slide.titleWhite}</span>
                    <span className="text-[#FF3B30]">{slide.titleRed}</span>
                </CardTitle>
                <CardDescription className="text-gray-200 text-base">{slide.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <h3 className="font-semibold text-[#FF3B30] mb-2">{t("key_features")}</h3>
                    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
                        {slide.features.map((f, i) => (<li key={i} className="flex items-center"><span className="mr-2">●</span> {f}</li>))}
                    </ul>
                </div>
                <Separator className="bg-white/20 my-6" />
                <div>
                    <h3 className="font-semibold text-[#FF3B30] mb-2">{t("auction_highlights")}</h3>
                    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
                        {slide.highlights.map((h, i) => (<li key={i} className="flex items-center"><span className="mr-2">●</span> {h}</li>))}
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                <Button size="lg" className="rounded-[29px] bg-[#FF3B30] hover:bg-[#b83d26]" onClick={onRequireAuth}>
                    {t("bid_in_auction")}
                </Button>
            </CardFooter>
        </Card>
    );

    // --- Render Main ---
    return (
        <div className="w-full overflow-x-hidden">
            {/* Hero Slider */}
            <section className="relative w-full min-h-[480px]">
                <Slider {...heroSettings}>
                    {t("slides", { returnObjects: true }).map((s, i) => (
                        <div key={i}>
                            <div className="relative w-full bg-cover bg-center"
                                 style={{ backgroundImage: `url(${heroImages[i]})` }}> {/* Dùng state heroImages */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
                                <div className="relative z-10 px-4 md:px-12 pt-10 md:pt-16">
                                    <HeroBanner {...s} />
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>

            <Separator className="my-4" />

            {/* Categories */}
            <section className={"w-full px-4 py-4"}>
                <h2 className="font-semibold text-white text-xl sm:text-2xl mb-6 sm:mb-8 text-center md:text-left">{t("auction_categories")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {CATEGORIES.map((c, i) => (
                        <Card key={i} onClick={onRequireAuth} className="overflow-hidden relative group hover:scale-[1.02] transition-transform cursor-pointer">
                            <div className="absolute inset-0 bg-cover bg-center"
                                 style={{ backgroundImage: `url(${categoryImages[i]})` }}> {/* Dùng state categoryImages */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            </div>
                            <CardContent className="relative min-h-[260px] flex items-end justify-center">
                                <CardTitle className="text-white text-lg text-center drop-shadow">{t(`categories.${i}`)}</CardTitle>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Separator className="my-4" />
            <div className={"w-full px-4"}>
                <h2 className="font-semibold text-white text-xl sm:text-2xl mb-6 sm:mb-8 text-center md:text-left">{t("featured_auctions")}</h2>
            </div>

            {/* Featured Slider */}
            <section className="w-full px-4 py-4">
                <Slider {...featuredSettings}>
                    {t("featured_slides", { returnObjects: true }).map((slide, i) => (
                        <div key={i}>
                            <div className="relative w-full rounded-md overflow-hidden">
                                <div className="absolute inset-0 bg-cover bg-center"
                                     style={{ backgroundImage: `url(${featuredImages[i]})` }} /> {/* Dùng state featuredImages */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
                                <div className="relative z-10 h-full flex items-center p-6 sm:p-12">
                                    <FeaturedAuctionContent slide={slide} />
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>
        </div>
    );
}