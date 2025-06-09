// Script to fix formulary JSON fields
import db from "./src/db/index.js";

async function fixFormularyJsonFields() {
  console.log("Starting to fix formulary JSON fields...");

  try {
    // Test database connection first
    console.log("Testing database connection...");
    await db.raw("SELECT 1");
    console.log("Database connection OK");

    // Check current state
    console.log("Checking current formulary records...");
    const count = await db("formulary").count("* as total").first();
    console.log(`Found ${count.total} formulary records`);

    const sample = await db("formulary")
      .select("id", "name", "frequencyOptions")
      .limit(2);
    console.log("Sample before fix:");
    sample.forEach((record) => {
      console.log(`- ${record.name}: ${record.frequencyOptions}`);
    }); // Fix single-quoted arrays and wrap plain strings in arrays
    console.log("Step 1: Fixing single-quoted JSON...");
    await db.raw(`
      UPDATE public.formulary
      SET "frequencyOptions" = REPLACE(REPLACE("frequencyOptions"::text, '''', '"'), '""', '"')::jsonb
      WHERE "frequencyOptions" IS NOT NULL AND "frequencyOptions"::text LIKE '%''%';

      UPDATE public.formulary
      SET "drugInteractions" = REPLACE(REPLACE("drugInteractions"::text, '''', '"'), '""', '"')::jsonb
      WHERE "drugInteractions" IS NOT NULL AND "drugInteractions"::text LIKE '%''%';

      UPDATE public.formulary
      SET "sideEffects" = REPLACE(REPLACE("sideEffects"::text, '''', '"'), '""', '"')::jsonb
      WHERE "sideEffects" IS NOT NULL AND "sideEffects"::text LIKE '%''%';
    `);
    console.log("Step 2: Wrapping plain strings in arrays...");
    await db.raw(`
      -- Wrap plain strings in arrays if not already an array
      UPDATE public.formulary
      SET "frequencyOptions" = jsonb_build_array("frequencyOptions"::text)
      WHERE "frequencyOptions" IS NOT NULL AND "frequencyOptions"::text NOT LIKE '[%';

      UPDATE public.formulary
      SET "drugInteractions" = jsonb_build_array("drugInteractions"::text)
      WHERE "drugInteractions" IS NOT NULL AND "drugInteractions"::text NOT LIKE '[%';

      UPDATE public.formulary
      SET "sideEffects" = jsonb_build_array("sideEffects"::text)
      WHERE "sideEffects" IS NOT NULL AND "sideEffects"::text NOT LIKE '[%';
    `);
    console.log("Step 3: Converting columns to jsonb...");
    await db.raw(`
      ALTER TABLE public.formulary
        ALTER COLUMN "frequencyOptions" TYPE jsonb USING "frequencyOptions"::jsonb,
        ALTER COLUMN "drugInteractions" TYPE jsonb USING "drugInteractions"::jsonb,
        ALTER COLUMN "sideEffects" TYPE jsonb USING "sideEffects"::jsonb;
    `);

    console.log("✅ Successfully fixed formulary JSON fields!");
    // Verify the fix
    console.log("Verifying fix...");
    const sampleAfter = await db("formulary")
      .select(
        "id",
        "name",
        "frequencyOptions",
        "drugInteractions",
        "sideEffects"
      )
      .limit(3);
    console.log("Sample records after fix:");
    sampleAfter.forEach((record) => {
      console.log(`- ${record.name}:`);
      console.log(
        `  frequencyOptions: ${JSON.stringify(record.frequencyOptions)}`
      );
      console.log(
        `  drugInteractions: ${JSON.stringify(record.drugInteractions)}`
      );
      console.log(`  sideEffects: ${JSON.stringify(record.sideEffects)}`);
    });
  } catch (error) {
    console.error("❌ Error fixing formulary JSON fields:", error);
    throw error;
  } finally {
    await db.destroy();
  }
}

fixFormularyJsonFields()
  .then(() => {
    console.log("Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
