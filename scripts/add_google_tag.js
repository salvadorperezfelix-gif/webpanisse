const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const consentAndTagBlock = `  <!-- Google Consent Mode v2 Default State -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    
    // Comprobar si ya existe consentimiento guardado
    var savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      try {
        var consentObj = JSON.parse(savedConsent);
        gtag('consent', 'default', {
          'ad_storage': consentObj.marketing ? 'granted' : 'denied',
          'ad_user_data': consentObj.marketing ? 'granted' : 'denied',
          'ad_personalization': consentObj.marketing ? 'granted' : 'denied',
          'analytics_storage': consentObj.analytics ? 'granted' : 'denied'
        });
      } catch (e) {
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied'
        });
      }
    } else {
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
      });
    }
  </script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18003465740"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'AW-18003465740');
    gtag('config', 'G-ZPWT5ZT4X4');
  </script>`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // If the file already has G-ZPWT5ZT4X4, skip it
  if (content.includes('G-ZPWT5ZT4X4')) {
    console.log(`[SKIP] ${file} already has Google Analytics active.`);
    return;
  }
  
  // If the file has the old Google Tag block (without GA4), we replace it
  if (content.includes('AW-18003465740')) {
    console.log(`[UPDATE] ${file} has Google Ads but lacks GA4. Upgrading it...`);
    // Remove the old consent mode block if it exists
    content = content.replace(/<!-- Google Consent Mode v2 Default State -->[\s\S]*?<\/script>\s*<!-- Google tag \(gtag.js\) -->[\s\S]*?<\/script>/, '');
    content = content.replace(/<!-- Google tag \(gtag.js\) -->[\s\S]*?<\/script>/, '');
  }
  
  // Insert the block right after <head>
  if (content.includes('<head>')) {
    content = content.replace('<head>', `<head>\n${consentAndTagBlock}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[ADDED] Google Tag & GA4 successfully added to ${file}`);
  } else {
    console.log(`[WARNING] Could not find <head> in ${file}`);
  }
});
