import { CircularProgress, Sheet, Typography } from "@mui/joy";
import RouteDisplay from "../components/RouteDisplay";
import { useEffect, useState } from "react";
import type { Resort, RouteStep } from "../types";
import api from "../api";
import slugify from "../utils/slugify";
import { useParams } from "react-router-dom";
import RouteFinderForm from "../components/RouteFinderForm";

export default function ResortPage() {
    const { resortSlug } = useParams<{ resortSlug: string }>();
    const [resort, setResort] = useState<Resort | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [path, setPath] = useState<RouteStep[] | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        api.get<Resort[]>('/resorts').then(res => {
            const foundResort = res.data.find(r => slugify(r.name) === resortSlug);
            if (foundResort) {
                setResort(foundResort);
            } else {
                setApiError("Resort not found.");
            }
        }).catch(() => {
            setApiError("Failed to load resort data.");
        }).finally(() => {
            setIsLoading(false);
        });
    }, [resortSlug]);

    const handleReset = () => {
        setPath(null);
        setApiError(null);
    };

    if (isLoading) {
        return <CircularProgress />;
    }
    if (apiError && !resort) {
        return <Typography color="danger">{apiError}</Typography>;
    }
    if (!resort) {
        return null; // Should not happen if error handling is correct
    }

    return (
        <>
            <Typography level="h1" component="h1" sx={{ textAlign: 'center', mb: 2 }}>
                {resort.name}
            </Typography>

            {apiError && (
                <Sheet color="danger" variant="soft" sx={{ p: 2, mb: 2, borderRadius: 'sm' }}>
                    <Typography color="danger">{apiError}</Typography>
                </Sheet>
            )}

            {path ? (
                <RouteDisplay path={path} onReset={handleReset} />
            ) : (
                <RouteFinderForm 
                    resortId={resort.id}
                    onPathFound={setPath}
                    setIsLoading={() => {}} // Loading state can be handled here if needed
                    setApiError={setApiError}
                />
            )}
        </>
    );
}