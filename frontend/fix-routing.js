const fs = require('fs');
const p = require('path');
function walk(d) {
  let list = fs.readdirSync(d);
  list.forEach(f => {
    let file = p.join(d, f);
    let stat = fs.statSync(file);
    if (stat.isDirectory()) {
      walk(file);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let c = fs.readFileSync(file, 'utf8');
      let originalC = c;
      let match = c.match(/import\s+{([^}]+)}\s+from\s+["']next\/navigation["']/);
      if (match) {
        let imports = match[1].split(',').map(s => s.trim()).filter(s => s);
        let toMove = imports.filter(i => ['useRouter', 'usePathname', 'redirect'].includes(i));
        let toKeep = imports.filter(i => !['useRouter', 'usePathname', 'redirect'].includes(i));
        if (toMove.length > 0) {
          let newImports = [];
          if (toKeep.length > 0) {
            newImports.push(`import { ${toKeep.join(', ')} } from "next/navigation"`);
          }
          newImports.push(`import { ${toMove.join(', ')} } from "@/i18n/routing"`);
          c = c.replace(match[0], newImports.join('\n'));
        }
      }
      if (c !== originalC) fs.writeFileSync(file, c);
    }
  });
}
walk('src');
