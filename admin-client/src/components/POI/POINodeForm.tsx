import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Sheet,
  Typography,
  Textarea,
} from "@mui/joy";
import adminAPI from "../../api";

interface POINodeFormProps {
  resortId: number;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

function POINodeForm({ resortId, onSaveSuccess, onCancel }: POINodeFormProps) {
  const [abbreviation, setAbbreviation] = useState("");
  const [coordinatesText, setCoordinatesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const parseCoordinates = (text: string): [number, number][] | null => {
    try {
      // First, make the text into valid JSON array by wrapping in brackets if not already
      const jsonText = text.trim().startsWith("[") ? text : `[${text}]`;

      // Try to parse the entire thing as JSON
      const parsed = JSON.parse(jsonText);

      // Validate the structure
      if (!Array.isArray(parsed)) {
        throw new Error("Not an array");
      }

      // Process each coordinate pair
      const coordinates = parsed.map((item) => {
        // Handle both array format and pre-split numbers
        if (
          Array.isArray(item) &&
          item.length === 2 &&
          typeof item[0] === "number" &&
          typeof item[1] === "number"
        ) {
          return item as [number, number];
        }
        throw new Error("Invalid coordinate pair");
      });

      return coordinates;
    } catch (error) {
      console.error("Error parsing coordinates:", error);
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!abbreviation.trim()) {
      setFormError("Please enter an abbreviation");
      return;
    }

    const coordinates = parseCoordinates(coordinatesText);
    if (!coordinates || coordinates.length === 0) {
      setFormError("Invalid coordinates format. Please check your input.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create POIs in parallel
      const requests = coordinates.map((coord, index) => {
        const payload = {
          ski_area_id: resortId,
          name: `${abbreviation}${index + 1}`,
          type: "node",
          longitude: coord[0], // First coordinate is longitude
          latitude: coord[1], // Second coordinate is latitude
          aliases: null,
        };
        return adminAPI.post("/points-of-interest", payload);
      });

      await Promise.all(requests);
      onSaveSuccess();
    } catch (err) {
      console.error("Error saving POIs:", err);
      setFormError("An error occurred while saving the points.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: "sm", my: 2 }}>
      <Typography level="h4" component="h3" sx={{ mb: 2 }}>
        Add Multiple POI Nodes
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <FormControl>
          <FormLabel>Abbreviation</FormLabel>
          <Input
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            placeholder="e.g., TR (will create TR1, TR2, etc.)"
          />
        </FormControl>
        <FormControl error={!!formError}>
          <FormLabel>
            Coordinates (paste array of [longitude, latitude] pairs)
          </FormLabel>
          <Textarea
            value={coordinatesText}
            onChange={(e) => setCoordinatesText(e.target.value)}
            minRows={8}
            placeholder="[
  [-105.7711386, 39.8835237],
  [-105.7707438, 39.8836596],
  [-105.7703484, 39.8836828]
]"
          />
          {formError && <FormHelperText>{formError}</FormHelperText>}
        </FormControl>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button type="submit" loading={isSubmitting}>
            Save All Points
          </Button>
          <Button variant="outlined" color="neutral" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Sheet>
  );
}

export default POINodeForm;
