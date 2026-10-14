const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {macDatasets,sizes}=require('./data');
const rows=fs.readFileSync(path.join(__dirname,'benchmarks/mac-2026-10-15.csv'),'utf8').trim().split(/\r?\n/);
assert.equal(rows[0],'scenario,n,repeat,seed,tree,insert_seconds,delete_seconds,total_seconds');
assert.equal(rows.length-1,315);
const scenarios=['increasing_same','increasing_reverse','random_random'];
const trees=['BST','AVL','Splay','RedBlack','BPlus32'];
const values=new Map();
for(const row of rows.slice(1)){
 const [scenario,n,repeat,seed,tree,insert,remove,total]=row.split(',');
 assert(Math.abs(Number(insert)+Number(remove)-Number(total))<1e-8);
 const key=`${scenario}|${n}|${tree}`;
 if(!values.has(key))values.set(key,[]);
 values.get(key).push({repeat:Number(repeat),ms:Number(total)*1000});
}
for(const [si,scenario] of scenarios.entries())for(const [ni,n] of sizes.entries())for(const [ti,tree] of trees.entries()){
 const readings=values.get(`${scenario}|${n}|${tree}`);
 assert.equal(readings.length,3);
 assert.deepEqual(readings.map(x=>x.repeat).sort(),[0,1,2]);
 const median=readings.map(x=>x.ms).sort((a,b)=>a-b)[1];
 assert(Math.abs(median-macDatasets[si][ti][ni])<0.00051,`${scenario} ${n} ${tree}: median mismatch`);
}
console.log('PASS 315 raw macOS timings match all 105 chart medians');
