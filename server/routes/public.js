import express from "express";
import { supabase } from "../supabaseClient.js";
import { findShortestPath } from "../pathfinder.js";

const router = express.Router();

router.get("/resorts", async (req, res) => {
  const { data, error } = await supabase
    .from("ski_areas")
    .select("id, name, location");

  if (error) {
    console.error("Error fetching ski areas:", error);
    return res.status(500).json({ error: "Failed to fetch ski areas." });
  }
  res.json(data);
});

router.get("/resorts/:id/pois", async (req, res) => {
  const skiAreaId = parseInt(req.params.id, 10);
  if (isNaN(skiAreaId)) {
    return res.status(400).json({ error: "Invalid ski area ID." });
  }

  // const { data, error } = await supabase.rpc("get_pois_for_ski_area", {
  //   p_ski_area_id: skiAreaId,
  // });
  const { data, error } = await supabase.rpc("get_pois_for_ski_area", {
    p_ski_area_id: skiAreaId,
  });
  // .from("points_of_interest")
  // .select("*")
  // .eq("ski_area_id", skiAreaId)
  // .neq("type", "node");

  if (error) {
    console.error("Error fetching POIs:", error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.get("/resorts/:id/trails", async (req, res) => {
  const skiAreaId = parseInt(req.params.id, 10);
  if (isNaN(skiAreaId)) {
    return res.status(400).json({ error: "Invalid ski area ID." });
  }

  const { data, error } = await supabase
    .from("trails")
    .select("*")
    .eq("ski_area_id", skiAreaId);

  if (error) {
    console.error("Error fetching trails:", error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.get("/resorts/:id/trail-segments", async (req, res) => {
  const skiAreaId = parseInt(req.params.id, 10);
  if (isNaN(skiAreaId)) {
    return res.status(400).json({ error: "Invalid ski area ID." });
  }

  const { data, error } = await supabase.rpc("get_segments_for_ski_area", {
    p_ski_area_id: skiAreaId,
  });

  if (error) {
    console.error("Error fetching trail segments:", error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.get("/resorts/:id/lifts", async (req, res) => {
  const skiAreaId = parseInt(req.params.id, 10);
  if (isNaN(skiAreaId)) {
    return res.status(400).json({ error: "Invalid ski area ID." });
  }

  const { data, error } = await supabase
    .from("lifts")
    .select("*")
    .eq("ski_area_id", skiAreaId);

  if (error) {
    console.error("Error fetching lifts:", error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.post("/route", async (req, res) => {
  const {
    ski_area_id,
    start_point_id,
    end_point_id,
    max_difficulty,
    avoid_lifts,
  } = req.body;

  if (!ski_area_id || !start_point_id || !end_point_id || !max_difficulty) {
    return res
      .status(400)
      .json({ error: "Missing required pathfinding parameters." });
  }

  try {
    const { data: graphData, error: graphError } = await supabase.rpc(
      "get_pathfinding_graph",
      {
        p_ski_area_id: ski_area_id,
      }
    );

    if (graphError) throw graphError;
    console.log(max_difficulty);

    const filteredEdges = graphData.edges.filter((edge) => {
      // Filter by lift avoidance
      if (edge.type === "lift" && avoid_lifts?.includes(edge.id)) {
        return false;
      }

      const difficultyLevels = {
        green: 1,
        blue: 2,
        "blue-black": 2.5,
        black: 3,
        double_black: 4,
      };

      const edgeDifficultyValue = difficultyLevels[edge.difficulty] || 0;
      // console.log("Edge difficulty:", edge.difficulty, edgeDifficultyValue);
      if (
        edge.type === "trail" &&
        edgeDifficultyValue > difficultyLevels[max_difficulty]
      ) {
        return false;
      }

      return true;
    });

    const path = findShortestPath(
      graphData.nodes,
      filteredEdges,
      start_point_id,
      end_point_id
    );

    res.json(path || []);
  } catch (error) {
    console.error("Pathfinding error:", error);
    res.status(500).json({ error: "An error occurred during pathfinding." });
  }
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://skifinder.quinnsweeney.dev/email-confirmed",
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return res.status(400).json(error);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Unexpected signup error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Unexpected login error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required." });
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      console.error("Error refreshing session:", error);
      return res.status(401).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Unexpected refresh error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

router.get("/verify-token", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing from header." });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    console.log("Verified user:", data.user);
    res.json({ user: data.user });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

export default router;
