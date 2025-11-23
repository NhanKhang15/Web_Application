// src/pages/PostAuction.jsx
import React from "react";
import { Upload, Calendar, DollarSign, FileText, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import PostAuctionApi from "../lib/PostAuctionApi.js";
import { useTranslation } from "react-i18next";
import * as Toast from "@radix-ui/react-toast";

export default function PostAuction() {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        startingPrice: "",
        minStep: "100",
        reservePrice: "",
        buyNowPrice: "",
        startDate: "",
        endDate: "",
        categoryId: "",
        location: "",
        images: []
    });

    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    // Toast state
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastType, setToastType] = React.useState("success"); // "success" | "error"

    const [imagePreviews, setImagePreviews] = React.useState([]);

    // Helper to show toast
    const showToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setToastOpen(true);
    };

    // Fetch categories on mount
    React.useEffect(() => {
        PostAuctionApi.getCategories()
            .then(setCategories)
            .catch((err) => {
                console.error("Failed to load categories:", err)
                showToast(t(err.message || 'Failed_to_load_categories'), "error");
            });
    }, [t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.categoryId || !formData.startingPrice) {
                throw new Error("Please_fill_required_fields");
            }

            if (!formData.startDate || !formData.endDate) {
                throw new Error("Please_fill_required_fields");
            }

            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);

            if (endDate <= startDate) {
                throw new Error("End_date_must_be_after_start");
            }

            // Create auction item with images
            const result = await PostAuctionApi.createAuctionItem(formData, formData.images);

            showToast(t('Auction_created_success', { itemId: result.item.itemId }), "success");

            // Reset form after 2 seconds
            setTimeout(() => {
                resetForm();
            }, 2000);

        } catch (error) {
            console.error("Failed to create auction:", error);
            showToast(t(error.message || "Failed_to_create_auction"), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Limit to 10 images
        if (files.length + formData.images.length > 10) {
            showToast(t('Max_10_images'), "error");
            return;
        }

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index) => {
        // Revoke the preview URL to prevent memory leaks
        URL.revokeObjectURL(imagePreviews[index]);

        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const setAsMain = (index) => {
        if (index === 0) return; // Nếu đang là ảnh chính rồi thì không làm gì

        // 1. Cập nhật mảng Previews (hiển thị)
        const newPreviews = [...imagePreviews];
        const selectedPreview = newPreviews[index];
        // Xóa ảnh ở vị trí cũ và chèn vào đầu
        newPreviews.splice(index, 1);
        newPreviews.unshift(selectedPreview);
        setImagePreviews(newPreviews);

        // 2. Cập nhật mảng Files (dữ liệu gửi đi)
        const newImages = [...formData.images];
        const selectedFile = newImages[index];
        // Xóa file ở vị trí cũ và chèn vào đầu
        newImages.splice(index, 1);
        newImages.unshift(selectedFile);

        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const resetForm = () => {
        // Clean up preview URLs
        imagePreviews.forEach(url => URL.revokeObjectURL(url));

        setFormData({
            title: "",
            description: "",
            startingPrice: "",
            minStep: "100",
            reservePrice: "",
            buyNowPrice: "",
            startDate: "",
            endDate: "",
            categoryId: "",
            location: "",
            images: []
        });
        setImagePreviews([]);
    };

    return (
        <Toast.Provider swipeDirection="right">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">
                    {t('Post_New_Auction')}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                    {t('Post_New_Auction_Desc')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                            <FileText className="inline w-4 h-4 mr-2" />
                            {t('Auction_Title')} *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t('Enter_auction_title')}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                     focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                            {t('Description')}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('Describe_item_detail')}
                            rows={5}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                     focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none resize-none"
                        />
                    </div>

                    {/* Category & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                {t('Category')} *
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                                required
                            >
                                <option value="">{t('Select_category')}</option>
                                {categories.map(cat => (
                                    <option key={cat.categoryId || cat.CategoryID} value={cat.categoryId || cat.CategoryID}>
                                        {cat.categoryName || cat.CategoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                {t('Location')}
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder={t('location_placeholder')}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                <DollarSign className="inline w-4 h-4 mr-2" />
                                {t('Starting_Price')} *
                            </label>
                            <input
                                type="number"
                                value={formData.startingPrice}
                                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                {t('Min_Bid_Step')}
                            </label>
                            <input
                                type="number"
                                value={formData.minStep}
                                onChange={(e) => setFormData({ ...formData, minStep: e.target.value })}
                                placeholder="100"
                                min="1"
                                step="1"
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Optional Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                {t('Reserve_Price_Optional')}
                            </label>
                            <input
                                type="number"
                                value={formData.reservePrice}
                                onChange={(e) => setFormData({ ...formData, reservePrice: e.target.value })}
                                placeholder={t('Reserve_Price_Desc')}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                {t('Buy_Now_Price_Optional')}
                            </label>
                            <input
                                type="number"
                                value={formData.buyNowPrice}
                                onChange={(e) => setFormData({ ...formData, buyNowPrice: e.target.value })}
                                placeholder={t('Buy_Now_Price_Desc')}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                <Calendar className="inline w-4 h-4 mr-2" />
                                {t('Start_Date')} *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                <Calendar className="inline w-4 h-4 mr-2" />
                                {t('End_Date')} *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                                         focus:ring-2 focus:ring-[#e43137] focus:border-transparent outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                            <ImageIcon className="inline w-4 h-4 mr-2" />
                            {t('Upload_Images_Max')}
                        </label>
                        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                                disabled={formData.images.length >= 10}
                            />
                            <label
                                htmlFor="image-upload"
                                className={`cursor-pointer font-medium ${formData.images.length >= 10
                                    ? "text-neutral-400 cursor-not-allowed"
                                    : "text-[#e43137] hover:text-[#e43137]/80"
                                    }`}
                            >
                                {t('Click_to_upload')}
                            </label>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                {t('Upload_Images_Help')}
                            </p>
                            {formData.images.length > 0 && (
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 font-medium">
                                    {t('Images_selected', { count: formData.images.length })}
                                </p>
                            )}
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group aspect-video"> {/* Thêm aspect-video để khung hình đều nhau */}
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className={`w-full h-full object-cover rounded-lg border transition-all duration-200 ${index === 0
                                                ? "border-[#e43137] ring-2 ring-[#e43137]/20"
                                                : "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400"
                                                }`}
                                        />

                                        {/* Nút xóa (Giữ nguyên, chỉ chỉnh lại style một chút cho đẹp) */}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                                            title={t('remove')}
                                        >
                                            ×
                                        </button>

                                        {/* Logic hiển thị Thumbnail / Nút chọn Thumbnail */}
                                        {index === 0 ? (
                                            <span className="absolute top-2 left-2 bg-[#e43137] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10 uppercase tracking-wider">
                                                {t('Main_Image')}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setAsMain(index)}
                                                className="absolute top-2 left-2 bg-black/60 hover:bg-[#e43137] text-white text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-sm"
                                            >
                                                {t('Set_as_Thumbnail')}
                                            </button>
                                        )}

                                        {/* Lớp phủ mờ khi hover để làm nổi bật các nút */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#e43137] hover:bg-[#c42a30] text-white font-semibold py-3 px-6 rounded-lg
                                     transition-colors duration-200 focus:ring-2 focus:ring-[#e43137]/40 focus:outline-none
                                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('Creating_Auction')}
                                </>
                            ) : (
                                t('Post_Auction')
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={loading}
                            className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg
                                     text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800
                                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('Reset')}
                        </button>
                    </div>
                </form>

                {/* Toast Notification */}
                <Toast.Root
                    className={`px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-right-full duration-300 ${toastType === "success"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                        }`}
                    open={toastOpen}
                    onOpenChange={setToastOpen}
                >
                    {toastType === "success" ? (
                        <CheckCircle2 className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <Toast.Title className="font-medium">{toastMessage}</Toast.Title>
                </Toast.Root>
                <Toast.Viewport className="fixed bottom-5 right-20 z-[10000000]" />
            </div>
        </Toast.Provider>
    );
}