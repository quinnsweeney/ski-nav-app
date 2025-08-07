import { useState } from "react";
import type { PointOfInterest } from "../../types";
import { Box, Button, FormControl, FormHelperText, FormLabel, Input, Option, Select, Sheet, Typography } from "@mui/joy";
import adminAPI from "../../api";

interface PointOfInterestFormProps {
    resortId: number,
    onSaveSuccess: () => void,
    onCancel: () => void,
    editingPoi: PointOfInterest | null;
}

function PointOfInterestForm ({ resortId, onSaveSuccess, onCancel, editingPoi}: PointOfInterestFormProps) {
    const [name, setName] = useState(
        editingPoi ? editingPoi.name : ''
    );
    const [type, setType] = useState(
        editingPoi ? editingPoi.type : 'Intersection'
    );
    const [locationString, setLocationString] = useState(
        editingPoi ? `${editingPoi.latitude}, ${editingPoi.longitude}` : ''
    );
    const [aliasesString, setAliasesString] = useState(editingPoi?.aliases?.join(', ') || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        const parts = locationString.split(',');
        if (parts.length !== 2) {
            setFormError("Invalid format. Please use 'latitude, longitude'.");
            return;
        }

        const latitude = parseFloat(parts[0].trim());
        const longitude = parseFloat(parts[1].trim());
        if(isNaN(latitude) || isNaN(longitude)) {
            setFormError("Invalid coordinates. Please enter valid numbers.");
            return;
        }

        setIsSubmitting(true);

        const aliases = aliasesString.split(',').map(s => s.trim()).filter(Boolean);

        const payload = { 
            ski_area_id: resortId, 
            name: name || null,
            type, 
            latitude, 
            longitude,
            aliases: aliases.length > 0 ? aliases : null,
        };

        const request = editingPoi 
            ? adminAPI.put(`/points-of-interest/${editingPoi.id}`, payload)
            : adminAPI.post(`/points-of-interest`, payload);

        request
            .then(() => {
                onSaveSuccess();
            })
            .catch(err => {
                console.error("Error saving POI:", err);
                setFormError("An error occurred on the server.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'sm', my: 2 }}>
            <Typography level="h4" component="h3" sx={{ mb: 2 }}>
                {editingPoi ? 'Edit Point of Interest' : 'Add New Point of Interest'}
            </Typography>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormControl>
                    <FormLabel>Name (optional)</FormLabel>
                    <Input value={name || ''} onChange={e => setName(e.target.value)} placeholder="e.g., Top of Panorama" />
                </FormControl>
                <FormControl>
                    <FormLabel>Aliases (comma-separated)</FormLabel>
                    <Input value={aliasesString} onChange={e=> setAliasesString(e.target.value)} placeholder="e.g., Lunch Rock, Sunspot Lodge" />
                </FormControl>
                <FormControl error={!!formError}>
                    <FormLabel>Location (Latitude, Longitude)</FormLabel>
                    <Input 
                        value={locationString} 
                        onChange={e => setLocationString(e.target.value)} 
                        placeholder="e.g., 39.875, -105.760" 
                    />
                    {formError && <FormHelperText>{formError}</FormHelperText>}
                </FormControl>
                <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Select value={type} onChange={(_, newValue) => setType(newValue || 'intersection')}>
                        <Option value="intersection">Intersection</Option>
                        <Option value="lift_top">Lift Top</Option>
                        <Option value="lift_bottom">Lift Bottom</Option>
                        <Option value="lodge">Lodge</Option>
                    </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button type="submit" loading={isSubmitting}>Save Point</Button>
                    <Button variant="outlined" color="neutral" onClick={onCancel}>Cancel</Button>
                </Box>
            </form>
        </Sheet>
    );
};

export default PointOfInterestForm;