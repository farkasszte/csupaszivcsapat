const fs = require('fs');
const path = require('path');
const https = require('https');

// Bounding box for the region
const minLat = 46.0;
const maxLat = 46.9;
const minLng = 19.1;
const maxLng = 20.1;

const zoomLevels = [9, 10, 11];
const outputDir = path.join(__dirname, '..', 'public', 'map-tiles');

function sec(x) {
  return 1 / Math.cos(x);
}

function latlngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + sec(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

async function downloadTile(z, x, y) {
  const url = `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
  const dir = path.join(outputDir, String(z), String(x));
  const filePath = path.join(dir, `${y}.png`);

  if (fs.existsSync(filePath)) {
    return; // Skip if already downloaded
  }

  fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const options = {
      headers: {
        'User-Agent': 'CsupaszivKalandok/1.0 (https://csupaszivkalandok.hu/)',
        'Referer': 'https://csupaszivkalandok.hu/'
      }
    };

    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get tile: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete temp file
      reject(err);
    });
  });
}

async function main() {
  console.log('Starting tile download...');
  let total = 0;
  const tasks = [];

  for (const z of zoomLevels) {
    const startTile = latlngToTile(maxLat, minLng, z);
    const endTile = latlngToTile(minLat, maxLng, z);

    const minX = Math.min(startTile.x, endTile.x);
    const maxX = Math.max(startTile.x, endTile.x);
    const minY = Math.min(startTile.y, endTile.y);
    const maxY = Math.max(startTile.y, endTile.y);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tasks.push({ z, x, y });
      }
    }
  }

  console.log(`Total tiles to download: ${tasks.length}`);

  // Download with simple concurrency limit
  const limit = 5;
  for (let i = 0; i < tasks.length; i += limit) {
    const chunk = tasks.slice(i, i + limit);
    await Promise.all(
      chunk.map(async (t) => {
        try {
          await downloadTile(t.z, t.x, t.y);
          total++;
          if (total % 10 === 0 || total === tasks.length) {
            console.log(`Downloaded ${total}/${tasks.length} tiles...`);
          }
        } catch (err) {
          console.error(`Error downloading tile ${t.z}/${t.x}/${t.y}:`, err.message);
        }
      })
    );
    // Tiny delay to be nice to OSM servers
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log('All tiles downloaded successfully!');
}

main().catch(console.error);
