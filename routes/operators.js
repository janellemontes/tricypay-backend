import express from "express";
import supabase from "../db.js";

const router = express.Router();

// Get all operators
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("operators")
      .select("*")
      .order("operator_id", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Insert new operator
router.post("/", async (req, res) => {
  try {
    const operatorData = { ...req.body };
    delete operatorData.operator_id;

    const { data, error } = await supabase
      .from("operators")
      .insert([operatorData], { defaultToNull: false })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "Operator already exists, try a new one." });
      }
      throw error; 
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("Insert operator error:", err.message);
    res.status(400).json({ error: "Operator already exists, try a new one." });
  }
});

// Update operator
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("operators")
      .update(updates)
      .eq("operator_id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete operator
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("operators")
      .delete()
      .eq("operator_id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
