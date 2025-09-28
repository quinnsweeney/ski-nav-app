import { useState } from "react";
import type { PointOfInterest, Resort } from "../../types";
import { Box, Button, List, ListItem, Sheet, Typography } from "@mui/joy";
import PointOfInterestForm from "./POIForm";
import POINodeForm from "./POINodeForm";
import POINodeImportForm from "./POINodeImportForm";
import adminAPI from "../../api";

interface PointsOfInterestManagerProps {
  resort: Resort;
  pois: PointOfInterest[];
  onDataChange: () => void;
}

const PointsOfInterestManager: React.FC<PointsOfInterestManagerProps> = ({
  resort,
  pois,
  onDataChange,
}) => {
  const [editingPoi, setEditingPoi] = useState<PointOfInterest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const isGuest = localStorage.getItem("admin_token") === "guest_token";

  const handleSaveSuccess = () => {
    setEditingPoi(null);
    setShowForm(false);
    setShowNodeForm(false);
    setShowImportForm(false);
    onDataChange();
  };

  const handleDelete = (poiId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this point of interest? This could affect lifts or trails."
      )
    ) {
      adminAPI
        .delete(`/points-of-interest/${poiId}`)
        .then(() => {
          onDataChange();
        })
        .catch((err) => {
          console.error("Failed to delete POI", err);
          alert(
            "Could not delete the POI. It may be in use by a lift or trail segment"
          );
        });
    }
  };

  const handleEditClick = (poi: PointOfInterest) => {
    setEditingPoi(poi);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingPoi(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingPoi(null);
    setShowForm(false);
  };

  return (
    <Sheet>
      {!showForm && !showNodeForm && !showImportForm && (
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button disabled={isGuest} onClick={handleAddClick}>
            Add New Point of Interest
          </Button>
          <Button
            disabled={isGuest}
            onClick={() => setShowNodeForm(true)}
            variant="soft"
            startDecorator="⚡"
          >
            Bulk Add Nodes
          </Button>
          <Button
            disabled={isGuest}
            onClick={() => setShowImportForm(true)}
            variant="soft"
            color="neutral"
            startDecorator="📥"
          >
            Import OSM Nodes
          </Button>
        </Box>
      )}
      {showForm && (
        <PointOfInterestForm
          resortId={resort.id}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancel}
          editingPoi={editingPoi}
        />
      )}
      {showNodeForm && (
        <POINodeForm
          resortId={resort.id}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => setShowNodeForm(false)}
        />
      )}
      {showImportForm && (
        <POINodeImportForm
          resortId={resort.id}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => setShowImportForm(false)}
        />
      )}
      <List>
        {pois.map((poi) => (
          <ListItem
            key={poi.id}
            endAction={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={() => handleEditClick(poi)}
                  disabled={isGuest}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  color="danger"
                  onClick={() => handleDelete(poi.id)}
                  disabled={isGuest}
                >
                  Delete
                </Button>
              </Box>
            }
          >
            <Typography>{poi.name || `Unnamed ${poi.type}`}</Typography>
            {poi.aliases && poi.aliases.length > 0 && (
              <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                Aliases: {poi.aliases.join(", ")}
              </Typography>
            )}
            <Typography level="body-sm">{`(${
              poi.type
            }) - Lat: ${poi.latitude.toFixed(4)}, Lng: ${poi.longitude.toFixed(
              4
            )}`}</Typography>
          </ListItem>
        ))}
      </List>
    </Sheet>
  );
};

export default PointsOfInterestManager;
