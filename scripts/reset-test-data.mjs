import "dotenv/config";
import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  TRUNCATE TABLE
    "leads",
    "session_replays",
    "heatmap_events",
    "mouse_events",
    "error_events",
    "performance_metrics",
    "form_events",
    "cta_events",
    "scroll_events",
    "events",
    "page_views",
    "sessions",
    "visitors",
    "meta_insights",
    "ads",
    "ad_sets",
    "campaigns",
    "meta_ad_accounts"
  RESTART IDENTITY CASCADE
`);

console.log("Cleared all test/demo data. Schema and admin credentials are untouched.");
await client.end();
