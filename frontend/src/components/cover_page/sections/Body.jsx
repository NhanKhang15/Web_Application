import React, { useMemo } from "react";
import Slider from "react-slick";
import { Button } from "../ui/button.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card.jsx";
import { Separator } from "../ui/separator.jsx";

export default function Body({onRequireAuth}) {
    // ===== Static data =====
    const SLIDES = useMemo(
        () => [
            {
                title: (
                    <>
                        <span className="font-semibold text-white">Accelerate, Elevate, and </span>
                        <span className="font-semibold text-[#FF3B30]">Innovate!</span>
                    </>
                ),
                description:
                    "Bid on Dream Cars, Exotic Animals, and Cutting-Edge Electronics in Our Unique Auctions!",
            },
            {
                title: (
                    <>
                        <span className="font-semibold text-white">Discover Rare </span>
                        <span className="font-semibold text-[#FF3B30]">Treasures!</span>
                    </>
                ),
                description: "From luxury watches to fine art, bid on exclusive items every day!",
            },
            {
                title: (
                    <>
                        <span className="font-semibold text-white">Join the Future of </span>
                        <span className="font-semibold text-[#FF3B30]">Auctions!</span>
                    </>
                ),
                description: "Experience fast, secure, and exciting bidding like never before.",
            },
        ],
        []
    );

    const FEATURED_SLIDES = useMemo(
        () => [
            {
                titleWhite: "Classic 1985 Toyota ",
                titleRed: "Land Cruiser.",
                description:
                    "This 1985 Toyota Land Cruiser is a testament to Toyota's legacy of engineering excellence. Perfect for collectors, adventurers.",
                features: ["Iconic Design: The 1985 model", "Off-Road Mastery: 4x4 capabilities"],
                highlights: ["Well Maintained", "Low Mileage", "Detailed Documentation"],
                bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-18.svg",
            },
            {
                titleWhite: "Luxury ",
                titleRed: "Rolex Watch.",
                description:
                    "A rare collector's item, this Rolex combines timeless design with unmatched craftsmanship.",
                features: ["Gold bezel", "Water resistant"],
                highlights: ["Excellent Condition", "Original Papers"],
                bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-19.svg",
            },
            {
                titleWhite: "Exotic ",
                titleRed: "Animal Auction.",
                description:
                    "Bid on rare and exotic animals, responsibly sourced with full documentation.",
                features: ["Unique Species", "Certified Health"],
                highlights: ["Rare Opportunity", "Exclusive Access"],
                bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-20.svg",
            },
            {
                titleWhite: "High-End ",
                titleRed: "Electronics.",
                description:
                    "Experience cutting-edge technology with our exclusive range of electronic auctions.",
                features: ["Latest Models", "Warranty Included"],
                highlights: ["Trusted Sellers", "Great Deals"],
                bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-21.svg",
            },
        ],
        []
    );

    const CATEGORIES = useMemo(
        () => [
            { title: "Car Auctions", bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-7.svg", delay: "0ms" },
            { title: "Animal Auctions", bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-8.svg", delay: "150ms" },
            { title: "Electronic Auctions", bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-9.svg", delay: "300ms" },
            { title: "Exotic Clothing Auction", bg: "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-10.svg", delay: "450ms" },
        ],
        []
    );

    const HERO_BG = [
        "https://c.animaapp.com/mfkwrxnikNfmdD/img/rectangle-1.svg",
        "https://c.animaapp.com/sfasdfasdfasfd/img/rectangle-2.svg",
        "https://c.animaapp.com/asdfasdfasdfas/img/rectangle-3.svg",
    ];

    const sectionSpacing = "pt-12 sm:pt-16 lg:pt-20";

    // ===== Slider settings =====
    const heroSettings = {
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        fade: true,
        speed: 1000,
    };

    const featuredSettings = {
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 6000,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: (
            <button className="absolute top-1/2 -translate-y-1/2 right-4 z-30">
            </button>
        ),
        prevArrow: (
            <button className="absolute top-1/2 -translate-y-1/2 left-4 z-30">
            </button>
        ),
    };

    // ====== Internal Sections ======
    const HeroBanner = ({ title, description }) => (
        <section className="w-full max-w-2xl relative px-4 md:px-0">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-normal leading-snug sm:leading-[50px] md:leading-[60px] text-transparent">
                {title}
            </h1>
            <p className="mt-6 sm:mt-10 md:mt-[72px] text-base sm:text-xl md:text-2xl font-normal text-white leading-relaxed sm:leading-[30px] md:leading-[38px]">
                {description}
            </p>
            <div className="mt-8 sm:mt-12 md:mt-[104px]">
                <Button
                    size="lg"
                    className="rounded-[29px] bg-[#FF3B30] hover:bg-[#b83d26]"
                    onClick={onRequireAuth}>
                    Check Auctions
                </Button>
            </div>
        </section>
    );

    const AuctionCategoriesSection = () => (
        <section className={"w-full px-4 py-4 " + sectionSpacing}>
            <h2 className="font-semibold text-white text-xl sm:text-2xl mb-6 sm:mb-8 text-center md:text-left">
                Auction Categories
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {CATEGORIES.map((c) => (
                    <Card
                        key={c.title}
                        onClick={onRequireAuth}
                        className="overflow-hidden relative group hover:scale-[1.02] transition-transform cursor-pointer"
                        style={{ animation: `fade-in 300ms ease ${c.delay}ms both` }}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${c.bg})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <CardContent className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] flex items-end justify-center">
                            <CardTitle className="text-white text-lg sm:text-xl text-center drop-shadow">
                                {c.title}
                            </CardTitle>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );

    const FeaturedAuctionContent = ({ slide }) => (
        <Card className="bg-transparent shadow-none border-none text-white max-w-2xl">
            <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    <span className="text-white">{slide.titleWhite}</span>
                    <span className="text-[#FF3B30]">{slide.titleRed}</span>
                </CardTitle>
                <CardDescription className="text-gray-200 text-base sm:text-lg">
                    {slide.description}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="mb-6">
                    <h3 className="font-semibold text-[#FF3B30] mb-2">Key Features</h3>
                    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
                        {slide.features.map((f, i) => (
                            <li key={i} className="flex items-center">
                                <span className="mr-2">●</span> {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <Separator className="bg-white/20 my-6" />

                <div>
                    <h3 className="font-semibold text-[#FF3B30] mb-2">Auction Highlights</h3>
                    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
                        {slide.highlights.map((h, i) => (
                            <li key={i} className="flex items-center">
                                <span className="mr-2">●</span> {h}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    size="lg"
                    className="rounded-[29px] bg-[#FF3B30] hover:bg-[#b83d26] text-white font-semibold"
                    onClick={onRequireAuth}
                >
                    Bid In Auction
                </Button>
            </CardFooter>
        </Card>
    );

    // ===== Render =====
    return (
        <div className="w-full">
            {/* Hero + OnGoing slider */}
            <section className="relative w-full min-h-[350px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[607px]">
                <Slider {...heroSettings}>
                    {SLIDES.map((s, i) => (
                        <div key={i}>
                            <div
                                className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] bg-cover bg-center"
                                style={{ backgroundImage: `url(${HERO_BG[i]})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
                                <div className="relative z-10 px-4 md:px-12 pt-10 md:pt-16">
                                    <HeroBanner title={s.title} description={s.description} />
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>

            <Separator className="my-10" />

            {/* Categories */}
            <AuctionCategoriesSection />

            <Separator className="my-10" />

            {/* Featured heading */}
            <div className={"w-full px-4 " + sectionSpacing}>
                <h2 className="font-semibold text-white text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 text-center md:text-left">
                    Featured Auctions
                </h2>
            </div>

            {/* Featured block */}
            <section className="w-full pb-12 px-4">
                <Slider {...featuredSettings}>
                    {FEATURED_SLIDES.map((slide, i) => (
                        <div key={i}>
                            <div className="relative w-full min-h-[350px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[526px] rounded-md overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${slide.bg})` }}
                                />
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
