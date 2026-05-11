const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;

    // Update style.css path
    content = content.replace(/href="style\.css"/g, 'href="assets/css/style.css"');
    
    // Update main.js path
    content = content.replace(/src="main\.js"/g, 'src="assets/js/main.js"');

    if (content !== original) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`Updated paths in ${file}`);
    }
});
