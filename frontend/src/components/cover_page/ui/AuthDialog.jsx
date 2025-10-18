// src/ui/AuthDialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅ thêm

export default function AuthDialog({ open, onClose }) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {t("auth_required")}
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-700 mt-2">
                    {t("auth_message_1")}{" "}
                    <Link to="/login" className="underline text-blue-600 hover:text-blue-800">
                        {t("login")}
                    </Link>{" "}
                    {t("auth_message_2")} <br />
                    {t("auth_message_3")}{" "}
                    <Link to="/signup" className="underline text-blue-600 hover:text-blue-800">
                        {t("register_here")}
                    </Link>.
                </p>

                <div className="mt-4 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        {t("close")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
