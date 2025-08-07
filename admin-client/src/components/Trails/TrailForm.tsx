import { useState } from "react";
import type { Trail } from "../../types";
import { Box, Button, Checkbox, FormControl, FormLabel, Input, Option, Select, Sheet, Typography } from "@mui/joy";
import adminAPI from "../../api";

interface TrailFormProps {
    resortId: number;
    onSave: (trail: Trail) => void;
    onCancel: () => void;
    editingTrail: Trail | null;
}

export default function TrailForm({ resortId, onSave, onCancel, editingTrail }: TrailFormProps) {
    const [name, setName] = useState(editingTrail ? editingTrail.name : '');
    const [difficulty, setDifficulty] = useState(editingTrail ? editingTrail.difficulty : 'green');
    const [isGroomer, setIsGroomer] = useState(editingTrail ? editingTrail.is_groomer : false);
    const [hasMoguls, setHasMoguls] = useState(editingTrail ? editingTrail.has_moguls : false);
    const [isTrees, setIsTrees] = useState(editingTrail ? editingTrail.is_trees : false);
    const [isSteep, setIsSteep] = useState(editingTrail ? editingTrail.is_steep : false);
    const [isOfficialRun, setIsOfficialRun] = useState(editingTrail ? editingTrail.is_official_run : false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ski_area_id: resortId,
            name,
            difficulty,
            is_groomer: isGroomer,
            has_moguls: hasMoguls,
            is_trees: isTrees,
            is_steep: isSteep,
            is_official_run: isOfficialRun
        };

        const request = editingTrail
            ? adminAPI.put(`/trails/${editingTrail.id}`, payload)
            : adminAPI.post(`/trails`, payload);

        request
            .then(response => {
                onSave(response.data); // Notify parent of the save/update
            })
            .catch(error => {
                console.error("Error saving trail:", error);
                alert("Failed to save trail. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
                onCancel(); // Close the form after saving
            });
    };

    return (
        <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'sm', my: 2 }}>
            <Typography level="h4" component="h3" sx={{ mb: 2 }}>
                {editingTrail ? 'Edit Trail' : 'Add New Trail'}
            </Typography>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input value={name || ''} onChange={e => setName(e.target.value)} placeholder="e.g., Trestle" />
                </FormControl>
                <FormControl>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={difficulty} onChange={(_, val) => setDifficulty(val || 'green')}>
                        <Option value="green">Green</Option>
                        <Option value="blue">Blue</Option>
                        <Option value="blue-black">Blue/Black</Option>
                        <Option value="black">Black</Option>
                        <Option value="double-black">Double Black</Option>
                        <Option value="terrain-park">Terrain Park</Option>
                    </Select>
                </FormControl>
                <FormControl>
                    <Checkbox
                        label="Is Groomer"
                        checked={isGroomer} 
                        onChange={e => setIsGroomer(e.target.checked)} 
                    />
                </FormControl>
                <FormControl>
                    <Checkbox
                        label="Has Moguls"
                        checked={hasMoguls} 
                        onChange={e => setHasMoguls(e.target.checked)} 
                    />
                </FormControl>
                <FormControl>
                    <Checkbox
                        label="Is Trees"
                        checked={isTrees} 
                        onChange={e => setIsTrees(e.target.checked)}
                    />
                </FormControl>
                <FormControl>
                    <Checkbox
                        label="Is Steep"
                        checked={isSteep} 
                        onChange={e => setIsSteep(e.target.checked)} 
                    />
                </FormControl>
                <FormControl>
                    <Checkbox
                        label="Is Official Run"
                        checked={isOfficialRun} 
                        onChange={e => setIsOfficialRun(e.target.checked)} 
                    />
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button type="submit" loading={isSubmitting}>
                        Save Trail
                    </Button>
                    <Button variant="outlined" color="neutral" onClick={onCancel}>
                        Cancel
                    </Button>
                </Box>
            </form>
        </Sheet>
    )
}