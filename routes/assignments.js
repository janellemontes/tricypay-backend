import express from "express";
import supabase from "../db.js";

const router = express.Router();

// ========================
// Get all assignments
// ========================
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .order("assignment_id", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Insert new assignment
// ========================
router.post("/", async (req, res) => {   // ✅ FIXED
  try {
    const assignmentData = { ...req.body };
    delete assignmentData.assignment_id; 

    const { data, error } = await supabase
      .from("assignments")
      .insert([assignmentData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Insert assignment error:", err.message);
    res
      .status(400)
      .json({ error: err.message || "Failed to insert assignment." });
  }
});

// ========================
// Update assignment
// ========================
router.put("/:assignment_id", async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("assignments")
      .update(updates)
      .eq("assignment_id", assignment_id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Delete assignment
// ========================
router.delete("/:assignment_id", async (req, res) => {
  try {
    const { assignment_id } = req.params;

    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("assignment_id", assignment_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
