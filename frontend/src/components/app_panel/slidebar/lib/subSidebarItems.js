// src/data/subSidebarItems.js
import { User, Paperclip, Wallet, BarChart3 } from "lucide-react";

export const subSidebarItems = [
    { key: "user", icon: User, title: "User", transKey: "sub_user", path: "profile" },
    { key: "file", icon: Paperclip, title: "Attachments", transKey: "sub_attachments", path: "attachments" },
    { key: "wallet", icon: Wallet, title: "Wallet", transKey: "sub_wallet", path: "wallet" },
    { key: "chart", icon: BarChart3, title: "Analytics", transKey: "sub_analytics", path: "analytics" },
];
