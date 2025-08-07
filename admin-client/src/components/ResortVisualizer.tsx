import type { GraphLink, GraphNode } from "../types";
import { CircularProgress, Sheet } from "@mui/joy";
import ForceGraph2D from "react-force-graph-2d";

interface ResortVisualizerProps {
    isLoading: boolean;
    graphData: {
        nodes: GraphNode[];
        links: GraphLink[];
    }
};

export default function ResortVisualizer({ isLoading, graphData }: ResortVisualizerProps) {

    if (isLoading) {
        return <Sheet sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Sheet>;
    }

    return (
        <Sheet sx={{ height: '70vh', width: '100%', mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 'sm', overflow: 'hidden' }}>
            <ForceGraph2D
                graphData={graphData}
                nodeLabel="name"
                linkLabel="name"
                nodeColor="color"
                linkColor={() => '#555'}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkCurvature={0.1}
            />
        </Sheet>
    );
}