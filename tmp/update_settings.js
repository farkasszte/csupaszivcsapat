const fs = require('fs');
const path = require('path');

const inputPath = 'e:/outputs/Antigravity/csupaszivcsapat/next-player/public/csupasziv1-2026-03-30-050118.json';
const outputPath = 'e:/outputs/Antigravity/csupaszivcsapat/next-player/src/data/project_settings.json';

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Add the story selector element
const selectorId = 'story-selector-root';
data.elements[selectorId] = {
    "theme": "default",
    "components": [],
    "outputs": [
        "conn-story-1",
        "conn-story-2",
        "conn-story-3"
    ],
    "content": "<p>Üdvözöllek a Csupaszív csapat kalandjaiban! Válassz egy történetet, amivel elkezdenéd a játékot:</p>",
    "title": "<p>Történetválasztó</p>"
};

// Add connections
data.connections["conn-story-1"] = {
    "type": "Straight",
    "sourceid": selectorId,
    "targetid": "e3d27f29-240f-42ff-84a5-77e3e0727d38",
    "label": "<p>1. történet</p>",
    "sourceType": "elements",
    "targetType": "elements"
};
data.connections["conn-story-2"] = {
    "type": "Straight",
    "sourceid": selectorId,
    "targetid": "adaf71ec-7843-4716-b364-c2fd3e5c549f",
    "label": "<p>2. történet</p>",
    "sourceType": "elements",
    "targetType": "elements"
};
data.connections["conn-story-3"] = {
    "type": "Straight",
    "sourceid": selectorId,
    "targetid": "93efb3df-92eb-4fba-975e-1650cba329d0",
    "label": "<p>3. történet</p>",
    "sourceType": "elements",
    "targetType": "elements"
};

// Update starting element
data.startingElement = selectorId;

fs.writeFileSync(outputPath, JSON.stringify(data, null, 4), 'utf8');
console.log('Project settings updated successfully.');
