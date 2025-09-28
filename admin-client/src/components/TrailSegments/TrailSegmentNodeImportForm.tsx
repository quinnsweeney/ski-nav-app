import { useState } from "react";
import type { PointOfInterest, Trail, TrailSegment } from "../../types";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Select,
  Sheet,
  Typography,
  Textarea,
  Option,
  Autocomplete,
} from "@mui/joy";
import adminAPI from "../../api";

interface TrailSegmentNodeImportFormProps {
  trails: Trail[];
  pois: PointOfInterest[];
  resortId: number;
  onSave: (newSegments: TrailSegment[]) => void;
  onCancel: () => void;
}

function TrailSegmentNodeImportForm({
  trails,
  pois,
  onSave,
  onCancel,
}: TrailSegmentNodeImportFormProps) {
  const [selectedTrailId, setSelectedTrailId] = useState<number | null>(null);
  const [nodeIdsText, setNodeIdsText] = useState("");
  const [totalTimeMinutes, setTotalTimeMinutes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const parseNodeIds = (text: string): number[] | null => {
    try {
      // Try to parse the entire thing as JSON
      const parsed = JSON.parse(text);

      // Validate that it's an array of numbers
      if (
        !Array.isArray(parsed) ||
        !parsed.every((id) => typeof id === "number")
      ) {
        throw new Error("Not an array of numbers");
      }

      return parsed;
    } catch (error) {
      console.error("Error parsing node IDs:", error);
      return null;
    }
  };

  const getPoisByNames = async (
    names: number[]
  ): Promise<PointOfInterest[]> => {
    const foundPois: PointOfInterest[] = [];
    await adminAPI
      .post("/points-of-interest-by-names", { names })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          foundPois.push(...res.data);
        }
      });
    return foundPois;
  };

  const updatePois = async (
    startPoint: PointOfInterest,
    endPoint: PointOfInterest,
    trailName: string
  ) => {
    if (startPoint.type === "node") {
      startPoint.type = "intersection";
      startPoint.name = `${trailName} (start)`;
      const startIndex = pois.findIndex((p) => p.id === startPoint.id);
      pois[startIndex] = await adminAPI.put(
        `/points-of-interest/${startPoint.id}`,
        startPoint
      );
    } else {
      const startIndex = pois.findIndex((p) => p.id === startPoint.id);
      startPoint.aliases
        ? startPoint.aliases.push(`${trailName} (start)`)
        : (startPoint.aliases = [`${trailName} (start)`]);
      pois[startIndex] = await adminAPI.put(
        `/points-of-interest/${startPoint.id}`,
        startPoint
      );
    }
    if (endPoint.type === "node") {
      endPoint.type = "intersection";
      endPoint.name = `${trailName} (end)`;
      pois[pois.findIndex((p) => p.id === endPoint.id)] = await adminAPI.put(
        `/points-of-interest/${endPoint.id}`,
        endPoint
      );
    } else {
      const endIndex = pois.findIndex((p) => p.id === endPoint.id);
      endPoint.aliases
        ? endPoint.aliases.push(`${trailName} (end)`)
        : (endPoint.aliases = [`${trailName} (end)`]);
      pois[endIndex] = await adminAPI.put(
        `/points-of-interest/${endPoint.id}`,
        endPoint
      );
    }
  };

  const findByOSMID = (id: number): PointOfInterest | undefined => {
    return pois.find((poi) => poi.osm_id === id);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!selectedTrailId) {
      setFormError("Please select a trail");
      return;
    }

    if (!totalTimeMinutes || parseInt(totalTimeMinutes) <= 0) {
      setFormError("Please enter a valid total time");
      return;
    }

    const nodeIds = parseNodeIds(nodeIdsText);
    if (!nodeIds || nodeIds.length < 2) {
      setFormError("Please provide at least 2 valid node IDs");
      return;
    }

    // const foundPois = await getPoisByNames(nodeIds);
    const foundPois = nodeIds
      .map((osm_id) => findByOSMID(osm_id))
      .filter(Boolean) as PointOfInterest[];

    // Verify all nodes exist
    const missingNodes: number[] = [];
    nodeIds.forEach((id) => {
      if (!foundPois.find((poi) => poi.id === id || poi.osm_id === id)) {
        missingNodes.push(id);
      }
    });

    if (missingNodes.length > 0) {
      setFormError(
        `The following nodes were not found: ${missingNodes.join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate time per segment
      const timePerSegment = parseInt(totalTimeMinutes) / (nodeIds.length - 1);

      // Create segments connecting sequential nodes
      const segments = [];
      for (let i = 0; i < nodeIds.length - 1; i++) {
        const startNode = foundPois[i];
        const endNode = foundPois[i + 1];

        if (!startNode || !endNode) {
          throw new Error("Node not found");
        }

        const payload = {
          trail_id: selectedTrailId,
          start_point_id: startNode.id,
          end_point_id: endNode.id,
          estimated_time_minutes: timePerSegment,
          requires_hike: false,
        };

        const response = await adminAPI.post("/trail-segments", payload);
        segments.push(response.data);
      }

      const startPoi = pois.find((p) => p.osm_id === nodeIds[0]);
      const endPoi = pois.find((p) => p.osm_id === nodeIds[nodeIds.length - 1]);
      if (startPoi && endPoi) {
        await updatePois(
          startPoi,
          endPoi,
          trails.find((t) => t.id === selectedTrailId)?.name || "Trail"
        );
      }

      onSave(segments);
    } catch (err) {
      console.error("Error saving trail segments:", err);
      setFormError("An error occurred while saving the segments.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: "sm", my: 2 }}>
      <Typography level="h4" component="h3" sx={{ mb: 2 }}>
        Import Trail Segments from Node IDs
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <FormControl>
          <FormLabel>Trail</FormLabel>
          <Autocomplete
            placeholder="Select a trail..."
            options={trails}
            getOptionLabel={(option) => option.name}
            value={trails.find((trail) => trail.id === selectedTrailId) || null}
            onChange={(_, value) => setSelectedTrailId(value ? value.id : null)}
          >
            {/* {trails.map((trail) => (
              <Option key={trail.id} value={trail.id}>
                {trail.name}
              </Option> */}
            {/* ))} */}
          </Autocomplete>
        </FormControl>

        <FormControl error={!!formError}>
          <FormLabel>Node IDs (in order of connection)</FormLabel>
          <Textarea
            value={nodeIdsText}
            onChange={(e) => setNodeIdsText(e.target.value)}
            minRows={8}
            placeholder={`[
  12439102638,
  12439102639,
  12439102640,
  12439102641,
  12439102642,
  12439102643,
  12439102638
]`}
          />
          {formError && <FormHelperText>{formError}</FormHelperText>}
          <FormHelperText>
            Paste an array of node IDs in the order they should be connected.
            The IDs should match the names of existing nodes.
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Total Time (minutes)</FormLabel>
          <FormHelperText>
            Total time to ski from first to last node
          </FormHelperText>
          <input
            type="number"
            value={totalTimeMinutes}
            onChange={(e) => setTotalTimeMinutes(e.target.value)}
            placeholder="e.g., 10"
            style={{ padding: "0.5rem" }}
          />
        </FormControl>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button type="submit" loading={isSubmitting}>
            Create Segments
          </Button>
          <Button variant="outlined" color="neutral" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Sheet>
  );
}

export default TrailSegmentNodeImportForm;
