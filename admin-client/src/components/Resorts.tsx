import { Button, CircularProgress, List, ListItem, ListItemButton, Sheet, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import type { Resort } from "../types";
import SkiAreaForm from "./SkiAreaForm";
import adminAPI from "../api";

interface ResortsProps {
    onSelectResort: (resort: Resort) => void;
}

export default function Resorts({ onSelectResort }: ResortsProps) {
    const [resorts, setResorts] = useState<Resort[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        adminAPI.get("/ski-areas")
            .then(response => {
                setResorts(response.data);
            })
            .catch(err => {
                console.error("Error fetching ski areas:", err);
                setError(error);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, []);

    function handleResortAdded (newResort: Resort) {
        setResorts(current => [...current, newResort]);
        setShowAddForm(false);
    }

    if (isLoading) {
        return (
            <Sheet>
                <CircularProgress />
            </Sheet>
        )
    }

    if (error) {
        return (
            <Sheet>
                <Typography level="h2" component="h2">Error</Typography>
                <Typography>{error}</Typography>
            </Sheet>
        )
    }

    return (
        <Sheet>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Typography level="h2" component="h2">Select a Resort</Typography>
                {!showAddForm && (
                     <Button onClick={() => setShowAddForm(true)}>Add Resort</Button>
                )}
            </div>
            {showAddForm && (
                <SkiAreaForm onResortAdded={handleResortAdded} onCancel={() => setShowAddForm(false)} />
            )}
            <List>
                {resorts.map(resort => (
                    <ListItem key={resort.id}>
                        <ListItemButton onClick={() => onSelectResort(resort)}>
                            <Typography level="body-lg">{resort.name}</Typography>
                            <Typography level="body-sm">{resort.location}</Typography>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Sheet>
    )
}