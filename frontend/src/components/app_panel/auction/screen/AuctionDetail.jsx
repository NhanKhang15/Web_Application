import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ItemsApi from "../lib/itemDetail";
import { PostAuctionApi } from "../../postAuction/lib/PostAuctionApi.js";
import AuctionBidPanel from "../wid/componentDetail/AuctionBidPanel.jsx";
import AuctionImageGallery from "../wid/componentDetail/AuctionImageGallery.jsx";
import AuctionInfo from "../wid/componentDetail/AuctionInfo.jsx";
import ImageGalleryModal from "../wid/componentDetail/ImageGalleryModal.jsx";
import { useTranslation } from "react-i18next";

export default function AuctionDetail() {
    const { category, slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // --- State ---
    const [raw, setRaw] = useState(null);
    const [state, setState] = useState({ loading: true, error: null, notFound: false });
    const [images, setImages] = useState([]);
    const [modalInitialIndex, setModalInitialIndex] = useState(null);

    // Tự động cuộn lên đầu trang mỗi khi slug thay đổi (chuyển sang sản phẩm khác)
    useEffect(() => {
        // Cuộn cửa sổ lên toạ độ (0, 0) - Tức là đầu trang
        window.scrollTo({
            top: 0,
            behavior: "instant" // "instant" để nhảy ngay lập tức, "smooth" nếu muốn trượt từ từ
        });
    }, [slug]);

    // ====== Fetch Data ======
    useEffect(() => {
        let alive = true;
        setState({ loading: true, error: null, notFound: false });
        setImages([]);

        ItemsApi.getBySlug(slug)
            .then((data) => {
                if (!alive) return;
                if (!data) return setState({ loading: false, error: null, notFound: true });
                setRaw(data);
                setState({ loading: false, error: null, notFound: false });
            })
            .catch((err) => {
                if (!alive) return;
                if (err?.status === 404)
                    setState({ loading: false, error: null, notFound: true });
                else setState({ loading: false, error: err, notFound: false });
            });

        return () => { alive = false; };
    }, [slug]);

    // ====== Data Mapping (AuctionDetailProjection -> UI Product) ======
    const product = useMemo(() => {
        if (!raw) return null;

        // Map fields from AuctionDetailProjection
        return {
            id: raw.itemId,
            name: raw.title || "Untitled Item",
            model: raw.slug || "",
            price: raw.currentPrice || raw.startingPrice || 0,
            buyNowPrice: raw.buyNowPrice,
            minStep: raw.minStep,
            startingPrice: raw.startingPrice,
            reservePrice: raw.reservePrice,
            startDate: raw.startDate,
            endDate: raw.endDate,
            sellerId: raw.sellerId,
            sellerName: raw.sellerName,
            description: raw.description,
            location: raw.location,
            // Images from API
            images: raw.imageUrls ? raw.imageUrls.map(url => PostAuctionApi.getFullImageUrl(url)) : [],
            fallbackImages: raw.thumbnail ? [PostAuctionApi.getFullImageUrl(raw.thumbnail)] : [],
            features: {
                Location: raw.location || "—",
                Seller: raw.sellerName || "—",
                Category: raw.categoryId || "—",
                Created: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString() : "—",
            },
            shipping: {
                Method: "Standard Shipping",
                Fee: "Calculated at checkout",
                Payment: "Card, Bank Transfer",
                Returns: "No returns",
            },
            similar: [] // API doesn't return similar items yet
        };
    }, [raw]);

    // ====== Initialize Images ======
    useEffect(() => {
        if (product?.images?.length > 0) {
            setImages(product.images);
        } else if (product?.fallbackImages?.length > 0) {
            setImages(product.fallbackImages);
        } else {
            setImages([]);
        }
    }, [product]);

    const displayImages = images;

    // ====== SEO ======
    useEffect(() => {
        if (product?.name) document.title = `${product.name} • Auction Detail`;
    }, [product?.name]);

    // ====== Render ======
    if (state.loading) return <div className="p-10 text-center text-gray-500">{t('Loading_product_data')}...</div>;
    if (state.notFound) return <div className="p-10 text-center text-red-500">{t('Product_not_found')}</div>;
    if (state.error) return <div className="p-10 text-center text-red-500">{t('Error')}: {state.error.message}</div>;
    if (!product) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-[#212121] dark:text-gray-200">

            {/* --- LEFT COLUMN (Images & Info) --- */}
            <div className="lg:col-span-7 flex flex-col gap-8">
                {/* Gallery */}
                <div className="bg-white dark:bg-[#0B0F13] rounded-xl p-4 shadow-sm">
                    <AuctionImageGallery
                        images={displayImages}
                        onImageClick={(index) => setModalInitialIndex(index)}
                    />
                </div>

                {/* Description & Features */}
                <div className="bg-white dark:bg-[#0B0F13] rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">{t('Description')}</h2>
                    <div className="prose dark:prose-invert max-w-none mb-6 text-sm text-gray-600 dark:text-gray-300">
                        {product.description || t('No_description')}
                    </div>

                    <h3 className="text-lg font-semibold mb-3">{t('Features')}</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        {Object.entries(product.features).map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-1">
                                <span className="font-medium text-gray-500">{k}</span>
                                <span>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN (Bidding & Actions) --- */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="sticky top-4">
                    <AuctionBidPanel product={product} />

                    {/* Shipping & Payment Info Block */}
                    <div className="mt-6 bg-gray-50 dark:bg-[#14191F] rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-3 uppercase text-sm tracking-wider">
                            {t('Shipping_and_Payment')}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('Shipping')}</span>
                                <span className="font-medium">{product.shipping.Method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('Item_location')}</span>
                                <span className="font-medium">{product.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('Payment')}</span>
                                <span className="font-medium">{product.shipping.Payment}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('Returns')}</span>
                                <span className="font-medium">{product.shipping.Returns}</span>
                            </div>
                        </div>
                    </div>

                    {/* Similar Items Placeholder */}
                    <div className="mt-6">
                        <h3 className="font-semibold mb-3 text-gray-500 uppercase text-xs tracking-wider">{t('Similar_Items')}</h3>
                        <div className="bg-gray-100 dark:bg-[#1A1F25] rounded-lg p-4 text-center text-sm text-gray-500">
                            {t('No_similar_items')}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            <ImageGalleryModal
                images={displayImages}
                initialIndex={modalInitialIndex}
                onClose={() => setModalInitialIndex(null)}
            />
        </div>
    );
}