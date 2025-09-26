import express from "express";
import supabase from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// ========================
// Get all drivers (no passwords!)
// ========================
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .select(
        "driver_id, first_name, middle_name, last_name, suffix, address, contact_num, license_num, license_expiration, license_restriction"
      )
      .order("driver_id", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Fetch drivers:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Insert new driver
// ========================
router.post("/", async (req, res) => {
  try {
    const { first_name, middle_name, last_name, suffix, password } = req.body;

    if (!password || !password.trim()) {
      return res.status(400).json({ error: "Password is required" });
    }

    const { data: existing, error: checkError } = await supabase
      .from("drivers")
      .select("*")
      .eq("first_name", first_name)
      .eq("last_name", last_name)
      .eq("suffix", suffix || null);

    if (checkError) throw checkError;
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Driver already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const driverData = { ...req.body, password: hashedPassword };
    delete driverData.driver_id;

    const { data, error } = await supabase
      .from("drivers")
      .insert([driverData], { defaultToNull: false })
      .select()
      .single();

    if (error) throw error;
    delete data.password;
    res.status(201).json(data);
  } catch (err) {
    console.error("Insert driver error:", err.message);
    res.status(400).json({ error: err.message || "Failed to insert driver." });
  }
});

// ========================
// Update driver (password locked unless allowPasswordChange = true)
// ========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const { data: current, error: fetchErr } = await supabase
      .from("drivers")
      .select("password")
      .eq("driver_id", id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!current) return res.status(404).json({ error: "Driver not found." });

    const passwordRequested =
      updates.password && updates.password.toString().trim();
    const allowPasswordChange = updates.allowPasswordChange === true;

    if (passwordRequested && current.password && !allowPasswordChange) {
      delete updates.password;
    }

    if (passwordRequested && (!current.password || allowPasswordChange)) {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }

    delete updates.allowPasswordChange;

    const { data, error } = await supabase
      .from("drivers")
      .update(updates)
      .eq("driver_id", id)
      .select()
      .single();

    if (error) throw error;
    delete data.password;
    res.json(data);
  } catch (err) {
    console.error("Update driver error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
