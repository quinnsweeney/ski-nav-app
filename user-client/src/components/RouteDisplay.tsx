import {
  Button,
  List,
  ListItem,
  ListItemDecorator,
  Sheet,
  Typography,
} from "@mui/joy";
import type { RouteDisplayProps, RouteStep } from "../types";
import { useMemo } from "react";

export default function RouteDisplay({ path, onReset }: RouteDisplayProps) {
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
        // If the current step is a trail and matches the previous one, aggregate it.
        currentStep.estimated_time_minutes += step.estimated_time_minutes;
        currentStep.end_coords = step.end_coords; // Update the end coordinates
      } else {
        // If there's a step being tracked, push it to the new path.
        if (currentStep) {
          newPath.push(currentStep);
        }
        // Start a new step.
        currentStep = { ...step };
      }
    }

    // Add the last aggregated step to the path.
    if (currentStep) {
      newPath.push(currentStep);
    }

    return newPath;
  }, [path]);

  const getStepText = (step: RouteStep, index: number) => {
    if (step.name === "Connector") {
      const nextStep = aggregatedPath[index + 1];
      if (nextStep) {
        const verb =
          nextStep.type === "lift" ? "Continue to the" : "Traverse to";
        return (
          <Typography>
            {verb} <strong>{nextStep.name}</strong>
          </Typography>
        );
      }
      return <Typography>Follow the connector trail</Typography>;
    }

    return (
      <>
        <Typography>
          {step.type === "lift" ? "Take the" : "Ski down"}{" "}
          <strong>{step.name}</strong>
        </Typography>
        <Typography level="body-sm">
          (About {Math.round(step.estimated_time_minutes)} minutes)
        </Typography>
      </>
    );
  };

  let listIndex = 0;

  return (
    <Sheet>
      <Typography level="h2" component="h2" sx={{ mb: 2 }}>
        Your Route
      </Typography>
      <List sx={{ "--ListItem-paddingX": "0px" }}>
        {aggregatedPath.map((step, index) => {
          if (step.name === "Connector" && step.estimated_time_minutes <= 1) {
            return null;
          }
          listIndex++;
          return (
            <ListItem key={`${step.type}-${step.id}-${index}`}>
              <ListItemDecorator>
                <Typography sx={{ fontWeight: "bold" }}>
                  {listIndex}.
                </Typography>
              </ListItemDecorator>
              <div>{getStepText(step, index)}</div>
            </ListItem>
          );
        })}
      </List>
      <Button fullWidth sx={{ mt: 3 }} onClick={onReset} variant="outlined">
        Find Another Route
      </Button>
    </Sheet>
  );
}
