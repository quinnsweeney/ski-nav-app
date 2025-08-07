import {
  Button,
  CircularProgress,
  Sheet,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import {
  type PointOfInterest,
  type TrailSegment,
  type Lift,
  type Resort,
  type Trail,
type GraphLink,
type GraphNode,
} from "../types";
import PointsOfInterestManager from "./POI/POIManager";
import LiftsManager from "./Lifts/LiftsManager";
import TrailManager from "./Trails/TrailManager";
import TrailSegmentManager from "./TrailSegments/TrailSegmentManager";
import { useEffect, useMemo, useState } from "react";
import ResortVisualizer from "./ResortVisualizer";
import adminAPI from "../api";
import ResortMapVisualizer from "./ResortMapVisualizer";

interface ResortDetailsProps {
  resort: Resort;
  onBack: () => void;
}

export default function ResortDetails({ resort, onBack }: ResortDetailsProps) {
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [segments, setSegments] = useState<TrailSegment[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      adminAPI.get<PointOfInterest[]>(
        `/points-of-interest?ski_area_id=${resort.id}`
      ),
      adminAPI.get<Lift[]>(`/lifts?ski_area_id=${resort.id}`),
      adminAPI.get<TrailSegment[]>(`/trail-segments?ski_area_id=${resort.id}`),
      adminAPI.get<Trail[]>(`/trails?ski_area_id=${resort.id}`),
    ])
      .then(([poisRes, liftsRes, segmentsRes, trailsRes]) => {
        setPois(poisRes.data);
        setLifts(liftsRes.data);
        setSegments(segmentsRes.data);
        setTrails(trailsRes.data);
      })
      .catch((err) => {
        console.error("Failed to fetch resort data", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [resort.id]);

  const graphData = useMemo(() => {
    const transformedNodes = pois.map((poi) => ({
      id: poi.id,
      name: poi.name || `Unnamed ${poi.type}`,
      type: poi.type,
      color:
        poi.type === "lodge"
          ? "#f1c40f"
          : poi.type.includes("lift")
          ? "#3498db"
          : "#e74c3c",
      lat: poi.latitude,
      lng: poi.longitude,
    })) as GraphNode[];

    const liftLinks = lifts.map((lift):GraphLink => {
      //get lat and lng from start and end points of lift
      const startPoint = pois.find((p) => p.id === lift.start_point_id);
      const endPoint = pois.find((p) => p.id === lift.end_point_id);
      return {
        id: `lift-${lift.id}`,
        source: lift.start_point_id,
        target: lift.end_point_id,
        name: lift.name,
        color: "#3498db",
        type: "lift",
        start_coords: {
          lat: startPoint?.latitude || 0,
          lng: startPoint?.longitude || 0,
        },
        end_coords: {
          lat: endPoint?.latitude || 0,
          lng: endPoint?.longitude || 0,
        },
      };
    });

    const segmentLinks = segments.map((segment):GraphLink => {
      //get lat and lng from start and end points of segment
      const startPoint = pois.find((p) => p.id === segment.start_point_id);
      const endPoint = pois.find((p) => p.id === segment.end_point_id);

      return {
        id: `segment-${segment.id}`,
        source: segment.start_point_id,
        target: segment.end_point_id,
        name: `Segment ${segment.id}`,
        color: "#2ecc71",
        type: "segment",
        start_coords: {
          lat: startPoint?.latitude || 0,
          lng: startPoint?.longitude || 0,
        },
        end_coords: {
          lat: endPoint?.latitude || 0,
          lng: endPoint?.longitude || 0,
        },
      };
    });

    return { nodes: transformedNodes, links: [...liftLinks, ...segmentLinks] };
  }, [pois, lifts, segments]);

  return (
    <Sheet>
      <Button
        onClick={onBack}
        sx={{ mb: 2 }}
        variant="outlined"
        color="neutral"
      >
        &larr; Back to Resorts
      </Button>
      <Typography level="h2" component="h2">
        {resort.name} Details
      </Typography>

      <Tabs aria-label="Resort Data Management" defaultValue={0} sx={{ mt: 2 }}>
        <TabList>
          <Tab>Points of Interest</Tab>
          <Tab>Lifts</Tab>
          <Tab>Trails</Tab>
          <Tab>Trail Segments</Tab>
          <Tab>Resort Visualizer</Tab>
          <Tab>Map Visualizer</Tab>
        </TabList>
        <TabPanel value={0}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <PointsOfInterestManager
              resort={resort}
              pois={pois}
              onDataChange={fetchData}
            />
          )}
        </TabPanel>
        <TabPanel value={1}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <LiftsManager
              resort={resort}
              pois={pois}
              lifts={lifts}
              onDataChange={fetchData}
            />
          )}
        </TabPanel>
        <TabPanel value={2}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <TrailManager
              resort={resort}
              trails={trails}
              onDataChange={fetchData}
            />
          )}
        </TabPanel>
        <TabPanel value={3}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <TrailSegmentManager
              resort={resort}
              pois={pois}
              trails={trails}
              segments={segments}
              onDataChange={fetchData}
            />
          )}
        </TabPanel>
        <TabPanel value={4}>
          <ResortVisualizer isLoading={isLoading} graphData={graphData} />
        </TabPanel>
        <TabPanel value={5}>
          <ResortMapVisualizer isLoading={isLoading} graphData={graphData} />
        </TabPanel>
      </Tabs>
    </Sheet>
  );
}
