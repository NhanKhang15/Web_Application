// src/user_infor/lib/useUserProfile.js
import { useEffect, useState } from "react";
import {
    getCurrentUser,
    getProfileByUserId,
    upsertProfile,
} from "../../../auth/services/userprofile_api.js";

// 👇 1. Import hàm upload từ file bạn vừa gửi (sửa đường dẫn cho đúng nơi bạn lưu file)
import { uploadAvatar } from "../../../user_profile_setup/lib/upload_api.js";

export function useUserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                const currentUser = getCurrentUser();
                if (!currentUser?.userId) throw new Error("User not logged in");

                const data = await getProfileByUserId(currentUser.userId);

                if (data?.success) {
                    setProfile({
                        userId: data.user_id,
                        username: data.username,
                        email: data.email,
                        ...data.profile,
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    // 👇 2. Cập nhật hàm updateProfile để xử lý upload ảnh thật
    const updateProfile = async (updatedProfileData, fileImage) => {
        try {
            if (!profile?.userId) throw new Error("User ID missing");

            // --- LOGIC MỚI: UPLOAD ẢNH ---
            if (fileImage) {
                try {
                    console.log("Đang upload ảnh...");
                    // Gọi API uploadAvatar bạn vừa cung cấp
                    const newAvatarUrl = await uploadAvatar(fileImage);

                    // Gán URL mới vào dữ liệu profile để lưu xuống DB
                    updatedProfileData.avatarUrl = newAvatarUrl;
                    console.log("Upload thành công, URL mới:", newAvatarUrl);
                } catch (uploadErr) {
                    console.error("Lỗi upload ảnh:", uploadErr);
                    // Tùy chọn: Có thể throw lỗi để dừng luôn việc lưu profile nếu muốn
                    // throw uploadErr;
                    alert("Upload ảnh thất bại, nhưng vẫn sẽ lưu thông tin văn bản.");
                }
            }
            // -----------------------------

            // Tiếp tục lưu thông tin (Tên, SDT, Bio và URL ảnh mới)
            const data = await upsertProfile(profile.userId, updatedProfileData);

            if (data?.success) {
                const refreshed = await getProfileByUserId(profile.userId);
                setProfile({
                    userId: refreshed.user_id,
                    username: refreshed.username,
                    email: refreshed.email,
                    ...refreshed.profile,
                });
            }

            return data;
        } catch (err) {
            console.error("Error updating profile:", err);
            throw err;
        }
    };

    return { profile, loading, updateProfile };
}