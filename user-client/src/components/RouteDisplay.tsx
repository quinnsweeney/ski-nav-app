import {
  Box,
  Button,
  Sheet,
  Typography,
} from "@mui/joy";
import type { RouteDisplayProps, RouteStep } from "../types";
import { useMemo, useState } from "react";
import Compass from "./Compass";
import { getBearing, getDistance } from "../utils/geolocationHelpers";
import useGeolocation from "../utils/useGeolocation";

export default function RouteDisplay({ path, onReset }: RouteDisplayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { location: userLocation, error: locationError } = useGeolocation();

  const aggregatedPath = useMemo(() => {
    if (!path || path.length === 0) return [];
    const newPath: RouteStep[] = [];
    let currentStep: RouteStep | null = null;
    for (const step of path) {
      if (
        currentStep &&
        step.type === "trail" &&
        currentStep.type === "trail" &&
        step.name === currentStep.name
      ) {
        currentStep.estimated_time_minutes += step.estimated_time_minutes;
        currentStep.end_coords = step.end_coords;
      } else {
        if (currentStep) newPath.push(currentStep);
        currentStep = { ...step };
      }
    }
    if (currentStep) newPath.push(currentStep);
    return newPath;
  }, [path]);

  const displayPath = useMemo(
    () => aggregatedPath.filter((step) => step.name !== "Connector"),
    [aggregatedPath]
  );

  if (displayPath.length === 0) {
    return (
      <Sheet>
        <Typography>
          Route calculation complete, but no displayable steps found.
        </Typography>
        <Button
          fullWidth
          sx={{ mt: 2 }}
          onClick={onReset}
          variant="outlined"
          color="neutral"
        >
          Go Back
        </Button>
      </Sheet>
    );
  }

  const currentStep = displayPath[currentStepIndex];
  const isLastStep = currentStepIndex === displayPath.length - 1;

  const distance =
    userLocation && currentStep
      ? getDistance(userLocation, currentStep.end_coords)
      : null;
  const bearing =
    userLocation && currentStep
      ? getBearing(userLocation, currentStep.end_coords)
      : 0;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <Sheet>
      <Typography level="h2" component="h2" sx={{ mb: 2, textAlign: "center" }}>
        Your Route
      </Typography>

      <Box
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "lg",
          minHeight: "150px",
        }}
      >
        <Typography level="body-sm" sx={{ textAlign: "center" }}>
          Step {currentStepIndex + 1} of {displayPath.length}
        </Typography>
        <Typography
          level="h3"
          component="div"
          sx={{ textAlign: "center", my: 1 }}
        >
          {currentStep.type === "lift" ? "Take the" : "Ski down"}{" "}
          <strong>{currentStep.name}</strong>
        </Typography>
        <Typography level="body-sm" sx={{ textAlign: "center" }}>
          (About {Math.round(currentStep.estimated_time_minutes)} minutes)
        </Typography>
      </Box>

      {userLocation && distance !== null ? (
        <Compass distance={distance} bearing={bearing} />
      ) : (
        <Typography level="body-sm" sx={{ textAlign: "center", my: 2 }}>
          {locationError || "Getting your location..."}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          fullWidth
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
        >
          Previous Step
        </Button>
        <Button fullWidth onClick={handleNext} disabled={isLastStep}>
          Next Step
        </Button>
      </Box>

      <Button
        fullWidth
        sx={{ mt: 2 }}
        onClick={onReset}
        variant="outlined"
        color="neutral"
      >
        End Route
      </Button>
    </Sheet>
  );
}
