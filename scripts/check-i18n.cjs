const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const output = path.resolve('work/i18n-check/compiled');
fs.mkdirSync(output, { recursive: true });
const configPath = path.resolve('work/i18n-check/tsconfig.json');
fs.writeFileSync(configPath,JSON.stringify({extends:path.resolve('tsconfig.json'),compilerOptions:{noEmit:false,module:'node16',moduleResolution:'node16',incremental:false,outDir:output,rootDir:path.resolve('.')},include:[path.resolve('data/**/*.ts'),path.resolve('lib/calendar.ts')],exclude:[]}));
execFileSync(process.execPath,[path.resolve('node_modules/typescript/bin/tsc'),'--project',configPath],{stdio:'inherit'});
const { contentEn, messagesEn } = require(path.join(output, 'data/content.en.js'));
const { contentHi, messagesHi } = require(path.join(output, 'data/content.hi.js'));
function compare(a,b,at='content') {
 if(at.startsWith('content.familyBlessings.groups.') && at.endsWith('.names') && Array.isArray(a) && Array.isArray(b)) { assert.ok(a.every(v=>typeof v==='string') && b.every(v=>typeof v==='string')); return; }
 assert.deepEqual(Object.keys(b).sort(), Object.keys(a).sort(), `Key mismatch at ${at}`);
 for(const key of Object.keys(a)) { assert.equal(typeof b[key],typeof a[key],`Type mismatch: ${at}.${key}`); if(a[key] && typeof a[key] === 'object') compare(a[key],b[key],`${at}.${key}`); }
}
compare(contentEn, contentHi); compare(messagesEn,messagesHi,'messages');
const structural = new Set(['chime','photo','ticketPhoto','src','image','music','flipSound','tabSound','mapLink','color','style','tone','ink','gold','cream','sparkleGold','top','left','width','height','start','date','time','label','tab','tv']);
const allowedWords = /\b(?:Monday|MONDAY|Saturday|SATURDAY|Sunday|SUNDAY|January|JAN|AM|PM)\b/g;
function check(value,at='contentHi',key='') {
 if(typeof value === 'string') {
  assert.ok(!/[०-९]/u.test(value),`Devanagari digits at ${at}`);
  if(structural.has(key) && !/[\u0900-\u097f]/u.test(value)) return;
  const text=value.replace(/\{\w+\}/g,'').replace(allowedWords,'');
  assert.ok(!/[A-Za-z]/.test(text),`Untranslated English at ${at}: ${value}`);
 } else if(value && typeof value==='object') for(const [k,v] of Object.entries(value)) check(v,`${at}.${k}`,k);
}
check(contentHi); check(messagesHi,'messagesHi');
for(let day=0;day<2;day++) {
 assert.equal(contentHi.events[day].date,contentEn.events[day].date);
 for(let index=0;index<3;index++) assert.equal(contentHi.events[day].items[index].time,contentEn.events[day].items[index].time);
}
assert.equal(contentHi.story.chapters.length,6);
console.log('PASS: locale key parity, Hindi copy without English leaks or Devanagari digits, unchanged event dates/times, six complete story chapters.');

const vm = require('node:vm');
const calendar = {};
vm.runInNewContext(fs.readFileSync(path.join(output,'lib/calendar.js'),'utf8'),{exports:calendar,require:specifier=>require(path.join(output,specifier.replace('@/','')+'.js')),Date,TextEncoder,URLSearchParams});
for(const language of ['en','hi']) {
 const entries=calendar.getAllEvents(language);
 const ics=calendar.generateICS(entries,new Date('2026-11-24T00:00:00Z'),language);
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,6);
 assert.ok(ics.includes('DTSTART:20270130T043000Z'));
 const unfolded=ics.replace(/\r\n /g,'');
 assert.ok(unfolded.includes(language==='hi'?'SUMMARY:कार्निवल':'SUMMARY:Carnival'));
 assert.ok(!unfolded.includes('[object Object]'));
 for(const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line)<=75);
}
console.log('PASS: English/Hindi calendar titles, six events, unchanged IST times and UTF-8 line folding.');

assert.equal(contentEn.familyBlessings.groups.length,6);
assert.equal(contentHi.familyBlessings.groups.length,6);
assert.equal(contentEn.familyBlessings.groups[4].names.length,13);
assert.equal(contentHi.familyBlessings.groups[4].names.length,13);
assert.equal(contentEn.familyBlessings.groups[5].names.length,10);
assert.equal(contentHi.familyBlessings.groups[5].names.length,10);
assert.equal(contentEn.familyBlessings.littleHearts.quotes.length,2);
assert.equal(contentHi.familyBlessings.littleHearts.repeatInvitation,'ज़रूर-ज़रूर आना');
console.log('PASS: all seven blessing groups and intentionally different English/Hindi invitation lists.');
