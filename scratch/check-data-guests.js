const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data.js');
const CONVOCATION_DATA = require(dataPath);

console.log("=== CHIEF GUEST ===");
console.log("Title:", CONVOCATION_DATA.chiefGuest?.title);
console.log("Images:", CONVOCATION_DATA.chiefGuest?.sections?.[0]?.images);
console.log("Intro text (first 2 paragraphs):", CONVOCATION_DATA.chiefGuest?.sections?.[1]?.content?.slice(0, 3));

console.log("=== GUEST OF HONOUR ===");
console.log("Title:", CONVOCATION_DATA.guestOfHonour?.title);
console.log("Images:", CONVOCATION_DATA.guestOfHonour?.sections?.[0]?.images);
console.log("Intro text (first 2 paragraphs):", CONVOCATION_DATA.guestOfHonour?.sections?.[1]?.content?.slice(0, 3));

console.log("=== PRO-CHANCELLOR / DG ===");
console.log("Title:", CONVOCATION_DATA.directorGeneral?.title);
console.log("Images:", CONVOCATION_DATA.directorGeneral?.sections?.[0]?.images);
console.log("Intro text (first 2 paragraphs):", CONVOCATION_DATA.directorGeneral?.sections?.[1]?.content?.slice(0, 3));
