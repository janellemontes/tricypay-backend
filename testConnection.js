import supabase from "./db.js";

async function test() {
  const { data, error } = await supabase.from("drivers").select("*");
  
  if (error) {
    console.error("❌ Error:", error.message);
  } else {
    console.log("✅ Drivers:", data);
  }
}

test();
