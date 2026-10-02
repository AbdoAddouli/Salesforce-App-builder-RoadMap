const fs = require('fs');
const path = process.argv[2];
const from = parseInt(process.argv[3], 10) - 1;
const to = parseInt(process.argv[4], 10);
const L = fs.readFileSync(path, 'utf8').split(/\r?\n/);
for (let i = from; i < to && i < L.length; i++) {
  const l = L[i];
  let b = 0;
  let q = 0;
  for (let j = 0; j < l.length; j++) {
    const c = l[j];
    if (c === String.fromCharCode(92)) { j++; continue; }
    if (c === String.fromCharCode(96)) b++;
    if (c === String.fromCharCode(39)) q++;
  }
  if (b % 2 !== 0 || q % 2 !== 0) {
    console.log('L' + (i + 1) + ' backticks=' + b + ' quotes=' + q + '  ' + l.trim().slice(0, 90));
  }
}
console.log('scan done');