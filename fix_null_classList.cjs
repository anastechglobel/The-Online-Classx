const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(/document\.getElementById\('mainContent'\)\.classList\.remove\('hidden'\);/g, 'const mc = document.getElementById("mainContent"); if(mc) mc.classList.remove("hidden");');
indexHtml = indexHtml.replace(/document\.getElementById\('bottomNav'\)\.classList\.remove\('hidden'\);/g, 'const bn = document.getElementById("bottomNav"); if(bn) bn.classList.remove("hidden");');

indexHtml = indexHtml.replace(/document\.getElementById\('mainContent'\)\.classList\.add\('hidden'\);/g, 'const mc_add = document.getElementById("mainContent"); if(mc_add) mc_add.classList.add("hidden");');
indexHtml = indexHtml.replace(/document\.getElementById\('bottomNav'\)\.classList\.add\('hidden'\);/g, 'const bn_add = document.getElementById("bottomNav"); if(bn_add) bn_add.classList.add("hidden");');

indexHtml = indexHtml.replace(/document\.getElementById\('profileSetupForm'\)\.classList\.add\('hidden'\);/g, 'const psf_add = document.getElementById("profileSetupForm"); if(psf_add) psf_add.classList.add("hidden");');
indexHtml = indexHtml.replace(/document\.getElementById\('authSection'\)\.classList\.add\('hidden'\);/g, 'const as_add = document.getElementById("authSection"); if(as_add) as_add.classList.add("hidden");');

indexHtml = indexHtml.replace(/document\.getElementById\('playIntroOverlay'\)\.classList\.add\('hidden'\);/g, 'const pio = document.getElementById("playIntroOverlay"); if(pio) pio.classList.add("hidden");');
indexHtml = indexHtml.replace(/document\.getElementById\('courseThumbOverlay'\)\.classList\.add\('hidden'\);/g, 'const cto = document.getElementById("courseThumbOverlay"); if(cto) cto.classList.add("hidden");');

fs.writeFileSync('index.html', indexHtml);
console.log("index.html fixed null references");
