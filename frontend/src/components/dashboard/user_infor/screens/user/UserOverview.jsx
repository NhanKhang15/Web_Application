import React from "react";
import { Button } from "../../ui/Button.jsx";
import InfoCardBody from "./InfoCardBody.jsx";
import EditUserDialog from "./EditUserDialog.jsx";

export default function UserOverview({ profile, email, isEditing, setIsEditing, updateProfile }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">User Overview</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                >
                    Edit
                </Button>
            </div>

            <InfoCardBody profile={profile} email={email} />

                <p className="text-sm text-neutral-500">Trang User (fetch từ API).</p>

            <EditUserDialog
                open={isEditing}
                onOpenChange={setIsEditing}
                profile={profile}
                onSave={updateProfile}
            />
        </div>
    );
}
