const assert=require('node:assert/strict');
const {DEMO_SCENARIOS,BSTModel,AVLModel,SplayModel,RBModel,BPlusModel,makeExperiment}=require('./experiment-engine');
const {names,sizes,datasets}=require('./data');
assert.equal(names.length,5);assert.equal(sizes.length,7);assert.equal(datasets.length,3);
for(const scenario of datasets)for(const row of scenario){assert.equal(row.length,sizes.length);assert(row.every(value=>Number.isFinite(value)&&value>0));}
assert.equal(Math.round(datasets[0][0][6]/datasets[0][2][6]),3233);
assert.equal(Math.round(datasets[1][0][6]/datasets[1][2][6]),5633);
function inspectBinary(root,kind){
 let values=[],blackHeights=[];
 function walk(n,lo=-Infinity,hi=Infinity,parentRed=false,black=0){
  if(!n){if(kind==='Red-Black')blackHeights.push(black+1);return 0;}
  assert(n.k>lo&&n.k<hi,`${kind}: BST ordering`);
  if(kind==='Red-Black'){assert(!parentRed||!n.red,'double red');assert(!n.r?.red,'right-leaning red');}
  const hL=walk(n.l,lo,n.k,!!n.red,black+(n.red?0:1));values.push(n.k);
  const hR=walk(n.r,n.k,hi,!!n.red,black+(n.red?0:1));
  if(kind==='AVL'){assert(Math.abs(hL-hR)<=1,'AVL balance');assert.equal(n.h,1+Math.max(hL,hR),'AVL cached height');}
  return 1+Math.max(hL,hR);
 }
 if(kind==='Red-Black'&&root)assert(!root.red,'black root');
 const height=walk(root);
 if(kind==='Red-Black')assert(blackHeights.every(n=>n===blackHeights[0]),'black height');
 return{values,height};
}
function inspectBPlus(root,capacity=4){
 if(!root)return{values:[],height:0};
 const leaves=[],values=[];
 function walk(n,depth,isRoot){
  const count=n.leaf?n.keys.length:n.children.length;
  assert(count<=capacity,'B+ overfull');if(!isRoot)assert(count>=capacity/2,'B+ underfull');
  if(n.leaf){assert(n.keys.every((key,i)=>i===0||n.keys[i-1]<key),'leaf sorted');leaves.push({n,depth});values.push(...n.keys);return n.keys[0];}
  assert.equal(n.keys.length,n.children.length-1,'separator count');
  const mins=n.children.map(child=>walk(child,depth+1,false));
  for(let i=1;i<mins.length;i++)assert.equal(n.keys[i-1],mins[i],'separator minimum');
  return mins[0];
 }
 walk(root,1,true);
 assert(leaves.every(x=>x.depth===leaves[0].depth),'leaves same depth');
 for(let i=0;i<leaves.length;i++)assert.equal(leaves[i].n.next,leaves[i+1]?.n.id??null,'leaf chain');
 assert(values.every((key,i)=>i===0||values[i-1]<key),'B+ values sorted');
 return{values,height:leaves[0].depth};
}
function check(views,expected){
 views.forEach(view=>{
  const actual=view.kind==='bplus'?inspectBPlus(view.root):inspectBinary(view.root,view.name);
  assert.deepEqual(actual.values,[...expected].sort((a,b)=>a-b),view.name+' contents');
  assert.equal(actual.height,view.height,view.name+' reported height');
 });
}
for(const mode of Object.keys(DEMO_SCENARIOS)){
 const {states,spec}=makeExperiment(mode),set=new Set();
 assert.equal(states.length,37);
 states.forEach(state=>{if(state.step==='result'){state.phase==='insert'?set.add(state.key):set.delete(state.key);check(state.views,set);}});
 assert.equal(set.size,0);
 console.log('PASS scenario',mode,spec.insert.join(''),spec.remove.join(''));
}
let seed=0x156abf;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/2**32;}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
for(let trial=0;trial<80;trial++){
 const keys=Array.from({length:9},(_,i)=>i+1),models=[new BSTModel(),new AVLModel(),new SplayModel(),new RBModel(),new BPlusModel()],set=new Set();
 for(const key of shuffle(keys)){models.forEach(m=>m.insert(key));set.add(key);check(models.map((m,i)=>({name:['BST','AVL','Splay','Red-Black','B+ Tree'][i],...m.snapshot()})),set);}
 for(const key of shuffle(keys)){models.forEach(m=>m.delete(key));set.delete(key);check(models.map((m,i)=>({name:['BST','AVL','Splay','Red-Black','B+ Tree'][i],...m.snapshot()})),set);}
}
console.log('PASS 80 shuffled full insert/delete cycles, five structure invariants');
