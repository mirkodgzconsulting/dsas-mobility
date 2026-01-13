import fs from 'fs';
import path from 'path';
import https from 'https';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

// 1. Load Environment Variables from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

// 2. Configuration
const CLOUD_NAME = env['PUBLIC_CLOUDINARY_CLOUD_NAME'];
const API_KEY = env['PUBLIC_CLOUDINARY_API_KEY'];
const API_SECRET = env['CLOUDINARY_API_SECRET'];
const SUPABASE_URL = env['PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']; // Must use Service Role for mass inserts/bypassing RLS if needed

if (!CLOUD_NAME || !API_KEY || !API_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing environment variables. Check .env.local");
    process.exit(1);
}

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_FILE = 'veicoli_migrazione.csv';

// 3. Helper Functions
function parseCSV(content) {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        // Handle quoted fields which might contain commas
        const regex = /"([^"]*)"|([^,]+)|,,/g;
        const values = [];
        let match;
        // Simple split won't work for quoted fields, but our CSV generator wrapped complex fields in quotes
        // Let's use a simpler regex split for this specific generated CSV which we know is cleanish
        // Actually, a robust regex for CSV splitting:
        let row = {};
        let valIndex = 0;

        // Quick and dirty CSV parse since we generated it ourselves and know the structure
        // We will assume standard comma separation for now, but handle the specific format from convert_xml.mjs
        // The convert_xml.mjs used: val.replace(/"/g, '""') and wrapped in quotes if needed.

        // Let's rely on a simple split for now as the data looked clean in the review, 
        // but to be safe against splitting inside quotes:
        const rawValues = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentLine.split(',');

        // Re-assembling if the regex missed empty fields or simple split is better
        // Since we wrote the CSV, let's read it carefully. 
        // We will use a more robust manual parser char by char to be safe.
        const parsedValues = [];
        let inQuote = false;
        let currentVal = '';
        for (let char of currentLine) {
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                parsedValues.push(currentVal.replace(/^"|"$/g, '').replace(/""/g, '"'));
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        parsedValues.push(currentVal.replace(/^"|"$/g, '').replace(/""/g, '"'));

        headers.forEach((header, index) => {
            row[header] = parsedValues[index] || '';
        });
        result.push(row);
    }
    return result;
}

async function uploadImageToCloudinary(url, publicId) {
    return new Promise((resolve, reject) => {
        console.log(`  - Uploading ${url}...`);

        // Handle spaces in URL
        const encodedUrl = encodeURI(url);

        cloudinary.uploader.upload(encodedUrl, {
            folder: 'dsas-mobility',
            public_id: publicId,
            overwrite: true,
            resource_type: "auto"
        }, (error, result) => {
            if (error) {
                console.error(`  X Upload Error for ${url}:`, error.message);
                // Return null but don't crash, we might insert without image
                resolve(null);
            } else {
                console.log(`  -> Uploaded: ${result.secure_url}`);
                resolve(result.secure_url);
            }
        });
    });
}

function cleanPrice(price) {
    if (!price) return null;
    return parseFloat(price.replace(',', '.'));
}

// 4. Main Migration Logic
async function migrate() {
    console.log("Starting Migration...");

    // Read CSV
    const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
    const vehicles = parseCSV(csvContent);
    console.log(`Loaded ${vehicles.length} vehicles from CSV.`);

    let successCount = 0;
    let failCount = 0;

    for (const vehicle of vehicles) {
        console.log(`Processing: ${vehicle.Title}...`);

        let imageUrl = vehicle['Image URL'];

        // Upload to Cloudinary if it's a legacy URL
        if (imageUrl && imageUrl.includes('sg-host.com')) {
            const safeName = vehicle['sku'] || vehicle['Title'].replace(/[^a-zA-Z0-9]/g, '_');
            const newUrl = await uploadImageToCloudinary(imageUrl, safeName);
            if (newUrl) {
                imageUrl = newUrl;
            }
        }

        // Map to Supabase Schema
        const dbRecord = {
            titolo: `${vehicle.Brand} ${vehicle.modello} ${vehicle.versione}`,
            marca: vehicle.Brand,
            modello: vehicle.modello,
            versione: vehicle.versione,
            categoria: vehicle.Category,

            slug: vehicle.slug_id || vehicle.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            sku: vehicle.sku,

            immagine_url: imageUrl,

            alimentazione: vehicle.combustibile === 'Ibrida' ? 'Ibrida-Benzina' : vehicle.combustibile, // Naive mapping
            cambio: vehicle.cambio,

            // Long Term
            canone_mensile: cleanPrice(vehicle.canone_mensile),
            anticipo: cleanPrice(vehicle.anticipo),
            durata_mesi: parseInt(vehicle.durata_mesi) || 48,
            km_annui: parseInt(vehicle.km_annui) || 10000,

            // Short Term (Mapped as requested)
            noleggio_breve: vehicle.breve === 'true',
            prezzo_giornaliero: cleanPrice(vehicle.prezzo_giornalero_breve),
            km_giornaliero: parseInt(vehicle.km_giornalero_breve) || null,
            prezzo_settimanale: cleanPrice(vehicle.prezzo_settimanale_breve),
            km_settimanale: parseInt(vehicle.km_settimanale_breve) || null,
            prezzo_mensile_breve: cleanPrice(vehicle.prezzo_mensile_breve),
            km_mensile_breve: parseInt(vehicle.km_mensile_breve) || null,
            cauzione_richiesta: cleanPrice(vehicle.cauzione_breve),
            costo_per_km: cleanPrice(vehicle.costo_chilometro_breve),

            // Metadata
            promo: vehicle.promo === 'true',
            tempo_consegna: vehicle.tempo_consegna === 'garanzia_mobilita' ? 'Garanzia di Mobilità' : vehicle.tempo_consegna
        };

        // Insert into Supabase
        const { data, error } = await supabase
            .from('veicoli')
            .upsert(dbRecord, { onConflict: 'sku' }) // Update if SKU exists
            .select();

        if (error) {
            console.error(`  X DB Insert Error:`, error.message);
            failCount++;
        } else {
            console.log(`  -> Saved to DB (ID: ${data[0].id})`);
            successCount++;
        }
    }

    console.log("------------------------------------------------");
    console.log(`Migration Complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

migrate().catch(console.error);
