import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ItemsApi from "../lib/itemDetail";
import { PostAuctionApi } from "../../postAuction/lib/PostAuctionApi.js";
import AuctionBidPanel from "../wid/componentDetail/AuctionBidPanel.jsx"; // Component cột phải
import AuctionImageGallery from "../wid/componentDetail/AuctionImageGallery.jsx"; // Component ảnh
import AuctionInfo from "../wid/componentDetail/AuctionInfo.jsx"; // Component mô tả
import ImageGalleryModal from "../wid/componentDetail/ImageGalleryModal.jsx";
import {useTranslation} from "react-i18next"; // Component modal

// --- Hàm helper duy nhất còn lại ---
const pick = (obj, ...keys) =>
    keys.find((k) => obj?.[k] !== undefined)
        ? obj[keys.find((k) => obj?.[k] !== undefined)]
        : undefined;

// --- (Các hàm helper khác đã được chuyển vào component con) ---

export default function AuctionDetail() {
    const { category, slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // --- State quản lý dữ liệu ---
    const [raw, setRaw] = useState(null);
    const [state, setState] = useState({ loading: true, error: null, notFound: false });
    const [images, setImages] = useState([]);

    // --- State quản lý UI ---
    const [modalInitialIndex, setModalInitialIndex] = useState(null); // null = đóng

    // ====== Fetch thật theo slug ======
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

    // ====== Chuẩn hoá sang product theo design ======
    // (useMemo này vẫn phải ở đây, vì nó tạo ra 'product' cho các component con)
    const product = useMemo(() => {
        if (!raw) return null;

        const id = pick(raw, "itemId", "ItemID", "id", "Id");
        const name = pick(raw, "title", "Title", "name", "Name") ?? "Untitled item";
        const model = pick(raw, "model", "Model") ?? pick(raw, "slug", "Slug") ?? "";
        const price = Number(pick(raw, "currentPrice", "price", "Price")) || 0;

        const imgUrl =
            pick(raw, "imgUrl", "ImgUrl", "thumbnail", "Thumbnail", "image", "Image") ?? "";
        const fallbackImages =
            pick(raw, "images", "Images") && Array.isArray(pick(raw, "images", "Images"))
                ? pick(raw, "images", "Images")
                : imgUrl
                    ? [imgUrl]
                    : [];

        const features =
            pick(raw, "features", "Features") ??
            {
                Location: pick(raw, "location", "Location") ?? "—",
                SellerID: pick(raw, "sellerId", "SellerID") ?? "—",
                CategoryID: pick(raw, "categoryId", "CategoryID") ?? "—",
                Created: String(pick(raw, "createdAt", "CreatedAt") ?? "—"),
                Updated: String(pick(raw, "updatedAt", "UpdatedAt") ?? "—"),
            };

        const shipping =
            pick(raw, "shipping", "Shipping") ?? {
                Method: "Standard",
                Fee: "Calculated at checkout",
                Payment: "Card/Bank/PayPal",
                Returns: "7 days",
            };

        const similar = pick(raw, "similar", "Similar") ?? [];

        return { id, name, model, price, fallbackImages, features, shipping, similar };
    }, [raw]);

    // ====== Fetch ảnh cho vật phẩm ======
    useEffect(() => {
        let alive = true;
        const itemId = product?.id;
        if (!itemId) return;

        ItemsApi.getImages(itemId)
            .then((arr) => {
                if (!alive) return;
                const urls = (arr ?? [])
                    .map((x) => PostAuctionApi.getFullImageUrl(x?.imgUrl ?? x?.ImgUrl))
                    .filter(Boolean);
                setImages(urls);
            })
            .catch(() => setImages([]));

        return () => { alive = false; };
    }, [product?.id]);

    // ảnh dùng để render: ưu tiên API → fallback payload cũ
    const displayImages = images.length > 0 ? images : (product?.fallbackImages ?? []);

    // ====== SEO title ======
    useEffect(() => {
        if (product?.name) document.title = `${product.name} • Auction Detail`;
    }, [product?.name]);

    // --- (Logic đấu giá đã được chuyển đi) ---
    // --- (Logic slider đã được chuyển đi) ---

    // ====== UI states (Loading/Error) ======
    if (state.loading) {
        return <div className="p-5 text-sm text-gray-600">{t('Loading_product_data')}</div>;
    }

    if (state.notFound) {
        return (
            <div className="p-5">
                <p className="text-red-600 font-semibold">
                    {t('Product_not_found')} <code>{slug}</code>
                </p>
                <div className="mt-3 flex gap-3">
                    <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md">
                        ← {t('Go_back')}
                    </button>
                    <Link to={`/dashboard/${category}`} className="px-3 py-2 border rounded-md">
                        {t('Back_to_category')} {category}
                    </Link>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="p-5">
                <p className="text-red-600 font-semibold">
                    {t('Error')}: {state.error.message || "Có lỗi xảy ra"}
                </p>
                <button onClick={() => location.reload()} className="mt-2 px-3 py-2 border rounded-md">
                    {t('Try_again')}
                </button>
            </div>
        );
    }

    if (!product) return null;


    // ====== Render (Siêu gọn) ======
    return (
        <div className="flex flex-col lg:flex-row items-start gap-6 w/full max-w-[1100px] ml-0 px-5 py-4 text-gray-800 dark:text-gray-100 rounded-xl">

            {/* --- CỘT TRÁI (Đã tách) --- */}
            <div className="flex-1 px-6 pt-4 pb-10 bg-gray-50 dark:bg-[#0B0F13] rounded-xl shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {product.name}
                    </span>
                </div>

                <AuctionImageGallery
                    images={displayImages}
                    onImageClick={(index) => setModalInitialIndex(index)}
                />

                <AuctionInfo product={product} />
            </div>

            {/* --- CỘT PHẢI (Đã tách) --- */}
            <AuctionBidPanel product={product} />

            {/* --- MODAL (Đã tách) --- */}
            <ImageGalleryModal
                images={displayImages}
                initialIndex={modalInitialIndex}
                onClose={() => setModalInitialIndex(null)}
            />
        </div>
    );
}