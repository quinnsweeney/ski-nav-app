import { Button, CircularProgress, Sheet, Typography } from "@mui/joy";
import RouteDisplay from "../components/RouteDisplay";
import { useEffect, useMemo, useState } from "react";
import type { Resort, RouteStep } from "../types";
import api from "../api";
import slugify from "../utils/slugify";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import RouteFinderForm from "../components/RouteFinderForm";
import queryString from "query-string";

export default function ResortPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { resortSlug } = useParams<{ resortSlug: string }>();
    const [resort, setResort] = useState<Resort | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [path, setPath] = useState<RouteStep[] | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const initialFormValues = useMemo(() => {
        const params = queryString.parse(location.search);
        return{
            startPointId: params.start ? Number(params.start) : null,
            endPointId: params.end ? Number(params.end) : null,
            maxDifficulty: typeof params.difficulty === 'string' ? params.difficulty : 'blue',
            avoidLifts: typeof params.avoid === 'string' ? params.avoid.split(',').map(Number) : [],
        }
    }, [location.search]);
    
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

    useEffect(() => {
        if(resort && initialFormValues.startPointId && initialFormValues.endPointId) {
            setIsLoading(true);
            const payload = {
                ski_area_id: resort.id,
                start_point_id: initialFormValues.startPointId,
                end_point_id: initialFormValues.endPointId,
                max_difficulty: initialFormValues.maxDifficulty,
                avoid_lifts: initialFormValues.avoidLifts,
            };
            api.post<RouteStep[]>('/route', payload)
                .then(res => {
                    if(res.data.length > 0) {
                        setPath(res.data);
                    } else {
                        setApiError("No route found.");
                    }
                })
                .catch(() => {
                    setApiError("Failed to find route.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if(resort) {
            setIsLoading(false);
        }
    }, [resort]);

    const handlePathFound = (foundPath: RouteStep[], formState: any) => {
        setPath(foundPath);
        const newSearch = queryString.stringify({
            start: formState.startPointId,
            end: formState.endPointId,
            difficulty: formState.maxDifficulty,
            avoid: formState.avoidLifts.join(','),
        });
        navigate(`${location.pathname}?${newSearch}`);
    };

    const handleReset = () => {
        setPath(null);
        setApiError(null);
        navigate(location.pathname);
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
            <Button component={Link} to="/resorts" variant="outlined" sx={{ mb: 2 }}>
                Back to Resorts
            </Button>
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
                    onPathFound={handlePathFound}
                    setIsLoading={setIsLoading}
                    setApiError={setApiError}
                    initialValues={initialFormValues}
                />
            )}
        </>
    );
}