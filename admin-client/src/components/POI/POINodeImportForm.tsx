import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Sheet,
  Typography,
  Textarea,
  LinearProgress,
} from "@mui/joy";
import adminAPI from "../../api";

interface POINodeImportFormProps {
  resortId: number;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

interface ImportNode {
  type: string;
  id: number;
  lat: number;
  lon: number;
}

function POINodeImportForm({
  resortId,
  onSaveSuccess,
  onCancel,
}: POINodeImportFormProps) {
  const [nodesText, setNodesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const parseNodes = (text: string): ImportNode[] | null => {
    try {
      // First, make the text into valid JSON array by wrapping in brackets if not already
      const jsonText = text.trim().startsWith("[") ? text : `[${text}]`;

      // Try to parse the entire thing as JSON
      const parsed = JSON.parse(jsonText);

      // Validate the structure
      if (!Array.isArray(parsed)) {
        throw new Error("Not an array");
      }

      // Validate each node
      const nodes = parsed.map((node) => {
        if (
          !node.type ||
          node.type !== "node" ||
          typeof node.id !== "number" ||
          typeof node.lat !== "number" ||
          typeof node.lon !== "number"
        ) {
          throw new Error("Invalid node format");
        }
        return node as ImportNode;
      });

      return nodes;
    } catch (error) {
      console.error("Error parsing nodes:", error);
      return null;
    }
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const processBatch = async (
    nodes: ImportNode[],
    startIndex: number,
    batchSize: number
  ) => {
    const endIndex = Math.min(startIndex + batchSize, nodes.length);
    const batch = nodes.slice(startIndex, endIndex);

    const requests = batch.map((node) => {
      const payload = {
        ski_area_id: resortId,
        name: node.id.toString(), // Use the OSM node ID as the name
        type: "node",
        latitude: node.lat,
        longitude: node.lon,
        aliases: null,
        osm_id: node.id,
      };
      return adminAPI.post("/points-of-interest", payload);
    });

    await Promise.all(requests);

    const processedCount = endIndex;
    const totalCount = nodes.length;
    const percentComplete = Math.round((processedCount / totalCount) * 100);
    setProgress(
      `Processed ${processedCount} of ${totalCount} nodes (${percentComplete}%)`
    );

    if (endIndex < nodes.length) {
      await sleep(10000); // 10 second pause between batches
      return processBatch(nodes, endIndex, batchSize);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setProgress("");

    const nodes = parseNodes(nodesText);
    if (!nodes || nodes.length === 0) {
      setFormError("Invalid node format. Please check your input.");
      return;
    }

    setIsSubmitting(true);

    try {
      await processBatch(nodes, 0, 500); // Process in batches of 500
      onSaveSuccess();
    } catch (err) {
      console.error("Error saving POIs:", err);
      setFormError("An error occurred while saving the points.");
    } finally {
      setIsSubmitting(false);
      setProgress("");
    }
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: "sm", my: 2 }}>
      <Typography level="h4" component="h3" sx={{ mb: 2 }}>
        Import OSM Nodes
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <FormControl error={!!formError}>
          <FormLabel>Nodes (paste array of OSM nodes)</FormLabel>
          <Textarea
            value={nodesText}
            onChange={(e) => setNodesText(e.target.value)}
            minRows={8}
            placeholder={`[
  {
    "type": "node",
    "id": 4120112230,
    "lat": 39.8490770,
    "lon": -105.8018152
  },
  {
    "type": "node",
    "id": 4120112231,
    "lat": 39.8491234,
    "lon": -105.8019876
  }
]`}
          />
          {formError && <FormHelperText>{formError}</FormHelperText>}
          <FormHelperText>
            Paste OpenStreetMap node data. The node ID will be used as the name.
            Nodes will be processed in batches of 100 with a 10-second pause
            between batches.
          </FormHelperText>
        </FormControl>

        {progress && (
          <Box sx={{ width: "100%", my: 2 }}>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              {progress}
            </Typography>
            <LinearProgress determinate={false} />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button type="submit" loading={isSubmitting}>
            Import Nodes
          </Button>
          <Button variant="outlined" color="neutral" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Sheet>
  );
}

export default POINodeImportForm;
