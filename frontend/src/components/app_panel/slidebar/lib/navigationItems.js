// src/slidebar/lib/navigationItems.js
import {Gavel, User, Settings, Briefcase, Wrench, Info, PlusCircle} from "lucide-react";

export const navigationItems = [
    { key: "auction",  icon: Gavel,     label: "AUCTION",  transKey: "nav_auction" },
    { key: "post",     icon: PlusCircle, label: "POST",    transKey: "nav_post" },
    { key: "user",     icon: User,      label: "USER",     transKey: "nav_user" },
    { key: "settings", icon: Settings,  label: "SETTINGS", transKey: "nav_settings" },
    { key: "trader",   icon: Briefcase, label: "TRADER",   transKey: "nav_trader" },
    { key: "utils",    icon: Wrench,    label: "UTILITIES",transKey: "nav_utilities" },
    { key: "about",    icon: Info,      label: "ABOUT US", transKey: "nav_about_us" },
];
