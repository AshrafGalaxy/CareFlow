const fs = require('fs');
const path = require('path');

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Avoid node_modules and .next
      if (file !== 'node_modules' && file !== '.next') {
        walkAndReplace(fullPath);
      }
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content
          // Replace capitalized 'Provider' with 'Doctor' in component names/classes
          .replace(/ProviderDashboardPage/g, 'DoctorDashboardPage')
          .replace(/ProviderLayout/g, 'DoctorLayout')
          .replace(/Provider Portal/g, 'Doctor Portal')
          // Path imports and URLs
          .replace(/\/provider\//g, '/doctor/')
          .replace(/@\/components\/provider\//g, '@/components/doctor/')
          // General lower case matches
          .replace(/provider\/dashboard/g, 'doctor/dashboard')
          .replace(/provider\/login/g, 'doctor/login')
          .replace(/provider\/patients/g, 'doctor/patients');
          
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent);
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

walkAndReplace(path.join(__dirname, 'src'));
