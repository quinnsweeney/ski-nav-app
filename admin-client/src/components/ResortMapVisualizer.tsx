import { CircularProgress, Sheet } from "@mui/joy";
import type { GraphLink, GraphNode } from "../types";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

interface ResortMapVisualizerProps {
    isLoading: boolean;
    graphData: {
        nodes: GraphNode[],
        links: GraphLink[]
    };
}

const createCircleIcon = (color: string) => {
    return L.divIcon({
        html: `<span style="background-color: ${color}; width: 1rem; height: 1rem; border-radius: 50%; display: block; border: 2px solid white;"></span>`,
        className: 'dummy',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

const ResortMapVisualizer: React.FC<ResortMapVisualizerProps> = ({ isLoading, graphData }) => {
    if (isLoading) {
        return <Sheet sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Sheet>;
    }

    if (!graphData || graphData.nodes.length === 0) {
        return <Sheet sx={{ p: 4 }}>No data to display on the map.</Sheet>;
    }

    // Calculate the center of the map to focus on the resort
    const centerLat = graphData.nodes.reduce((sum, node) => sum + node.lat, 0) / graphData.nodes.length;
    const centerLng = graphData.nodes.reduce((sum, node) => sum + node.lng, 0) / graphData.nodes.length;

    return (
        <Sheet sx={{ height: '70vh', width: '100%', mt: 2, borderRadius: 'sm', overflow: 'hidden' }}>
            <MapContainer center={[centerLat, centerLng]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Render a Marker for each Point of Interest (Node) */}
                {graphData.nodes.map(node => (
                    <Marker 
                        key={`node-${node.id}`} 
                        position={[node.lat, node.lng]}
                        icon={createCircleIcon(node.type === 'lodge' ? '#f1c40f' : '#3498db')}
                    >
                        <Popup>{node.name}</Popup>
                    </Marker>
                ))}

                {/* Render a Polyline for each Lift or Trail Segment (Link) */}
                {graphData.links.map((link, index) => (
                    <Polyline
                        key={`link-${index}`}
                        positions={[
                            [link.start_coords.lat, link.start_coords.lng],
                            [link.end_coords.lat, link.end_coords.lng]
                        ]}
                        color={link.type === 'lift' ? '#3498db' : '#2ecc71'}
                        weight={3}
                    >
                         <Popup>{link.name}</Popup>
                    </Polyline>
                ))}
            </MapContainer>
        </Sheet>
    );
};

export default ResortMapVisualizer;