import express from "express";
import supabase from "../db.js";

const router = express.Router();

// ========================
// Get all TODAs
// ========================
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("toda")
      .select("*")
      .order("accredited_toda", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Fetch TODAs error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Insert new TODA
// ========================
router.post("/", async (req, res) => {
  try {
    const todaData = { ...req.body };

    const { data, error } = await supabase
      .from("toda")
      .insert([todaData], { defaultToNull: false })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "TODA already exists, try a new one." });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("Insert TODA error:", err.message);
    res.status(400).json({ error: "TODA already exists, try a new one." });
  }
});

// ========================
// Update TODA
// ========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params; 
    const updates = req.body;

    const { data, error } = await supabase
      .from("toda")
      .update(updates)
      .eq("accredited_toda", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Delete TODA
// ========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("toda")
      .delete()
      .eq("accredited_toda", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
