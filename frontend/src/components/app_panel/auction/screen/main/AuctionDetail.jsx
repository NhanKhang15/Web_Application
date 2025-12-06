import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ItemsApi from "../../lib/itemDetail.js";
import { PostAuctionApi } from "../../../seller/lib/PostAuctionApi.js";
import { fetchAuctionItems } from "../../lib/auctionItems";
import AuctionBidPanel from "../../wid/componentDetail/AuctionBidPanel.jsx";
import AuctionImageGallery from "../../wid/componentDetail/AuctionImageGallery.jsx";
import ImageGalleryModal from "../../wid/componentDetail/ImageGalleryModal.jsx";
import { useTranslation } from "react-i18next";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getToken, API_BASE_URL } from "../../../../../lib/api_url.js";
import AuctionInfo from "../../wid/componentDetail/AuctionInfo.jsx";
import { useChat } from "../../../widget/screens/ChatContext.jsx";
import { useUserProfile } from "../../../user_infor/lib/useUserProfile.js";
import { Wallet } from "lucide-react";

export default function AuctionDetail() {
    const { openChat } = useChat();

    const { profile: currentUser } = useUserProfile();

    const { category, slug, itemSlug } = useParams();
    const realProductSlug = itemSlug || slug;

    const navigate = useNavigate();
    const { t } = useTranslation();

    // --- State ---
    const [raw, setRaw] = useState(null);
    const [state, setState] = useState({ loading: true, error: null, notFound: false });
    const [images, setImages] = useState([]);
    const [modalInitialIndex, setModalInitialIndex] = useState(null);
    const [bids, setBids] = useState([]);

    const [categories, setCategories] = useState({});
    const [similarItems, setSimilarItems] = useState([]);
    const [walletBalance, setWalletBalance] = useState(null);

    // Format VND helper
    const formatVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

    const handleOpenChat = () => {
        if (!currentUser || !currentUser.userId) {
            alert(t("please_login_to_chat") || "Vui lòng đăng nhập để chat");
            // Có thể thêm navigate("/login") nếu muốn
            return;
        }

        if (String(currentUser.userId) === String(product.sellerId)) {
            alert(t("cannot_chat_yourself"));
            return;
        }

        if (!product.sellerId) {
            console.error("Missing sellerId for chat");
            return;
        }

        console.log("Mở chat với:", product.sellerName, "ID:", product.sellerId);

        // Gọi hàm từ Context để set state mở chat
        openChat(
            product.sellerId,
            product.sellerName,
            product.auctionId || product.id,
            product.name
        );
    };

    const authHeaders = () => {
        const token = getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    // Tự động cuộn lên đầu trang mỗi khi slug thay đổi (chuyển sang sản phẩm khác)
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }, [realProductSlug]);

    // ====== Fetch Data ======
    useEffect(() => {
        let alive = true;
        setState({ loading: true, error: null, notFound: false });
        setImages([]);
        setBids([]);
        setSimilarItems([]);

        ItemsApi.getBySlug(realProductSlug)
            .then((data) => {
                if (!alive) return;
                if (!data) return setState({ loading: false, error: null, notFound: true });
                setRaw(data);
                setState({ loading: false, error: null, notFound: false });

                // Fetch initial bids
                const auctionId = data.auctionId ?? data.itemId;
                if (auctionId) {
                    fetch(`/api/bids/history/${auctionId}`, {
                        headers: {
                            ...authHeaders()
                        },
                        credentials: 'include'
                    })
                        .then(res => res.ok ? res.json() : [])
                        .then(bidData => {
                            if (!alive) return;
                            const mappedBids = Array.isArray(bidData) ? bidData.map((b, index) => ({
                                bidID: index,
                                bidAmount: b.bidAmount,
                                bidTime: b.bidTime,
                                bidderName: b.username
                            })) : [];
                            setBids(mappedBids);
                        })
                        .catch(err => console.error("Failed to fetch bids:", err));
                }
            })
            .catch((err) => {
                if (!alive) return;
                if (err?.status === 404)
                    setState({ loading: false, error: null, notFound: true });
                else setState({ loading: false, error: err, notFound: false });
            });

        return () => { alive = false; };
    }, [realProductSlug]);

    // ====== Fetch Categories (Để lấy tên danh mục) ======
    useEffect(() => {
        PostAuctionApi.getCategories()
            .then((cats) => {
                // Chuyển mảng categories thành Object { id: name } để tra cứu cho nhanh
                const catMap = {};
                cats.forEach(c => {
                    // API có thể trả về CategoryID hoặc categoryId
                    const id = c.categoryId || c.CategoryID;
                    const name = c.categoryName || c.CategoryName;
                    if (id) catMap[id] = name;
                });
                setCategories(catMap);
            })
            .catch(console.error);
    }, []);

    // ====== Fetch Similar Items (Sản phẩm cùng loại) ======
    useEffect(() => {
        if (!raw || !raw.categoryId) return;

        // ✅ CÁCH MỚI: Truyền thẳng categoryId vào API để Backend lọc giúp
        fetchAuctionItems({
            page: 0,
            size: 5, // Chỉ cần lấy 5 cái
            sort: "createdAt,desc",
            categoryId: raw.categoryId // 👈 QUAN TRỌNG: Lọc theo danh mục ngay từ API
        })
            .then((res) => {
                const allItems = res.content || [];

                // Vẫn cần lọc Client-side một lần nữa để loại bỏ chính sản phẩm đang xem
                const filtered = allItems.filter(item => item.itemId !== raw.itemId);

                // Lấy tối đa 4 item để hiển thị
                setSimilarItems(filtered.slice(0, 4));
            })
            .catch(err => {
                // Nếu API chưa hỗ trợ lọc categoryId, nó sẽ trả về tất cả (fallback về logic cũ)
                // Ta vẫn lọc lại ở client để đảm bảo an toàn
                console.warn("API might not support category filtering yet", err);
            });

    }, [raw]);

    // ====== WebSocket ======
    useEffect(() => {
        if (!raw?.auctionId && !raw?.itemId) return;

        // Use the correct URL for SockJS
        const socketFactory = () => new SockJS(`${API_BASE_URL}/ws`);
        const stompClient = Stomp.over(socketFactory);

        // Disable debug logs to reduce console noise
        stompClient.debug = () => { };

        stompClient.connect({}, () => {
            const auctionId = raw?.auctionId ?? raw?.itemId;
            if (!auctionId) return;
            stompClient.subscribe(`/topic/auctions/${auctionId}`, (message) => {
                const event = JSON.parse(message.body);

                // Update current price
                setRaw(prev => prev ? {
                    ...prev,
                    currentPrice: event.currentPrice
                } : prev);

                // Add new bid to history
                const newBid = {
                    bidID: `ws-${Date.now()}-${Math.random()}`, // Ensure unique ID
                    bidAmount: event.currentPrice,
                    bidTime: event.updateTime,
                    bidderName: event.highestBidderName
                };
                setBids(prev => [newBid, ...prev]);
            });
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [raw?.itemId]);

    // ====== Data Mapping (AuctionDetailProjection -> UI Product) ======
    const product = useMemo(() => {
        if (!raw) return null;

        const catName = categories[raw.categoryId] || raw.categoryName || t("Unknown_Category");

        return {
            id: raw.auctionId ?? raw.itemId,
            auctionId: raw.auctionId ?? raw.itemId,
            name: raw.title || t("Untitled_Item"),
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
            images: raw.images ? raw.images.map(url => PostAuctionApi.getFullImageUrl(url)) : [],
            fallbackImages: raw.thumbnail ? [PostAuctionApi.getFullImageUrl(raw.thumbnail)] : [],
            features: {
                Location: raw.location || "—",
                Seller: raw.sellerName || "—",
                Category: catName || "—",
                Created: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString() : "—",
            },
            shipping: {
                Method: t("std_shipping"),
                Fee: t("calc_checkout"),
                Payment: t("payment_methods"),
                Returns: t("no_returns"),
            },
            similar: similarItems.map(s => ({
                id: s.itemId,
                name: s.title,
                slug: s.slug || s.Slug, // ✅ Thêm cái này để biết đường link
                img: s.thumbnail ? PostAuctionApi.getFullImageUrl(s.thumbnail) : "https://via.placeholder.com/150",
                year: s.createdAt ? new Date(s.createdAt).getFullYear() : ""
            }))
        };
    }, [raw, categories, similarItems]);

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

    // ====== User Check ======
    const [setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCurrentUser(data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user info", err);
            }
        };
        fetchUser();
    }, []);

    // ====== Fetch Wallet Balance ======
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWalletBalance(data.balance);
                }
            } catch (err) {
                console.error("Failed to fetch wallet balance:", err);
            }
        };
        fetchBalance();
    }, []);

    const isOwner = currentUser?.userId === product?.sellerId;

    // ====== Place Bid ======
    const handlePlaceBid = async (amount) => {
        // Check email verification
        if (currentUser && !currentUser.emailVerified) {
            alert(t("please_verify_email_to_bid") || "Vui lòng xác thực email để tham gia đấu giá!");
            navigate("/dashboard/user"); // Redirect to UserOverview
            return { ok: false };
        }

        try {
            const response = await fetch('/api/bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                credentials: 'include',
                body: JSON.stringify({
                    auctionId: raw.auctionId ?? raw.itemId,
                    amount: amount
                })
            });

            if (!response.ok) {
                const rawError = await response.text();
                let message = rawError;
                try {
                    const parsed = rawError ? JSON.parse(rawError) : {};
                    message = parsed?.message || parsed?.error || message;
                } catch { /* noop */ }
                throw new Error(message || 'Bid failed');
            }

            // Success is handled via WebSocket update
            return { ok: true };
        } catch (error) {
            console.error("Bid error:", error);
            throw error;
        }
    };

    // ====== Render ======
    if (state.loading) return <div className="p-10 text-center text-gray-500">{t('Loading_product_data')}...</div>;
    if (state.notFound) return <div className="p-10 text-center text-red-500">{t('Product_not_found')}</div>;
    if (state.error) return <div className="p-10 text-center text-red-500">{t('Error')}: {state.error.message}</div>;
    if (!product) return null;

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-6 lg:py-8 text-[#212121] dark:text-gray-200">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                {/* --- LEFT COLUMN (7/12) --- */}
                <div className="lg:col-span-7 flex flex-col gap-6">

                    {/* 1. Image Gallery Card */}
                    <div className="bg-white dark:bg-[#14191F] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <AuctionImageGallery
                            images={displayImages}
                            onImageClick={(index) => setModalInitialIndex(index)}
                        />
                    </div>

                    <AuctionInfo product={product} />
                </div>

                {/* --- RIGHT COLUMN (5/12) --- */}
                <div className="lg:col-span-5 relative">
                    {/* Sticky Wrapper: Giữ cho cột phải chạy theo khi cuộn */}
                    <div className="sticky top-6">
                        {!isOwner && (
                            <div className="bg-white dark:bg-[#14191F] rounded-xl p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                        {product.sellerName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{t("seller_label")}</p>
                                        <p className="font-bold text-sm">{product.sellerName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOpenChat}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    {t("chat_now")}
                                </button>
                            </div>
                        )}

                        {/* User Wallet Balance */}
                        {walletBalance !== null && (
                            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 mb-4 border border-emerald-200 dark:border-emerald-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t("your_wallet_balance")}</p>
                                            <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                {formatVND(walletBalance)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AuctionBidPanel đã bao gồm: Giá, Bid Input, Lịch sử, Shipping */}
                        <AuctionBidPanel
                            product={product}
                            bids={bids}
                            onPlaceBid={handlePlaceBid}
                            isOwner={isOwner}
                        />
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