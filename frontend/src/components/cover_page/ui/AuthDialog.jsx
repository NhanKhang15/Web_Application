import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Link } from "react-router-dom";

export default function AuthDialog({ open, onClose }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Authentication Required</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-700 mt-2">
                    You have to{" "}
                    <Link to="/login" className="underline text-blue-600 hover:text-blue-800">
                        login
                    </Link>{" "}
                    to make an action. <br />
                    If you don’t have an account,{" "}
                    <Link to="/register" className="underline text-blue-600 hover:text-blue-800">
                        register here
                    </Link>.
                </p>

                <div className="mt-4 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
