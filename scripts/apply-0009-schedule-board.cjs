const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config({ path: ".env" });
} catch {
  /* optional */
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function main() {
  const client = await pool.connect();
  try {
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'doctors' ORDER BY ordinal_position
    `);
    console.log(
      "doctors columns:",
      cols.rows.map((r) => r.column_name).join(", "),
    );

    const hasOld = cols.rows.some(
      (r) => r.column_name === "available_from_week_day",
    );
    const hasDuration = (
      await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'appointments' AND column_name = 'duration_in_minutes'
    `)
    ).rows.length;

    const hasWindows = (
      await client.query(`
      SELECT to_regclass('public.doctor_availability_windows') as t
    `)
    ).rows[0].t;

    console.log({ hasOld, hasDuration: !!hasDuration, hasWindows });

    if (hasWindows && !hasOld && hasDuration) {
      console.log("Migration already applied");
      return;
    }

    const sqlPath = path.join(
      __dirname,
      "..",
      "drizzle",
      "0009_schedule_board.sql",
    );
    let sql = fs.readFileSync(sqlPath, "utf8");
    // Split on drizzle breakpoints
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    await client.query("BEGIN");
    for (const statement of statements) {
      // Skip steps already applied
      if (
        statement.includes('ADD COLUMN "duration_in_minutes"') &&
        hasDuration
      ) {
        console.log("skip duration");
        continue;
      }
      if (
        statement.includes("default_appointment_duration_in_minutes") &&
        cols.rows.some(
          (r) =>
            r.column_name === "default_appointment_duration_in_minutes",
        )
      ) {
        console.log("skip default duration");
        continue;
      }
      if (
        statement.includes('CREATE TABLE "doctor_availability_windows"') &&
        hasWindows
      ) {
        console.log("skip create windows");
        continue;
      }
      if (
        statement.includes("doctor_availability_windows_doctor_id") &&
        hasWindows
      ) {
        // FK may already exist
        try {
          await client.query(statement);
        } catch (e) {
          if (e.code === "42710" || e.code === "42P07") {
            console.log("skip fk", e.message);
            continue;
          }
          throw e;
        }
        continue;
      }
      if (statement.includes("DROP COLUMN") && !hasOld) {
        console.log("skip drop", statement.slice(0, 60));
        continue;
      }
      if (statement.includes("INSERT INTO") && hasWindows && !hasOld) {
        console.log("skip backfill");
        continue;
      }
      console.log("exec:", statement.slice(0, 80).replace(/\n/g, " "));
      await client.query(statement);
    }
    await client.query("COMMIT");
    console.log("Migration applied OK");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
