import express from "express";
import supabase from "../db.js";

const router = express.Router();

// ========================
// Get all vehicles
// ========================
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("vehicle_plate", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Fetch vehicles error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Insert new vehicle
// ========================
router.post("/", async (req, res) => {
  try {
    const vehicleData = { ...req.body };

    const { data, error } = await supabase
      .from("vehicles")
      .insert([vehicleData])
      .select()
      .single();

    if (error) {
      // Catch duplicate primary key / unique constraint errors
      if (error.code === "23505") {
        return res.status(400).json({ error: "Vehicle already exists, try a new one." });
      }

      throw error; // other errors
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("Insert vehicle error:", err.message);
    res.status(400).json({ error: "Vehicle already exists, try a new one." });
  }
});


// ========================
// Update vehicle
// ========================
router.put("/:plate", async (req, res) => {
  try {
    const { plate } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("vehicles")
      .update(updates)
      .eq("vehicle_plate", plate)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Update vehicle error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Delete vehicle
// ========================
router.delete("/:plate", async (req, res) => {
  try {
    const { plate } = req.params;

    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("vehicle_plate", plate);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("Delete vehicle error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
