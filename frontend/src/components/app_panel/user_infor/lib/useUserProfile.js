import { useEffect, useState } from "react";
import {
    getCurrentUser,
    getProfileByUserId,
    upsertProfile,
} from "../../../auth/services/userprofile_api.js";

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
                        email: data.email,   // giữ email ở ngoài
                        ...data.profile,     // merge thêm fullName, phone...
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

    const updateProfile = async (updatedProfile) => {
        try {
            if (!profile?.userId) throw new Error("User ID missing");
            const data = await upsertProfile(profile.userId, updatedProfile);

            if (data?.success) {
                // refresh lại
                const refreshed = await getProfileByUserId(profile.userId);
                setProfile({
                    userId: refreshed.user_id,
                    username: refreshed.username,
                    email: refreshed.email,  // giữ email ở ngoài
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
