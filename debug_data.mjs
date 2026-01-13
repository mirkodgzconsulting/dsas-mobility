import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) {
        process.env[key.trim()] = val.trim().replace(/^["']|["']$/g, '');
    }
});

const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
    const { data, error } = await supabase
        .from('veicoli')
        .select('titolo, cambio, alimentazione')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- DATA START ---');
    data.forEach(v => {
        console.log(`Title: "${v.titolo}" | Cambio: "${v.cambio}" | Alimentazione: "${v.alimentazione}"`);
    });
    console.log('--- DATA END ---');
}

checkData();
