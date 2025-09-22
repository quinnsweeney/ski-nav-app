import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import adminAPI from "../api";
import publicAPI from "../apiGuest";
import type {
  PointOfInterest,
  Lift,
  TrailSegment,
  Trail,
  Resort,
} from "../types";

interface ResortData {
  pois: PointOfInterest[];
  lifts: Lift[];
  segments: TrailSegment[];
  trails: Trail[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useResortData(resort: Resort): ResortData {
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [segments, setSegments] = useState<TrailSegment[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isGuest } = useAuth();

  const api = isGuest ? publicAPI : adminAPI;
  const basePath = isGuest ? `/resorts/${resort.id}` : "";

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [poisRes, liftsRes, segmentsRes, trailsRes] = await Promise.all([
        api.get<PointOfInterest[]>(
          isGuest
            ? `${basePath}/pois`
            : `/points-of-interest?ski_area_id=${resort.id}`
        ),
        api.get<Lift[]>(
          isGuest ? `${basePath}/lifts` : `/lifts?ski_area_id=${resort.id}`
        ),
        api.get<TrailSegment[]>(
          isGuest
            ? `${basePath}/trail-segments`
            : `/trail-segments?ski_area_id=${resort.id}`
        ),
        api.get<Trail[]>(
          isGuest ? `${basePath}/trails` : `/trails?ski_area_id=${resort.id}`
        ),
      ]);

      setPois(poisRes.data);
      setLifts(liftsRes.data);
      setSegments(segmentsRes.data);
      setTrails(trailsRes.data);
    } catch (err) {
      console.error("Failed to fetch resort data", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch resort data")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resort.id, isGuest]);

  return {
    pois,
    lifts,
    segments,
    trails,
    isLoading,
    error,
    refetch: fetchData,
  };
}
