import { useState } from "react";
import type { PointOfInterest, Trail, TrailSegment } from "../../types";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Sheet,
  Typography,
  Option,
} from "@mui/joy";
import adminAPI from "../../api";

interface TrailSegmentBulkFormProps {
  trails: Trail[];
  pois: PointOfInterest[];
  resortId: number;
  onSave: (newSegments: TrailSegment[]) => void;
  onCancel: () => void;
}

function TrailSegmentBulkForm({
  trails,
  pois,
  onSave,
  onCancel,
}: TrailSegmentBulkFormProps) {
  const [selectedTrailId, setSelectedTrailId] = useState<number | null>(null);
  const [nodePrefix, setNodePrefix] = useState("");
  const [totalTimeMinutes, setTotalTimeMinutes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const findSequentialNodes = (prefix: string): PointOfInterest[] => {
    const nodes: PointOfInterest[] = [];
    let index = 1;

    while (true) {
      const nodeName = `${prefix}${index}`;
      const node = pois.find(
        (poi) => poi.name === nodeName && poi.type === "node"
      );

      if (!node) break;
      nodes.push(node);
      index++;
    }

    return nodes;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!selectedTrailId) {
      setFormError("Please select a trail");
      return;
    }

    if (!nodePrefix) {
      setFormError("Please enter a node prefix");
      return;
    }

    if (!totalTimeMinutes || parseInt(totalTimeMinutes) <= 0) {
      setFormError("Please enter a valid total time");
      return;
    }

    const nodes = findSequentialNodes(nodePrefix);

    if (nodes.length < 2) {
      setFormError(
        `Could not find sequential nodes starting with "${nodePrefix}". Ensure nodes are named ${nodePrefix}1, ${nodePrefix}2, etc.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate time per segment
      const timePerSegment = parseInt(totalTimeMinutes) / (nodes.length - 1);

      // Create segments connecting sequential nodes
      const segments = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        const startNode = nodes[i];
        const endNode = nodes[i + 1];

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
        Bulk Create Trail Segments
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <FormControl error={!!formError}>
          <FormLabel>Trail</FormLabel>
          <Select
            placeholder="Select a trail..."
            value={selectedTrailId}
            onChange={(_, value) => setSelectedTrailId(value)}
          >
            {trails.map((trail) => (
              <Option key={trail.id} value={trail.id}>
                {trail.name}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Node Prefix</FormLabel>
          <Input
            value={nodePrefix}
            onChange={(e) => setNodePrefix(e.target.value)}
            placeholder="e.g., TR (will look for TR1, TR2, etc.)"
          />
          <FormHelperText>
            Enter the prefix used for the nodes (without the number)
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Total Time (minutes)</FormLabel>
          <Input
            type="number"
            value={totalTimeMinutes}
            onChange={(e) => setTotalTimeMinutes(e.target.value)}
            placeholder="e.g., 10"
          />
          <FormHelperText>
            Total time to ski from first to last node
          </FormHelperText>
        </FormControl>

        {formError && (
          <Typography color="danger" fontSize="sm">
            {formError}
          </Typography>
        )}

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

export default TrailSegmentBulkForm;
