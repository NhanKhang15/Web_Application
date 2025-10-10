import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/Dialog.jsx";
import { Button } from "../../ui/Button.jsx";

// Component Dialog Edit User
export default function EditUserDialog({ open, onOpenChange, profile, onSave }) {
    const [formData, setFormData] = useState(profile);

    // Reset dữ liệu khi dialog mở lại
    useEffect(() => {
        if (open) setFormData(profile);
    }, [open, profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
            >
            <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Edit User Information
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Full name */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ""}
                            onChange={handleChange}
                            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={profile?.email || ""}
                            readOnly
                            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio || ""}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
