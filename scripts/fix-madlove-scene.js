const fs = require('fs');

const filename = process.argv[2] || 'Nanhwa_MADLOVE.html';
const html = fs.readFileSync(filename, 'utf8');
const pattern = /(<script id="exportData" type="application\/json">)([\s\S]*?)(<\/script>)/g;
const matches = [...html.matchAll(pattern)];

if (!matches.length) throw new Error('exportData was not found');

const exported = matches[matches.length - 1];
const data = JSON.parse(exported[2]);
const target = data.beats.find((beat) =>
  beat.text === '문제는, 그것이 숲에서 나온 흔적인지, 숲으로 들어간 흔적인지 분간할 수 없다는 점입니다.'
);

if (!target) throw new Error('target beat was not found');

delete target.bgChange;
delete target.bgmChange;

const replacement = exported[1] + JSON.stringify(data).replace(/</g, '\\u003c') + exported[3];
const start = exported.index;
const result = html.slice(0, start) + replacement + html.slice(start + exported[0].length);

fs.writeFileSync(filename, result, 'utf8');
console.log('Removed the premature forest background and BGM transition.');
