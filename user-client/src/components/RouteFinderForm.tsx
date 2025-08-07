import { useEffect, useState } from "react";
import type {
  Lift,
  PointOfInterest,
  RouteFinderFormProps,
  RouteStep,
} from "../types";
import api from "../api";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  createFilterOptions,
  FormControl,
  FormLabel,
  List,
  ListItem,
  Option,
  Select,
  Sheet,
} from "@mui/joy";

import type { FilterOptionsState } from "@mui/base/useAutocomplete";

const filter = createFilterOptions<PointOfInterest>();

const filterOptions = (
  options: PointOfInterest[],
  state: FilterOptionsState<PointOfInterest>
) => {
  const filtered = filter(options, state);

  // Also search in aliases
  if (state.inputValue !== "") {
    options.forEach((option) => {
      if (
        option.aliases &&
        option.aliases.some((alias) =>
          alias.toLowerCase().includes(state.inputValue.toLowerCase())
        ) &&
        !filtered.some((f) => f.id === option.id)
      ) {
        filtered.push(option);
      }
    });
  }

  return filtered;
};

export default function RouteFinderForm({
  resortId,
  onPathFound,
  setIsLoading,
  setApiError,
}: RouteFinderFormProps) {
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [startPointId, setStartPointId] = useState<number | null>(null);
  const [endPointId, setEndPointId] = useState<number | null>(null);
  const [maxDifficulty, setMaxDifficulty] = useState<string>("blue");
  const [avoidLifts, setAvoidLifts] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      api.get(`/resorts/${resortId}/pois`),
      api.get(`/resorts/${resortId}/lifts`),
    ])
      .then(([poisResponse, liftsResponse]) => {
        setPois(poisResponse.data);
        setLifts(liftsResponse.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setApiError("Failed to load data. Please try again later.");
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, [resortId, setApiError]);

  const handleLiftToggle = (liftId: number) => {
    setAvoidLifts((prev) =>
      prev.includes(liftId)
        ? prev.filter((id) => id !== liftId)
        : [...prev, liftId]
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startPointId || !endPointId) {
      alert("Please select a start and end location.");
      return;
    }
    setIsLoading(true);
    setApiError(null);

    const payload = {
      ski_area_id: resortId,
      start_point_id: startPointId,
      end_point_id: endPointId,
      max_difficulty: maxDifficulty,
      avoid_lifts: avoidLifts,
    };

    api
      .post<RouteStep[]>("/route", payload)
      .then((response) => {
        if (response.data && response.data.length > 0) {
          onPathFound(response.data);
        } else {
          setApiError(
            "No route found. Please adjust your options and try again."
          );
        }
      })
      .catch((err) => {
        console.error("Pathfinding error:", err);
        setApiError(
          "Could not find a route. Please adjust your options and try again."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoadingData) {
    return (
      <Sheet sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Sheet>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Where are you right now?</FormLabel>
        <Autocomplete
          placeholder="Search for a location..."
          options={pois}
          getOptionLabel={(option) => option.name || `Unnamed ${option.type}`}
          onChange={(_, newValue) => setStartPointId(newValue?.id || null)}
          filterOptions={filterOptions}
        />
      </FormControl>
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Where do you need to get to?</FormLabel>
        <Autocomplete
          placeholder="Search for a destination..."
          options={pois}
          getOptionLabel={(option) => option.name || `Unnamed ${option.type}`}
          onChange={(_, newValue) => setEndPointId(newValue?.id || null)}
          filterOptions={filterOptions}
        />
      </FormControl>
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Max trail difficulty</FormLabel>
        <Select
          value={maxDifficulty}
          onChange={(_, newValue) => setMaxDifficulty(newValue || "blue")}
        >
          <Option value="green">Green</Option>
          <Option value="blue">Blue</Option>
          <Option value="black">Black</Option>
          <Option value="double_black">Double Black</Option>
        </Select>
      </FormControl>
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Lifts to avoid (optional)</FormLabel>
        <Box
          role="group"
          sx={{
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "sm",
            p: 1,
          }}
        >
          <List>
            {lifts.map((lift) => (
              <ListItem key={lift.id}>
                <Checkbox
                  label={lift.name}
                  checked={avoidLifts.includes(lift.id)}
                  onChange={() => handleLiftToggle(lift.id)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </FormControl>
      <Button type="submit" fullWidth>
        Find Route
      </Button>
    </form>
  );
}
