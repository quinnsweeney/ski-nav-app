import { useEffect, useState } from "react";
import type { PointOfInterest, Resort, Trail, TrailSegment } from "../../types";
import { Box, Button, List, ListItem, ListItemButton, Sheet, Typography } from "@mui/joy";
import TrailSegmentForm from "./TrailSegmentForm";
import adminAPI from "../../api";

interface TrailSegmentManagerProps {
    resort: Resort;
    pois: PointOfInterest[];
    trails: Trail[];
    segments: TrailSegment[];
    onDataChange: () => void;
}

export default function TrailSegmentManager({ resort, pois, trails, segments: initialSegments, onDataChange }: TrailSegmentManagerProps) {
    const [segments, setSegments] = useState(initialSegments);
    const [editingSegment, setEditingSegment] = useState<TrailSegment | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [expandedTrails, setExpandedTrails] = useState<Set<number>>(new Set());

    useEffect(() => {
        setSegments(initialSegments);
    }, [initialSegments]);
    
    const getNameById = (list: {id: number, name: string | null}[], id: number | null) => {
        if (id === null) return "N/A";
        const item = list.find(i => i.id === id);
        return item?.name || `ID: ${id}`;
    };

    const handleSave = (savedSegment: TrailSegment) => {
        if(editingSegment) {
            setSegments(current => current.map(s => s.id === savedSegment.id ? savedSegment : s));
        } else {
            setSegments(current => [...current, savedSegment]);
        }

        if(editingSegment){
            setShowForm(false);
            setEditingSegment(null);
        }
        // onDataChange();
        // setEditingSegment(null);
        // setShowForm(false);
    };

    const handleDelete = (segmentId: number) => {
        if (window.confirm("Are you sure you want to delete this segment?")) {
            adminAPI.delete(`/trail-segments/${segmentId}`)
                .then(() => {
                    onDataChange();
                })
                .catch(err => {
                    console.error("Failed to delete segment", err);
                    alert("Could not delete the segment.");
                });
        }
    };

    const handleEditClick = (segment: TrailSegment) => {
        setEditingSegment(segment);
        setShowForm(true);
    };

    const handleAddClick = () => {
        setEditingSegment(null);
        setShowForm(true);
    };
    
    const handleCancel = () => {
        setEditingSegment(null);
        setShowForm(false);
        onDataChange();
    };

    const toggleTrailExpansion = (trailId: number) => {
        setExpandedTrails(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trailId)) {
                newSet.delete(trailId);
            } else {
                newSet.add(trailId);
            }
            return newSet;
        });
    };

    const connectorSegments = segments.filter(s => s.trail_id === null);

    return (
        <Sheet>
            {!showForm && <Button onClick={handleAddClick} sx={{ mb: 2 }}>Add New Trail Segment</Button>}
            {showForm && (
                <TrailSegmentForm
                    resortId={resort.id}
                    pois={pois}
                    trails={trails}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    editingSegment={editingSegment}
                />
            )}

            <List sx={{ '--ListItem-paddingY': '0.75rem', '--ListItem-paddingX': '1rem' }}>
                {connectorSegments.length > 0 && (
                    <ListItem nested>
                        <Typography level="body-lg" sx={{ mb: 1, fontWeight: 'bold' }}>Connector Segments</Typography>
                        <List>
                            {connectorSegments.map(segment => (
                                <ListItem key={segment.id} endAction={
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="sm" variant="soft" color="neutral" onClick={() => handleEditClick(segment)}>Edit</Button>
                                        <Button size="sm" variant="soft" color="danger" onClick={() => handleDelete(segment.id)}>Delete</Button>
                                    </Box>
                                }>
                                    <Typography level="body-sm">
                                        From: {getNameById(pois, segment.start_point_id)} &rarr; To: {getNameById(pois, segment.end_point_id)}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </ListItem>
                )}

                {trails.map(trail => {
                    const trailSegments = segments.filter(s => s.trail_id === trail.id);
                    const isExpanded = expandedTrails.has(trail.id);
                    return (
                        <ListItem key={trail.id} nested>
                            <ListItemButton onClick={() => toggleTrailExpansion(trail.id)}>
                                <Typography level="body-lg">{trail.name} ({trailSegments.length} segments)</Typography>
                            </ListItemButton>
                            {isExpanded && (
                                <List sx={{ pl: 2 }}>
                                    {trailSegments.map(segment => (
                                        <ListItem key={segment.id} endAction={
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button size="sm" variant="soft" color="neutral" onClick={() => handleEditClick(segment)}>Edit</Button>
                                                <Button size="sm" variant="soft" color="danger" onClick={() => handleDelete(segment.id)}>Delete</Button>
                                            </Box>
                                        }>
                                            <Typography level="body-sm">
                                                From: {getNameById(pois, segment.start_point_id)} &rarr; To: {getNameById(pois, segment.end_point_id)}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </ListItem>
                    );
                })}
            </List>
        </Sheet>
    );
}