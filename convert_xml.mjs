import fs from 'fs';
import path from 'path';

const vehiclesFile = 'vehicoli_sistema_antiguo.xml';
const mediaFile = 'media_dsas_antiguo.xml';
const outputFile = 'veicoli_migrazione.csv';

function extractItems(xmlContent) {
    const items = xmlContent.split('<item>');
    items.shift();
    if (items.length > 0 && !items[items.length - 1].includes('</item>')) {
        items.pop();
    }
    return items;
}

try {
    console.log("Reading Media File...");
    const mediaContent = fs.readFileSync(mediaFile, 'utf-8');
    const mediaItems = extractItems(mediaContent);

    // Pass 1: Build Image Map from Media File
    const imageMap = {};
    let attachmentCount = 0;

    console.log(`Found ${mediaItems.length} items in media file. Building map...`);

    for (const item of mediaItems) {
        const itemContent = item.split('</item>')[0];

        const postTypeMatch = itemContent.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/);
        const postType = postTypeMatch ? postTypeMatch[1] : '';

        if (postType === 'attachment') {
            const postIdMatch = itemContent.match(/<wp:post_id>(\d+)<\/wp:post_id>/);
            const attachmentUrlMatch = itemContent.match(/<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/);

            if (postIdMatch && attachmentUrlMatch) {
                imageMap[postIdMatch[1]] = attachmentUrlMatch[1];
                attachmentCount++;
            }
        }
    }
    console.log(`Mapped ${attachmentCount} images.`);
    if (Object.keys(imageMap).length > 0) {
        console.log(`Sample Image Map entry: ${Object.keys(imageMap)[0]} -> ${Object.values(imageMap)[0]}`);
    }

    console.log("Reading Vehicles File...");
    const vehiclesContent = fs.readFileSync(vehiclesFile, 'utf-8');
    const items = extractItems(vehiclesContent);

    const processedItems = [];
    const allHeaders = new Set(['Title', 'Link', 'Brand', 'Category', 'Post Type']);

    console.log(`Found ${items.length} items. Processing...`);

    for (const item of items) {
        const itemContent = item.split('</item>')[0];

        // Basic Fields
        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
        const postTypeMatch = itemContent.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/);

        // Only process long term rentals or relevant post types if needed. 
        // User asked for "vehicle list", so we might want to filter, but let's grab everything that looks like a vehicle.
        const postType = postTypeMatch ? postTypeMatch[1] : '';

        let brand = '';
        let category = '';

        // Extract Categories
        // Format: <category domain="marca" nicename="toyota"><![CDATA[TOYOTA]]></category>
        const brandMatch = itemContent.match(/<category domain="marca".*?><!\[CDATA\[(.*?)\]\]><\/category>/);
        if (brandMatch) brand = brandMatch[1];

        const categoryMatch = itemContent.match(/<category domain="categoria".*?><!\[CDATA\[(.*?)\]\]><\/category>/);
        if (categoryMatch) category = categoryMatch[1];

        // Extract Meta Data
        const metaRegex = /<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/gs;
        let match;
        const meta = {};

        while ((match = metaRegex.exec(itemContent)) !== null) {
            const key = match[1];
            const value = match[2];
            meta[key] = value;
            allHeaders.add(key);
        }

        const postIdMatch = itemContent.match(/<wp:post_id>(\d+)<\/wp:post_id>/);
        const postId = postIdMatch ? postIdMatch[1] : null;

        const attachmentUrlMatch = itemContent.match(/<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/);
        const attachmentUrl = attachmentUrlMatch ? attachmentUrlMatch[1] : null;

        processedItems.push({
            PostId: postId,
            Title: titleMatch ? titleMatch[1] : '',
            Link: linkMatch ? linkMatch[1] : '',
            Brand: brand,
            Category: category,
            'Post Type': postType,
            AttachmentUrl: attachmentUrl,
            ...meta
        });
    }

    // Pass 2: Resolve Images for Vehicles using the map from Media File
    // (Note: processedItems is populated in the loop above which I am not showing here but it exists in the file)

    const vehicleItems = processedItems.filter(i => i['Post Type'] === 'noleggiolungotermine');

    vehicleItems.forEach(item => {
        const thumbId = item['_thumbnail_id'];
        if (thumbId && imageMap[thumbId]) {
            item['Image URL'] = imageMap[thumbId];
            allHeaders.add('Image URL');
        }
    });

    // Filter to only include the "Noleggio Lungo Termine" custom post type as seen in the XML
    // Note: The variable `vehicleItems` was already created and filtered in the previous block I inserted.
    // So we don't need to re-declare it, but we do need to ensure the headers are correct.

    console.log(`Filtered to ${vehicleItems.length} vehicle items.`);

    // Prepare CSV
    const headerArray = Array.from(allHeaders);
    // Move important headers to start for readability
    const priorityHeaders = ['Title', 'Image URL', 'Brand', 'Category', 'modello', 'versione', 'canone_mensile', 'sku'];
    priorityHeaders.reverse().forEach(h => {
        if (headerArray.includes(h)) {
            headerArray.splice(headerArray.indexOf(h), 1);
            headerArray.unshift(h);
        }
    });

    const csvRows = [headerArray.join(',')];

    for (const item of vehicleItems) {
        const row = headerArray.map(header => {
            let val = item[header] || '';
            // Escape quotes
            val = String(val).replace(/"/g, '""');
            // Wrap in quotes if contains comma or quote
            if (val.search(/("|,|\n)/g) >= 0) {
                val = `"${val}"`;
            }
            return val;
        });
        csvRows.push(row.join(','));
    }

    fs.writeFileSync(outputFile, csvRows.join('\n'));
    console.log(`Successfully created ${outputFile}`);

} catch (error) {
    console.error("Error processing XML:", error);
}
