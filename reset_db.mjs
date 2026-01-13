import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load Environment Variables
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = env['PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resetDb() {
    console.log("⚠️  DELETING ALL DATA from 'veicoli' table...");

    // Delete all rows where id is not null (effectively all rows)
    const { error, count } = await supabase
        .from('veicoli')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Valid UUID hack to match all

    if (error) {
        console.error("Error deleting data:", error.message);
    } else {
        console.log(`✅ Deleted ${count} records. Table is clean.`);
    }
}

resetDb();
