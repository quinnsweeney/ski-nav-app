import { useState } from "react";
import { difficultyConfig, type Resort, type Trail } from "../../types";
import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import TrailForm from "./TrailForm";
import adminAPI from "../../api";

interface TrailManagerProps {
  resort: Resort;
  trails: Trail[];
  onDataChange: () => void;
}

export default function TrailManager({
  resort,
  trails,
  onDataChange,
}: TrailManagerProps) {
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const isGuest = localStorage.getItem("admin_token") === "guest_token";

  const handleSave = () => {
    onDataChange();
    setEditingTrail(null);
    setShowForm(false);
  };

  const handleDelete = (trailId: number) => {
    if (window.confirm("Are you sure you want to delete this trail?")) {
      adminAPI
        .delete(`/trails/${trailId}`)
        .then(() => {
          onDataChange();
        })
        .catch((err) => {
          console.error("Failed to delete trail", err);
        });
    }
  };

  const handleEditClick = (trail: Trail) => {
    setEditingTrail(trail);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingTrail(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingTrail(null);
    setShowForm(false);
  };

  return (
    <Sheet>
      {!showForm && (
        <Button onClick={handleAddClick} sx={{ mb: 2 }} disabled={isGuest}>
          Add New Trail
        </Button>
      )}
      {showForm && (
        <TrailForm
          resortId={resort.id}
          onSave={handleSave}
          onCancel={handleCancel}
          editingTrail={editingTrail}
        />
      )}
      <List>
        {trails.map((trail) => (
          <ListItem
            key={trail.id}
            endAction={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={() => handleEditClick(trail)}
                  disabled={isGuest}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  color="danger"
                  onClick={() => handleDelete(trail.id)}
                  disabled={isGuest}
                >
                  Delete
                </Button>
              </Box>
            }
          >
            <div>
              <Typography>{trail.name}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                {trail.difficulty && (
                  <Chip
                    size="sm"
                    color={difficultyConfig[trail.difficulty].color}
                    variant="solid"
                  >
                    {difficultyConfig[trail.difficulty].label}
                  </Chip>
                )}

                {trail.is_groomer && (
                  <Chip size="sm" color="primary" variant="soft">
                    Groomer
                  </Chip>
                )}
                {trail.has_moguls && (
                  <Chip size="sm" color="warning" variant="soft">
                    Moguls
                  </Chip>
                )}
                {trail.is_trees && (
                  <Chip size="sm" color="success" variant="soft">
                    Trees
                  </Chip>
                )}
                {trail.is_steep && (
                  <Chip size="sm" color="danger" variant="soft">
                    Steep
                  </Chip>
                )}
              </Stack>
            </div>
          </ListItem>
        ))}
      </List>
    </Sheet>
  );
}
