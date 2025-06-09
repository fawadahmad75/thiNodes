// Migration: 20250605_01_fix-formulary-json-fields.js

/**
 * This migration fixes any existing records in the formulary table where
 * frequencyOptions, drugInteractions, or sideEffects are stored as single-quoted
 * or invalid JSON, and ensures all are valid JSON arrays with double quotes.
 * It also converts the columns to jsonb for future safety.
 */

exports.up = async function (knex) {
  // Fix single-quoted arrays and wrap plain strings in arrays
  await knex.raw(`
    UPDATE public.formulary
    SET frequencyOptions = REPLACE(REPLACE(frequencyOptions::text, '''', '"'), '""', '"')::jsonb
    WHERE frequencyOptions IS NOT NULL AND frequencyOptions::text LIKE '%''%';

    UPDATE public.formulary
    SET drugInteractions = REPLACE(REPLACE(drugInteractions::text, '''', '"'), '""', '"')::jsonb
    WHERE drugInteractions IS NOT NULL AND drugInteractions::text LIKE '%''%';

    UPDATE public.formulary
    SET sideEffects = REPLACE(REPLACE(sideEffects::text, '''', '"'), '""', '"')::jsonb
    WHERE sideEffects IS NOT NULL AND sideEffects::text LIKE '%''%';

    -- Wrap plain strings in arrays if not already an array
    UPDATE public.formulary
    SET frequencyOptions = jsonb_build_array(frequencyOptions::text)
    WHERE frequencyOptions IS NOT NULL AND frequencyOptions::text NOT LIKE '[%';

    UPDATE public.formulary
    SET drugInteractions = jsonb_build_array(drugInteractions::text)
    WHERE drugInteractions IS NOT NULL AND drugInteractions::text NOT LIKE '[%';

    UPDATE public.formulary
    SET sideEffects = jsonb_build_array(sideEffects::text)
    WHERE sideEffects IS NOT NULL AND sideEffects::text NOT LIKE '[%';
  `);

  // Convert columns to jsonb
  await knex.raw(`
    ALTER TABLE public.formulary
      ALTER COLUMN frequencyOptions TYPE jsonb USING frequencyOptions::jsonb,
      ALTER COLUMN drugInteractions TYPE jsonb USING drugInteractions::jsonb,
      ALTER COLUMN sideEffects TYPE jsonb USING sideEffects::jsonb;
  `);
};

exports.down = async function (knex) {
  // Optionally, convert columns back to json (not recommended)
  await knex.raw(`
    ALTER TABLE public.formulary
      ALTER COLUMN frequencyOptions TYPE json USING frequencyOptions::json,
      ALTER COLUMN drugInteractions TYPE json USING drugInteractions::json,
      ALTER COLUMN sideEffects TYPE json USING sideEffects::json;
  `);
};
