import type { ColorPaletteProp } from "@mui/joy";

export interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export interface Resort {
    id: number;
    name: string;
    location: string;
}

export interface PointOfInterest {
    id: number;
    ski_area_id: number;
    name: string | null;
    type: string;
    latitude: number;
    longitude: number;
    aliases: string[] | null;
}

export interface Lift {
    id: number;
    ski_area_id: number;
    name: string;
    start_point_id: number;
    end_point_id: number;
    lift_type: string;
    estimated_time_minutes: number;
}

type Difficulty = 'green' | 'blue' | 'blue-black' | 'black' | 'double_black' | 'terrain-park';

type DifficultyStyle = {
    color: ColorPaletteProp;
    label: string;
};

export const difficultyConfig: Record<Difficulty, DifficultyStyle> = {
    'green': { color: 'success', label: 'Green' },
    'blue': { color: 'primary', label: 'Blue' },
    'blue-black': { color: 'neutral', label: 'Blue-Black' },
    'black': { color: 'neutral', label: 'Black' },
    'double_black': { color: 'neutral', label: 'Double Black' },
    'terrain-park': { color: 'warning', label: 'Terrain Park' }
};

export interface Trail {
    id: number;
    ski_area_id: number;
    name: string;
    difficulty: Difficulty;
    is_groomer: boolean;
    has_moguls: boolean;
    is_trees: boolean;
    is_steep: boolean;
    is_official_run: boolean;
}

export interface TrailSegment {
    id: number;
    trail_id: number;
    start_point_id: number;
    end_point_id: number;
    estimated_time_minutes: number;
    requires_hike: boolean;
}

export interface ResortDataProps {
    resort: Resort;
}

export interface GraphNode {
    id: number;
    name: string;
    type: string;
    color: string;
    lat: number;
    lng: number;
}

export interface GraphLink {
    id: string;
    source: number;
    target: number;
    name: string;
    color: string;
    type: 'lift' | 'trail' | 'segment';
    start_coords: { lat: number; lng: number };
    end_coords: { lat: number; lng: number };
}