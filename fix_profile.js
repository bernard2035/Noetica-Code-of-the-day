const fs = require('fs');

const file = 'app/resident/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix blue colors
content = content.replace(/border-blue-500/g, 'border-lime-500');
content = content.replace(/ring-blue-500/g, 'ring-lime-500');
content = content.replace(/text-blue-500/g, 'text-lime-600');
content = content.replace(/bg-blue-500/g, 'bg-lime-500');
content = content.replace(/text-blue-300/g, 'text-lime-600');
content = content.replace(/from-blue-400/g, 'from-lime-500');
content = content.replace(/to-indigo-400/g, 'to-lime-600');

// Fix shadows
content = content.replace(/rgba\(59,130,246/g, 'rgba(132,204,22');
content = content.replace(/rgba\(37,99,235/g, 'rgba(132,204,22');

// Fix Edit button
content = content.replace(/bg-lime-600\/20 text-lime-600 border border-lime-500\/30 hover:bg-lime-600\/30/g, 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-lime-600 shadow-sm');

// Fix Avatar weird background
content = content.replace(/<div className="absolute top-0 w-full h-24 bg-gradient-to-b from-lime-500\/20 to-transparent pointer-events-none" \/>/g, '');

// Change read-only inputs from bg-white to bg-slate-50 for contrast
content = content.replace(/className="text-slate-900 bg-white shadow-sm px-4 py-3 rounded-xl border border-slate-200 relative"/g, 'className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 relative"');
content = content.replace(/className="text-slate-900 bg-white shadow-sm px-4 py-3 rounded-xl border border-slate-200"/g, 'className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200"');

// Fix Unique ID input
content = content.replace(/className="text-slate-9000 bg-white\/30 px-4 py-3 rounded-xl border border-slate-200\/30 font-mono cursor-not-allowed"/g, 'className="text-slate-500 bg-slate-100 px-4 py-3 rounded-xl border border-slate-200 font-mono cursor-not-allowed"');

// Fix card backgrounds to be solid white instead of glass panel to avoid any weirdness
content = content.replace(/className="glass-panel/g, 'className="bg-white shadow-sm');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed profile page colors');
