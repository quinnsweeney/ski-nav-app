import { useState } from "react";
import type { PointOfInterest, Trail, TrailSegment } from "../../types";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";
import adminAPI from "../../api";

interface TrailSegmentFormProps {
  resortId: number;
  pois: PointOfInterest[];
  trails: Trail[];
  onSave: (newSegment: TrailSegment) => void;
  onCancel: () => void;
  editingSegment: TrailSegment | null;
}

export default function TrailSegmentForm({
  pois,
  trails,
  onSave,
  onCancel,
  editingSegment,
}: TrailSegmentFormProps) {
  const [trailId, setTrailId] = useState<number | null>(
    editingSegment?.trail_id || null
  );
  const [startPointId, setStartPointId] = useState<number | null>(
    editingSegment?.start_point_id || null
  );
  const [endPointId, setEndPointId] = useState<number | null>(
    editingSegment?.end_point_id || null
  );
  const [estimatedTime, setEstimatedTime] = useState(
    editingSegment?.estimated_time_minutes?.toString() || ""
  );
  const [requiresHike, setRequiresHike] = useState(
    editingSegment?.requires_hike || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChaining, setIsChaining] = useState(false);

  const handleSubmit = (shouldClose: boolean) => {
    if (!startPointId || !endPointId) {
      alert("Please select a start and end point.");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      trail_id: trailId,
      start_point_id: startPointId,
      end_point_id: endPointId,
      estimated_time_minutes: parseInt(estimatedTime, 10) || 0,
      requires_hike: requiresHike,
    };

    const request = editingSegment
      ? adminAPI.put(`/trail-segments/${editingSegment.id}`, payload)
      : adminAPI.post(`/trail-segments`, payload);

    request
      .then((response) => {
        const savedSegment = response.data;
        onSave(savedSegment);

        if (shouldClose || editingSegment) {
          onCancel();
        } else {
          setIsChaining(true);
          setStartPointId(endPointId);
          setEndPointId(null);
          setEstimatedTime("");
          setRequiresHike(false);
        }
      })
      .catch((err) => console.error("Error saving trail segment:", err))
      .finally(() => setIsSubmitting(false));
  };

  const startPointValue = pois.find((p) => p.id === startPointId) || null;
  const endPointValue = pois.find((p) => p.id === endPointId) || null;

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: "sm", my: 2 }}>
      <Typography level="h4" component="h3" sx={{ mb: 2 }}>
        {editingSegment ? "Edit Trail Segment" : "Add New Trail Segment"}
      </Typography>
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <FormControl>
          <FormLabel>Belongs to Trail (optional)</FormLabel>
          <Select
            placeholder="Select a trail..."
            value={trailId}
            onChange={(_, val) => setTrailId(val)}
            disabled={isChaining || !!editingSegment} // Lock when chaining or editing
          >
            <Option value={null}>* Connector (No Trail) *</Option>
            {trails.map((t) => (
              <Option key={t.id} value={t.id}>
                {t.name}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Start Point</FormLabel>
          {/* <Select 
                        placeholder="Select a start point..." 
                        value={startPointId} 
                        onChange={(_, val) => setStartPointId(val)}
                        disabled={isChaining} // Lock when chaining
                    >
                        {pois.map(p => <Option key={p.id} value={p.id}>{p.name || `Point ${p.id}`}</Option>)}
                    </Select> */}
          <Autocomplete
            placeholder="Search for start point..."
            options={pois}
            getOptionLabel={(option) => option.name || `Point ${option.id}`}
            value={startPointValue}
            onChange={(_, newValue) => setStartPointId(newValue?.id || null)}
            disabled={isChaining}
          />
        </FormControl>
        <FormControl>
          <FormLabel>End Point</FormLabel>
          {/* <Select placeholder="Select an end point..." value={endPointId} onChange={(_, val) => setEndPointId(val)}>
                        {pois.map(p => <Option key={p.id} value={p.id}>{p.name || `Point ${p.id}`}</Option>)}
                    </Select> */}
          <Autocomplete
            placeholder="Search for end point..."
            options={pois}
            getOptionLabel={(option) => option.name || `Point ${option.id}`}
            value={endPointValue}
            onChange={(_, newValue) => setEndPointId(newValue?.id || null)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Estimated Time (minutes)</FormLabel>
          <Input
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="e.g., 5"
          />
        </FormControl>
        <FormControl>
          <Checkbox
            label="Requires Hike"
            checked={requiresHike}
            onChange={(e) => setRequiresHike(e.target.checked)}
          />
        </FormControl>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          {!editingSegment && (
            <Button
              onClick={() => handleSubmit(false)}
              loading={isSubmitting}
              color="primary"
            >
              Save & Add Next
            </Button>
          )}
          <Button
            onClick={() => handleSubmit(true)}
            loading={isSubmitting}
            variant="soft"
            color="success"
          >
            {editingSegment ? "Save Changes" : "Save & Close"}
          </Button>
          <Button variant="outlined" color="neutral" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Sheet>
  );
}
