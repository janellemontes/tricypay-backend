import bcrypt from "bcrypt";
import supabase from "./db.js"; 

// Get all drivers with plaintext passwords
const { data: drivers, error } = await supabase.from("drivers").select("driver_id, password");
if (error) throw error;

for (const d of drivers) {
  if (d.password && !d.password.startsWith("$2b$")) { // skip already-hashed
    const hashed = await bcrypt.hash(d.password, 10);
    const { error: updateError } = await supabase
      .from("drivers")
      .update({ password: hashed })
      .eq("driver_id", d.driver_id);
    if (updateError) console.error(`Failed to update ${d.driver_id}:`, updateError.message);
    else console.log(`Updated driver ${d.driver_id}`);
  }
}
process.exit(0);
