/* Small, truthful browser models for the assignment's five structures.
 * The animation uses 9 keys; B+ uses capacity 4 so splits are visible.
 * Neither animation metrics nor its capacity are the timed C experiment.
 */
const DEMO_SCENARIOS={
 ascending:{label:'① 升序插入 → 升序删除',insert:[1,2,3,4,5,6,7,8,9],remove:[1,2,3,4,5,6,7,8,9]},
 descending:{label:'② 升序插入 → 降序删除',insert:[1,2,3,4,5,6,7,8,9],remove:[9,8,7,6,5,4,3,2,1]},
 random:{label:'③ 随机插入 → 随机删除',insert:[4,1,7,2,8,5,3,9,6],remove:[5,2,9,1,7,3,8,4,6]}
};
const cloneTree=root=>root?JSON.parse(JSON.stringify(root)):null;
const binaryHeight=n=>n?1+Math.max(binaryHeight(n.l),binaryHeight(n.r)):0;
const binaryPath=(root,key)=>{const path=[];let node=root;while(node){path.push(node.k);if(key===node.k)break;node=key<node.k?node.l:node.r;}return path;};
class BSTModel{
 constructor(){this.root=null;this.events=[];this.rotations=0;}
 insert(key){this.events=[];if(!this.root){this.root={k:key,l:null,r:null};this.events.push('空树：新键成为根');return;}
  let node=this.root;while(node){const side=key<node.k?'l':'r';if(key===node.k)return;if(!node[side]){node[side]={k:key,l:null,r:null};this.events.push('沿搜索路径，直接连接新叶');return;}node=node[side];}}
 delete(key){this.events=[];const remove=(node,k)=>{if(!node)return null;if(k<node.k){node.l=remove(node.l,k);return node;}if(k>node.k){node.r=remove(node.r,k);return node;}if(!node.l||!node.r)return node.l||node.r;
  let successor=node.r;while(successor.l)successor=successor.l;node.k=successor.k;node.r=remove(node.r,successor.k);this.events.push('双子节点：以中序后继替换');return node;};this.root=remove(this.root,key);if(!this.events.length)this.events.push('删除后直接重接子树');}
 snapshot(){return {kind:'binary',root:cloneTree(this.root),height:binaryHeight(this.root),events:[...this.events],rotations:this.rotations};}
 path(key){return binaryPath(this.root,key);}
}
class AVLModel{
 constructor(){this.root=null;this.events=[];this.rotations=0;}
 h(n){return n?n.h:0;}
 update(n){n.h=1+Math.max(this.h(n.l),this.h(n.r));}
 left(a){const b=a.r;a.r=b.l;b.l=a;this.update(a);this.update(b);this.rotations++;this.events.push('左旋，恢复高度差');return b;}
 right(a){const b=a.l;a.l=b.r;b.r=a;this.update(a);this.update(b);this.rotations++;this.events.push('右旋，恢复高度差');return b;}
 balance(n){if(!n)return n;this.update(n);const diff=this.h(n.l)-this.h(n.r);if(diff>1){if(this.h(n.l.l)<this.h(n.l.r))n.l=this.left(n.l);return this.right(n);}if(diff< -1){if(this.h(n.r.r)<this.h(n.r.l))n.r=this.right(n.r);return this.left(n);}return n;}
 insert(key){this.events=[];const add=(n)=>{if(!n)return{k:key,l:null,r:null,h:1};if(key<n.k)n.l=add(n.l);else if(key>n.k)n.r=add(n.r);return this.balance(n);};this.root=add(this.root);if(!this.events.length)this.events.push('更新高度；无需旋转');}
 delete(key){this.events=[];const remove=(n,k)=>{if(!n)return null;if(k<n.k)n.l=remove(n.l,k);else if(k>n.k)n.r=remove(n.r,k);else if(n.l&&n.r){let next=n.r;while(next.l)next=next.l;n.k=next.k;n.r=remove(n.r,next.k);}else return n.l||n.r;return this.balance(n);};this.root=remove(this.root,key);if(!this.events.length)this.events.push('回溯检查高度差');}
 snapshot(){return {kind:'binary',root:cloneTree(this.root),height:binaryHeight(this.root),events:[...this.events],rotations:this.rotations};}
 path(key){return binaryPath(this.root,key);}
}
class SplayModel{
 constructor(){const Engine=typeof TraceTree==='undefined'?require('./trace-engine').TraceTree:TraceTree;this.tree=new Engine('Splay');this.events=[];}
 insert(key){const start=this.tree.frames.length;this.tree.insert(key);this.capture(start);}
 delete(key){const start=this.tree.frames.length;this.tree.delete(key);this.capture(start);}
 capture(start){const frames=this.tree.frames.slice(start),rotations=frames.filter(f=>f.event==='rotate').length;this.events=rotations?[`伸展时旋转 ${rotations} 次，再重组`]:['伸展并重组；本次无旋转'];}
 snapshot(){return {kind:'binary',root:cloneTree(this.tree.root),height:binaryHeight(this.tree.root),events:[...this.events],rotations:this.tree.stats.rotate};}
 path(key){return binaryPath(this.tree.root,key);}
}
class RBModel{
 constructor(){this.root=null;this.events=[];this.rotations=0;this.colorFlips=0;}
 red(n){return!!(n&&n.red);}
 left(h){let x=h.r;h.r=x.l;x.l=h;x.red=h.red;h.red=true;this.rotations++;this.events.push('左旋：红链接左倾');return x;}
 right(h){let x=h.l;h.l=x.r;x.r=h;x.red=h.red;h.red=true;this.rotations++;this.events.push('右旋：修复连续红链接');return x;}
 flip(h){h.red=!h.red;h.l.red=!h.l.red;h.r.red=!h.r.red;this.colorFlips++;this.events.push('颜色翻转：分解或合并 4-节点');}
 balance(h){if(this.red(h.r))h=this.left(h);if(this.red(h.l)&&this.red(h.l.l))h=this.right(h);if(this.red(h.l)&&this.red(h.r))this.flip(h);return h;}
 insert(key){this.events=[];const add=h=>{if(!h)return{k:key,l:null,r:null,red:true};if(key<h.k)h.l=add(h.l);else if(key>h.k)h.r=add(h.r);return this.balance(h);};this.root=add(this.root);this.root.red=false;if(!this.events.length)this.events.push('插入红节点；根保持黑色');}
 moveLeft(h){this.flip(h);if(this.red(h.r?.l)){h.r=this.right(h.r);h=this.left(h);this.flip(h);}return h;}
 moveRight(h){this.flip(h);if(this.red(h.l?.l)){h=this.right(h);this.flip(h);}return h;}
 min(h){while(h.l)h=h.l;return h;}
 deleteMin(h){if(!h.l)return null;if(!this.red(h.l)&&!this.red(h.l.l))h=this.moveLeft(h);h.l=this.deleteMin(h.l);return this.balance(h);}
 delete(key){this.events=[];if(!this.root)return;if(!this.has(key))return;if(!this.red(this.root.l)&&!this.red(this.root.r))this.root.red=true;
  const remove=(h,k)=>{if(k<h.k){if(!this.red(h.l)&&!this.red(h.l?.l))h=this.moveLeft(h);h.l=remove(h.l,k);}else{if(this.red(h.l))h=this.right(h);if(k===h.k&&!h.r)return null;if(!this.red(h.r)&&!this.red(h.r?.l))h=this.moveRight(h);if(k===h.k){h.k=this.min(h.r).k;h.r=this.deleteMin(h.r);}else h.r=remove(h.r,k);}return this.balance(h);};
  this.root=remove(this.root,key);if(this.root)this.root.red=false;if(!this.events.length)this.events.push('删除后颜色约束仍成立');}
 has(key){return binaryPath(this.root,key).at(-1)===key;}
 snapshot(){return {kind:'binary',root:cloneTree(this.root),height:binaryHeight(this.root),events:[...this.events],rotations:this.rotations,colorFlips:this.colorFlips};}
 path(key){return binaryPath(this.root,key);}
}
class BPlusModel{
 constructor(capacity=4){this.capacity=capacity;this.minimum=capacity/2;this.root=null;this.nextId=1;this.events=[];this.splits=0;this.merges=0;}
 node(leaf){return{id:this.nextId++,leaf,keys:[],children:[],next:null};}
 count(n){return n.leaf?n.keys.length:n.children.length;}
 min(n){return n.leaf?n.keys[0]:this.min(n.children[0]);}
 refresh(n){if(!n.leaf)n.keys=n.children.slice(1).map(child=>this.min(child));}
 childIndex(n,key){let i=0;while(i<n.keys.length&&key>=n.keys[i])i++;return i;}
 insert(key){this.events=[];if(!this.root)this.root=this.node(true);
  const add=n=>{if(n.leaf){let i=0;while(i<n.keys.length&&n.keys[i]<key)i++;if(n.keys[i]===key)return null;n.keys.splice(i,0,key);}else{const i=this.childIndex(n,key),right=add(n.children[i]);if(right)n.children.splice(i+1,0,right);this.refresh(n);}
   if(this.count(n)<=this.capacity)return null;
   const right=this.node(n.leaf);if(n.leaf){right.keys=n.keys.splice(this.minimum);right.next=n.next;n.next=right.id;}else{right.children=n.children.splice(this.minimum);this.refresh(n);this.refresh(right);}
   this.splits++;this.events.push(n.leaf?'叶节点分裂，记录仍在叶层':'内部节点分裂，增加一层');return right;};
  const right=add(this.root);if(right){const parent=this.node(false);parent.children=[this.root,right];this.refresh(parent);this.root=parent;}
  if(!this.events.length)this.events.push('记录插入叶节点；尚未分裂');}
 repair(parent,i){const child=parent.children[i];if(this.count(child)>=this.minimum)return;
  const left=i>0?parent.children[i-1]:null,right=i+1<parent.children.length?parent.children[i+1]:null;
  if(left&&this.count(left)>this.minimum){if(child.leaf)child.keys.unshift(left.keys.pop());else child.children.unshift(left.children.pop());this.refresh(left);this.refresh(child);this.events.push('从左兄弟借位');}
  else if(right&&this.count(right)>this.minimum){if(child.leaf)child.keys.push(right.keys.shift());else child.children.push(right.children.shift());this.refresh(right);this.refresh(child);this.events.push('从右兄弟借位');}
  else{const index=left?i-1:i,a=parent.children[index],b=parent.children[index+1];if(a.leaf){a.keys.push(...b.keys);a.next=b.next;}else{a.children.push(...b.children);this.refresh(a);}parent.children.splice(index+1,1);this.merges++;this.events.push('相邻节点合并');}
  this.refresh(parent);
 }
 delete(key){this.events=[];if(!this.root)return;const remove=n=>{if(n.leaf){const i=n.keys.indexOf(key);if(i>=0)n.keys.splice(i,1);return;}const i=this.childIndex(n,key);remove(n.children[i]);this.repair(n,i);this.refresh(n);};remove(this.root);
  if(!this.root.leaf&&this.root.children.length===1){this.root=this.root.children[0];this.events.push('根缩减一层');}
  if(this.root.leaf&&!this.root.keys.length)this.root=null;
  if(!this.events.length)this.events.push('从叶节点移除记录');}
 snapshot(){const height=n=>n?(n.leaf?1:1+height(n.children[0])):0;return{kind:'bplus',root:cloneTree(this.root),height:height(this.root),events:[...this.events],splits:this.splits,merges:this.merges,capacity:this.capacity};}
 path(key){const path=[];let n=this.root;while(n){path.push(n.id);if(n.leaf)break;n=n.children[this.childIndex(n,key)];}return path;}
}
function makeExperiment(mode){const spec=DEMO_SCENARIOS[mode];if(!spec)throw Error('Unknown scenario '+mode);
 const models=[new BSTModel(),new AVLModel(),new SplayModel(),new RBModel(),new BPlusModel()];
 const names=['BST','AVL','Splay','Red-Black','B+ Tree'];
 const views=()=>models.map((model,i)=>({name:names[i],...model.snapshot()}));
 const states=[{phase:'setup',step:'ready',key:null,completed:0,views:views(),paths:[[],[],[],[],[]]}];
 for(const [phase,order] of [['insert',spec.insert],['delete',spec.remove]])for(const key of order){
  const before=views(),paths=models.map(model=>model.path(key));
  states.push({phase,step:'search',key,completed:states.at(-1).completed,views:before,paths});
  models.forEach(model=>model[phase](key));
  states.push({phase,step:'result',key,completed:states.at(-1).completed+1,views:views(),paths:[[],[],[],[],[]]});
 }
 return{spec,states};
}
if(typeof module!=='undefined')module.exports={DEMO_SCENARIOS,BSTModel,AVLModel,SplayModel,RBModel,BPlusModel,makeExperiment};
