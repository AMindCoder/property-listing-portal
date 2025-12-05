const fs = require('fs');
const { execSync } = require('child_process');

try {
    const output = execSync('curl "http://localhost:3000/api/properties?status=ALL&t=' + Date.now() + '"', { encoding: 'utf8' });
    const properties = JSON.parse(output);
    const target = properties.find(p => p.title.includes('Test Upload Property') || p.id === 'uploaded-test');

    if (target) {
        console.log('Found Property:', JSON.stringify(target, null, 2));
    } else {
        console.log('Property not found in API response.');
        console.log('Titles found:', properties.map(p => p.title));
    }
} catch (e) {
    console.error('Error fetching/parsing:', e);
}
