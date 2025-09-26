import express from "express";
import supabase from "../db.js";

const router = express.Router();

// ========================
// Get all franchises
// ========================
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("franchises")
      .select("*")
      .order("franchise_id", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Insert new franchise
// ========================
router.post("/", async (req, res) => {
  try {
    const franchiseData = { ...req.body };

    if (!/^\d{4}$/.test(franchiseData.franchise_id)) {
      return res
        .status(400)
        .json({ error: "Franchise No. must be exactly 4 digits (0001–9999)." });
    }

    // 🔹 Check if franchise already exists
    const { data: existing } = await supabase
      .from("franchises")
      .select("franchise_id")
      .eq("franchise_id", franchiseData.franchise_id)
      .single();

    if (existing) {
      return res
        .status(400)
        .json({ error: "Franchise already exists, try a new one." });
    }

    // 🔹 Insert new record
    const { data, error } = await supabase
      .from("franchises")
      .insert([franchiseData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Insert franchise error:", err.message);
    res
      .status(400)
      .json({ error: err.message || "Failed to insert franchise." });
  }
});


// ========================
// Update franchise
// ========================
router.put("/:franchise_id", async (req, res) => {
  try {
    const { franchise_id } = req.params; 
    const updates = req.body;

    if (updates.franchise_id && !/^\d{4}$/.test(updates.franchise_id)) {
      return res
        .status(400)
        .json({ error: "Franchise No. must be exactly 4 digits (0001–9999)." });
    }

    const { data, error } = await supabase
      .from("franchises")
      .update(updates)
      .eq("franchise_id", franchise_id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ========================
// Delete franchise
// ========================
router.delete("/:franchise_id", async (req, res) => {
  try {
    const { franchise_id } = req.params;

    const { error } = await supabase
      .from("franchises")
      .delete()
      .eq("franchise_id", franchise_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
