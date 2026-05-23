const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const pixelBlock = `  <!-- Meta Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    // Comprobar consentimiento antes de iniciar
    var savedConsent = localStorage.getItem('cookieConsent');
    var marketingGranted = false;
    if (savedConsent) {
      try {
        var consentObj = JSON.parse(savedConsent);
        marketingGranted = !!consentObj.marketing;
      } catch (e) {}
    }
    
    if (marketingGranted) {
      fbq('consent', 'grant');
    } else {
      fbq('consent', 'revoke');
    }
    
    fbq('init', '1706566507036901');
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=1706566507036901&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // If the file already has the pixel, skip it
  if (content.includes('1706566507036901')) {
    console.log(`[SKIP] ${file} already has Meta Pixel active.`);
    return;
  }
  
  // Insert the block right after <head> (we place it after the Google Tag consent mode block)
  // Let's search for '<head>' and insert it
  if (content.includes('<head>')) {
    content = content.replace('<head>', `<head>\n${pixelBlock}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[ADDED] Meta Pixel successfully added to ${file}`);
  } else {
    console.log(`[WARNING] Could not find <head> in ${file}`);
  }
});
