import { useState } from "react";
import type { Lift, PointOfInterest } from "../../types";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Typography,
} from "@mui/joy";
import adminAPI from "../../api";

interface LiftFormProps {
  resortId: number;
  pois: PointOfInterest[];
  onSave: (lift: Lift) => void;
  onCancel: () => void;
  editingLift: Lift | null;
}

export default function LiftForm({
  resortId,
  pois,
  onSave,
  onCancel,
  editingLift,
}: LiftFormProps) {
  const [name, setName] = useState(editingLift?.name || "");
  const [liftType, setLiftType] = useState(
    editingLift?.lift_type || "high-speed-quad"
  );
  const [startPointId, setStartPointId] = useState<number | null>(
    editingLift?.start_point_id || null
  );
  const [endPointId, setEndPointId] = useState<number | null>(
    editingLift?.end_point_id || null
  );
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<
    number | null
  >(editingLift?.estimated_time_minutes || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startPointId || !endPointId) {
      alert("Please select both start and end points.");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      ski_area_id: resortId,
      name,
      lift_type: liftType,
      start_point_id: startPointId,
      end_point_id: endPointId,
      estimated_time_minutes: estimatedTimeMinutes,
    };

    const request = editingLift
      ? adminAPI.put(`/lifts/${editingLift.id}`, payload)
      : adminAPI.post(`/lifts`, payload);

    request
      .then((response) => {
        onSave(response.data);
      })
      .catch((err) => console.error("Error saving lift:", err))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: "sm", my: 2 }}>
      <Typography level="h4" component="h3" sx={{ mb: 2 }}>
        {editingLift ? "Edit Lift" : "Add New Lift"}
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <FormControl>
          <FormLabel>Lift Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Panorama Express"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Start Point</FormLabel>
          {/* <Select placeholder="Select a point..." value={startPointId} onChange={(_, val) => setStartPointId(val)}>
                        {pois.map(p => <Option key={p.id} value={p.id}>{p.name || `Point ${p.id}`}</Option>)}
                    </Select> */}
          <Autocomplete
            placeholder="Select a point..."
            options={pois}
            getOptionLabel={(option) => option.name || `Point ${option.id}`}
            value={pois.find((p) => p.id === startPointId) || null}
            onChange={(_, value) => setStartPointId(value ? value.id : null)}
          ></Autocomplete>
        </FormControl>
        <FormControl>
          <FormLabel>End Point</FormLabel>
          {/* <Select placeholder="Select a point..." value={endPointId} onChange={(_, val) => setEndPointId(val)}>
                        {pois.map(p => <Option key={p.id} value={p.id}>{p.name || `Point ${p.id}`}</Option>)}
                    </Select> */}
          <Autocomplete
            placeholder="Select a point..."
            options={pois}
            getOptionLabel={(option) => option.name || `Point ${option.id}`}
            value={pois.find((p) => p.id === endPointId) || null}
            onChange={(_, value) => setEndPointId(value ? value.id : null)}
          ></Autocomplete>
        </FormControl>
        <FormControl>
          <FormLabel>Estimated Time (minutes)</FormLabel>
          <Input
            type="number"
            value={estimatedTimeMinutes !== null ? estimatedTimeMinutes : ""}
            onChange={(e) =>
              setEstimatedTimeMinutes(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            placeholder="e.g., 5"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Lift Type</FormLabel>
          <Input
            value={liftType}
            onChange={(e) => setLiftType(e.target.value)}
            placeholder="e.g., high-speed-quad"
          />
        </FormControl>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button type="submit" loading={isSubmitting}>
            Save Lift
          </Button>
          <Button variant="outlined" color="neutral" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Sheet>
  );
}
