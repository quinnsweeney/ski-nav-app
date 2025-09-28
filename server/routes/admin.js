import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Ski Areas Endpoints
router.get("/ski-areas", async (req, res) => {
  const { data, error } = await supabase.from("ski_areas").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/ski-areas", async (req, res) => {
  const { name, location } = req.body;
  const { data, error } = await supabase
    .from("ski_areas")
    .insert([{ name, location }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

router.put("/ski-areas/:id", async (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  const { data, error } = await supabase
    .from("ski_areas")
    .update({ name, location })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete("/ski-areas/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("ski_areas").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Points of Interest Endpoints
router.get("/points-of-interest", async (req, res) => {
  const skiAreaIdString = req.query.ski_area_id;

  if (!skiAreaIdString) {
    return res
      .status(400)
      .json({ error: "A 'ski_area_id' query parameter is required." });
  }

  const ski_area_id = parseInt(skiAreaIdString, 10);

  if (isNaN(ski_area_id)) {
    return res
      .status(400)
      .json({ error: "The 'ski_area_id' must be a valid number." });
  }

  const { data, error } = await supabase.rpc("get_pois_for_ski_area", {
    p_ski_area_id: ski_area_id,
  });

  if (error) {
    console.error("Supabase RPC Error:", error);
    return res.status(500).json({ error: error.message });
  }

  data.filter((poi) => {
    // only return pois that are not of type 'node'
    return poi.type !== "node";
  });

  res.json(data);
});

router.post("/points-of-interest-by-names", async (req, res) => {
  const namesParam = req.body.names;
  if (!namesParam) {
    return res
      .status(400)
      .json({ error: "A 'names' query parameter is required." });
  }

  const names = Array.isArray(namesParam) ? namesParam : namesParam.split(",");

  const { data, error } = await supabase
    .from("points_of_interest")
    .select("name, latitude, longitude, aliases, type, ski_area_id, id")
    .in("name", names);

  if (error) {
    console.error("Supabase Query Error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.post("/points-of-interest", async (req, res) => {
  const { ski_area_id, name, type, latitude, longitude, aliases, osm_id } =
    req.body;
  const { data, error } = await supabase.rpc("create_point_of_interest", {
    p_ski_area_id: ski_area_id,
    p_name: name,
    p_type: type,
    p_latitude: latitude,
    p_longitude: longitude,
    p_aliases: aliases || null,
    p_osm_id: osm_id || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

router.put("/points-of-interest/:id", async (req, res) => {
  const poiId = parseInt(req.params.id, 10);
  if (isNaN(poiId)) {
    return res.status(400).json({ error: "Invalid POI ID." });
  }

  const { name, type, latitude, longitude, aliases } = req.body;
  console.log(latitude, longitude);

  const p_latitude = parseFloat(latitude);
  const p_longitude = parseFloat(longitude);
  if (isNaN(p_latitude) || isNaN(p_longitude)) {
    return res.status(400).json({ error: "Invalid latitude or longitude." });
  }

  const { data, error } = await supabase.rpc("update_point_of_interest", {
    p_poi_id: poiId,
    p_name: name,
    p_type: type,
    p_latitude: p_latitude,
    p_longitude: p_longitude,
    p_aliases: aliases || null,
  });

  if (error) {
    console.error("Supabase Update RPC Error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data[0]);
});

router.delete("/points-of-interest/:id", async (req, res) => {
  const poiId = parseInt(req.params.id, 10);
  if (isNaN(poiId)) {
    return res.status(400).json({ error: "Invalid POI ID." });
  }

  const { error } = await supabase
    .from("points_of_interest")
    .delete()
    .eq("id", poiId);

  if (error) {
    console.error("Supabase Delete Error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

// Lifts Endpoints
router.get("/lifts", async (req, res) => {
  const { ski_area_id } = req.query;
  const { data, error } = await supabase
    .from("lifts")
    .select("*")
    .eq("ski_area_id", ski_area_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/lifts", async (req, res) => {
  const {
    ski_area_id,
    name,
    start_point_id,
    end_point_id,
    lift_type,
    estimated_time_minutes,
  } = req.body;
  const { data, error } = await supabase
    .from("lifts")
    .insert([
      {
        ski_area_id,
        name,
        start_point_id,
        end_point_id,
        lift_type,
        estimated_time_minutes,
      },
    ])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

router.put("/lifts/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    start_point_id,
    end_point_id,
    lift_type,
    estimated_time_minutes,
  } = req.body;
  const { data, error } = await supabase
    .from("lifts")
    .update({
      name,
      start_point_id,
      end_point_id,
      lift_type,
      estimated_time_minutes,
    })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete("/lifts/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("lifts").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Trails Endpoints
router.get("/trails", async (req, res) => {
  const { ski_area_id } = req.query;
  const { data, error } = await supabase
    .from("trails")
    .select("*")
    .eq("ski_area_id", ski_area_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/trails", async (req, res) => {
  const {
    ski_area_id,
    name,
    difficulty,
    is_groomer,
    has_moguls,
    is_trees,
    is_steep,
    is_official_run,
  } = req.body;
  const { data, error } = await supabase
    .from("trails")
    .insert([
      {
        ski_area_id,
        name,
        difficulty,
        is_groomer,
        has_moguls,
        is_trees,
        is_steep,
        is_official_run,
      },
    ])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

router.put("/trails/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    difficulty,
    is_groomer,
    has_moguls,
    is_trees,
    is_steep,
    is_official_run,
  } = req.body;
  const { data, error } = await supabase
    .from("trails")
    .update({
      name,
      difficulty,
      is_groomer,
      has_moguls,
      is_trees,
      is_steep,
      is_official_run,
    })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete("/trails/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("trails").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Trail Segments Endpoints
router.get("/trail-segments", async (req, res) => {
  // Get the ski_area_id from the query parameters.
  const skiAreaIdString = req.query.ski_area_id;

  // Validate that the ski_area_id was provided.
  if (!skiAreaIdString) {
    return res
      .status(400)
      .json({ error: "A 'ski_area_id' query parameter is required." });
  }

  // Convert the ID to an integer, as expected by the database function.
  const ski_area_id = parseInt(skiAreaIdString, 10);

  // Check if the conversion was successful.
  if (isNaN(ski_area_id)) {
    return res
      .status(400)
      .json({ error: "The 'ski_area_id' must be a valid number." });
  }

  // Call the 'get_segments_for_ski_area' function via RPC.
  const { data, error } = await supabase.rpc("get_segments_for_ski_area", {
    p_ski_area_id: ski_area_id,
  });

  if (error) {
    console.error("Supabase RPC Error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.post("/trail-segments", async (req, res) => {
  const {
    trail_id,
    start_point_id,
    end_point_id,
    estimated_time_minutes,
    requires_hike,
  } = req.body;

  const { data, error } = await supabase
    .from("trail_segments")
    .insert([
      {
        trail_id,
        start_point_id,
        end_point_id,
        estimated_time_minutes,
        requires_hike,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put("/trail-segments/:id", async (req, res) => {
  const { id } = req.params;
  const {
    trail_id,
    start_point_id,
    end_point_id,
    estimated_time_minutes,
    requires_hike,
  } = req.body;

  const { data, error } = await supabase
    .from("trail_segments")
    .update({
      trail_id,
      start_point_id,
      end_point_id,
      estimated_time_minutes,
      requires_hike,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete("/trail-segments/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("trail_segments").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
