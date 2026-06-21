const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-slate-950/g, 'bg-slate-50');
  content = content.replace(/bg-slate-900\/50/g, 'bg-white shadow-sm');
  content = content.replace(/bg-slate-900\/80/g, 'bg-white');
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-slate-800\/50/g, 'bg-slate-100');
  content = content.replace(/bg-slate-800/g, 'bg-slate-100');
  content = content.replace(/bg-slate-700/g, 'bg-slate-200');

  // Text
  content = content.replace(/text-slate-50/g, 'text-slate-900');
  content = content.replace(/text-white/g, 'text-slate-900');
  content = content.replace(/text-slate-400/g, 'text-slate-500');
  content = content.replace(/text-slate-300/g, 'text-slate-600');

  // Borders
  content = content.replace(/border-slate-800\/50/g, 'border-slate-200');
  content = content.replace(/border-slate-800/g, 'border-slate-200');
  content = content.replace(/border-slate-700\/50/g, 'border-slate-200');
  content = content.replace(/border-slate-700/g, 'border-slate-300');
  content = content.replace(/border-slate-600/g, 'border-slate-300');

  // Accents (Lime Green) - resident/admin/security mapping
  // Blue -> Lime
  content = content.replace(/text-blue-400/g, 'text-lime-600');
  content = content.replace(/bg-blue-600\/10/g, 'bg-lime-500\/10');
  content = content.replace(/border-blue-500\/20/g, 'border-lime-500\/20');
  content = content.replace(/from-blue-600/g, 'from-lime-500');
  content = content.replace(/to-indigo-600/g, 'to-lime-600');
  content = content.replace(/from-blue-500/g, 'from-lime-400');
  content = content.replace(/to-indigo-500/g, 'to-lime-500');
  content = content.replace(/text-blue-500/g, 'text-lime-600');
  content = content.replace(/bg-blue-500/g, 'bg-lime-500');
  content = content.replace(/bg-blue-600/g, 'bg-lime-600');
  content = content.replace(/hover:text-blue-400/g, 'hover:text-lime-600');

  // Purple -> Lime
  content = content.replace(/text-purple-400/g, 'text-lime-600');
  content = content.replace(/bg-purple-600\/10/g, 'bg-lime-500\/10');
  content = content.replace(/border-purple-500\/20/g, 'border-lime-500\/20');
  content = content.replace(/from-purple-600/g, 'from-lime-500');
  content = content.replace(/to-pink-600/g, 'to-lime-600');
  content = content.replace(/from-purple-500/g, 'from-lime-400');
  content = content.replace(/to-pink-500/g, 'to-lime-500');
  content = content.replace(/text-purple-500/g, 'text-lime-600');
  content = content.replace(/bg-purple-500/g, 'bg-lime-500');
  content = content.replace(/bg-purple-600/g, 'bg-lime-600');
  content = content.replace(/hover:text-purple-400/g, 'hover:text-lime-600');
  
  // Amber -> Lime
  content = content.replace(/text-amber-400/g, 'text-lime-600');
  content = content.replace(/bg-amber-600\/10/g, 'bg-lime-500\/10');
  content = content.replace(/border-amber-500\/20/g, 'border-lime-500\/20');
  content = content.replace(/from-amber-600/g, 'from-lime-500');
  content = content.replace(/to-orange-600/g, 'to-lime-600');
  content = content.replace(/from-amber-500/g, 'from-lime-400');
  content = content.replace(/to-orange-500/g, 'to-lime-500');
  content = content.replace(/text-amber-500/g, 'text-lime-600');
  content = content.replace(/bg-amber-500/g, 'bg-lime-500');
  content = content.replace(/bg-amber-600/g, 'bg-lime-600');
  content = content.replace(/hover:text-amber-400/g, 'hover:text-lime-600');

  // Radiuses
  content = content.replace(/rounded-3xl/g, 'rounded-xl');
  content = content.replace(/rounded-2xl/g, 'rounded-lg');
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

walkDir(path.join(__dirname, 'app'), processFile);
console.log('Refactoring complete.');
