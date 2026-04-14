
// src/utils/idGenerator.js
const supabase = require("../config/db");

/**
 * Generates sequential IDs like BILL-0001, PAT-0042
 *
 * Requires a `counters` table + atomic RPC function in Supabase.
 * Run this SQL once in your Supabase SQL editor:
 *
 * ─────────────────────────────────────────────────
 * CREATE TABLE IF NOT EXISTS counters (
 *   prefix TEXT PRIMARY KEY,
 *   seq    INTEGER NOT NULL DEFAULT 0
 * );
 *
 * CREATE OR REPLACE FUNCTION increment_counter(p_prefix TEXT)
 * RETURNS INTEGER AS $$
 * DECLARE
 *   new_seq INTEGER;
 * BEGIN
 *   INSERT INTO counters (prefix, seq) VALUES (p_prefix, 1)
 *   ON CONFLICT (prefix) DO UPDATE SET seq = counters.seq + 1
 *   RETURNING seq INTO new_seq;
 *   RETURN new_seq;
 * END;
 * $$ LANGUAGE plpgsql;
 * ─────────────────────────────────────────────────
 */
const generateBillId = async (prefix) => {
    const { data, error } = await supabase.rpc("increment_counter", {
        p_prefix: prefix,
    });

    if (error) {
        throw new Error(`ID generation failed for prefix "${prefix}": ${error.message}`);
    }

    const padded = String(data).padStart(4, "0");
    return `${prefix}-${padded}`;
};

module.exports = { generateBillId };