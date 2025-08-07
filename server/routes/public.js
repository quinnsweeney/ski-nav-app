import express from 'express';
import { supabase } from '../supabaseClient.js';
import { findShortestPath } from '../pathfinder.js';

const router = express.Router();

router.get('/resorts', async (req, res) => {
    const { data, error } = await supabase
        .from('ski_areas')
        .select('id, name');

    if (error) {
        console.error("Error fetching ski areas:", error);
        return res.status(500).json({ error: "Failed to fetch ski areas." });
    }
    res.json(data);
});

router.get('/resorts/:id/pois', async (req, res) => {
    const skiAreaId = parseInt(req.params.id, 10);
    if (isNaN(skiAreaId)) {
        return res.status(400).json({ error: 'Invalid ski area ID.' });
    }

    const { data, error } = await supabase.rpc('get_pois_for_ski_area', {
        p_ski_area_id: skiAreaId
    });
    
    if(error) {
        console.error("Error fetching POIs:", error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

router.get('/resorts/:id/lifts', async (req, res) => {
    const skiAreaId = parseInt(req.params.id, 10);
    if (isNaN(skiAreaId)) {
        return res.status(400).json({ error: 'Invalid ski area ID.' });
    }

    const { data, error } = await supabase
        .from('lifts')
        .select('id, name')
        .eq('ski_area_id', skiAreaId);

    if (error) {
        console.error("Error fetching lifts:", error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

router.post('/route', async (req, res) => {
    const {
        ski_area_id,
        start_point_id,
        end_point_id,
        max_difficulty,
        avoid_lifts,
    } = req.body;

    if (!ski_area_id || !start_point_id || !end_point_id || !max_difficulty) {
        return res.status(400).json({ error: 'Missing required pathfinding parameters.' });
    }

    try {
        const { data: graphData, error: graphError } = await supabase.rpc('get_pathfinding_graph', {
            p_ski_area_id: ski_area_id
        });

        if (graphError) throw graphError;

        const filteredEdges = graphData.edges.filter(edge => {
            // Filter by lift avoidance
            if (edge.type === 'lift' && avoid_lifts?.includes(edge.id)) {
                return false;
            }
            // Filter by difficulty
            // This requires a mapping from string ('blue') to a number (e.g., 2)
            // For now, we'll assume a simple string comparison.
            // if (edge.type === 'trail' && edge.difficulty > max_difficulty) {
            //     return false;
            // }

            return true;
        });

        const path = findShortestPath(graphData.nodes, filteredEdges, start_point_id, end_point_id);

        res.json(path);

    } catch (error) {
        console.error("Pathfinding error:", error);
        res.status(500).json({ error: 'An error occurred during pathfinding.' });
    }
})

export default router;