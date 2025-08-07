export interface PointOfInterest {
    id: number;
    name: string | null;
    type: string;
    latitude: number;
    longitude: number;
    aliases: string[] | null;
}

export interface Resort {
    id: number;
    name: string;
    location: string;
}

export interface Lift {
    id: number;
    name: string;
}

export interface RouteStep {
    id: number;
    name: string;
    type: 'lift' | 'trail';
    estimated_time_minutes: number;
    start_coords: { lat: number; lng: number };
    end_coords: { lat: number; lng: number };
}

export interface PathfindingResult {
    message: string;
    path: RouteStep[];
    // Add other result properties as needed
}

// --- RouteFinderForm Component ---
export interface RouteFinderFormProps {
    resortId: number; // We'll hardcode this for now
    onPathFound: (path: RouteStep[]) => void;
    setIsLoading: (loading: boolean) => void;
    setApiError: (error: string | null) => void;
}

export interface RouteDisplayProps {
    path: RouteStep[];
    onReset: () => void;
}