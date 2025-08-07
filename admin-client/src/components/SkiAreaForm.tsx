import { Button, FormControl, FormLabel, Input, Sheet, Typography } from "@mui/joy";
import { useState } from "react";
import type { Resort } from "../types";
import adminAPI from "../api";

interface SkiAreaFormProps {
    onResortAdded: (newResort: Resort) => void;
    onCancel: () => void;
}

export default function SkiAreaForm({ onResortAdded, onCancel }: SkiAreaFormProps) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        adminAPI.post("/ski-areas", { name, location })
            .then(response => {
                onResortAdded(response.data);
                setName('');
                setLocation('');
            })
            .catch(err => {
                console.error("Error adding ski area:", err);
                setError("Failed to add ski area. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    return (
        <Sheet sx={{ p: 2, border: '1px solid #ddd', borderRadius: '8px', my: 2 }}>
            <Typography level="h2" component="h2" sx={{ fontSize: '1.5rem', mb: 2 }}>Add New Resort</Typography>
            <form onSubmit={handleSubmit}>
                <FormControl>
                    <FormLabel>Resort Name</FormLabel>
                    <Input 
                        name="name"
                        value={name} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                        placeholder="e.g., Vail Ski Resort"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input 
                        name="location"
                        value={location} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} 
                        placeholder="e.g., Vail, CO"
                    />
                </FormControl>
                {error && <Typography sx={{ color: 'danger.500', mb: 2 }}>{error}</Typography>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="submit" color="primary" loading={isSubmitting}>
                        Save Resort
                    </Button>
                    <Button variant="outlined" color="neutral" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Sheet>
    );
}