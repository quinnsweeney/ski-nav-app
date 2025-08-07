import { Box, Button, List, ListItem, Sheet } from "@mui/joy";
import type { Lift, PointOfInterest, Resort } from "../../types";
import { useState } from "react";
import LiftForm from "./LiftForm";
import adminAPI from "../../api";

interface LiftsManagerProps {
    resort: Resort;
    lifts: Lift[];
    pois: PointOfInterest[];
    onDataChange: () => void;
}

export default function LiftsManager({ resort, lifts, pois, onDataChange }: LiftsManagerProps) {
    const [editingLift, setEditingLift] = useState<Lift | null>(null);
    const [showForm, setShowForm] = useState(false);

    const handleSave = () => {
        onDataChange();
        setEditingLift(null);
        setShowForm(false);
    }

    const handleDelete = (liftId: number) => {
        if (window.confirm("Are you sure you want to delete this lift?")) {
            adminAPI.delete(`/lifts/${liftId}`)
                .then(() => {
                    onDataChange();
                })
                .catch(err => {
                    console.error("Failed to delete lift", err);
                    alert("Could not delete the lift. It may be in use by a trail segment.");
                });
        }
    }

    const handleEditClick = (lift: Lift) => {
        setEditingLift(lift);
        setShowForm(true);
    }

    const handleAddClick = () => {
        setEditingLift(null); 
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditingLift(null);
        setShowForm(false);
    }

    return (
        <Sheet>
            {!showForm && (
                <Button onClick={handleAddClick} sx={{ mb: 2 }}>
                    Add New Lift
                </Button>
            )}
            {showForm && (
                <LiftForm 
                    resortId={resort.id} 
                    pois={pois} 
                    onSave={handleSave}
                    onCancel={handleCancel}
                    editingLift={editingLift}
                />
            )}
            <List>
                {lifts.map(lift => (
                    <ListItem 
                        key={lift.id}
                        endAction={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="sm" variant="soft" color="neutral" onClick={() => handleEditClick(lift)}>Edit</Button>
                                <Button size="sm" variant="soft" color="danger" onClick={() => handleDelete(lift.id)}>Delete</Button>
                            </Box>
                        }
                    >
                        {lift.name}
                    </ListItem>
                ))}
            </List>
        </Sheet>
    );

}