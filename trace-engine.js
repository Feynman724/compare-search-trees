/* Instrumented BST and top-down Splay. Node ids remain stable across frames.
 * compare counts each three-way key comparator call; pointer writes count
 * explicit child/root/temporary-root assignments, excluding node initialization.
 */
class TraceTree {
 constructor(kind){this.kind=kind;this.root=null;this.frames=[];this.stats={compare:0,rotate:0,write:0};this.path=[];this.op='';this.key=null;this.phase='insert';this.forest=null;this.join=null;}
 node(k){return {k,id:k,l:null,r:null};}
 set(n,side,value){n[side]=value;this.stats.write++;}
 rootTo(n){this.root=n;this.stats.write++;}
 snapshot(message,hot=null,event='structure'){
  let groups=this.forest?[{label:'小于目标 / L',root:this.forest.head.r},{label:'当前搜索树 / T',root:this.forest.t},{label:'大于目标 / R',root:this.forest.head.l}]:[{label:'当前树',root:this.root}];
  if(this.join)groups.push({label:'待连接右子树',root:this.join});
  this.frames.push(JSON.parse(JSON.stringify({groups,message,hot,event,stats:this.stats,path:this.path,op:this.op,key:this.key,phase:this.phase})));
 }
 cmp(k,n,note='比较'){this.stats.compare++;this.path.push(n.id);let result=Math.sign(k-n.k);this.snapshot(`${note}：${k} ${result<0?'<':result>0?'>':'='} ${n.k}`,n.id,'compare');return result;}
 begin(op,k){this.op=op;this.key=k;this.path=[];this.snapshot(`${op==='insert'?'插入':'删除'} ${k}：从当前根开始`,null,'start');}
 splay(k){if(!this.root)return;let head={l:null,r:null},l=head,r=head,t=this.root;this.root=null;this.stats.write++;this.forest={head,t};this.snapshot('建立临时左右树 L / R，沿当前树 T 搜索');
  while(true){let c=this.cmp(k,t);if(c<0){if(!t.l)break;let cc=this.cmp(k,t.l,'检查左孩子，判断是否为 zig-zig');if(cc<0){let y=t.l;this.set(t,'l',y.r);this.set(y,'r',t);t=y;this.forest.t=t;this.stats.rotate++;this.snapshot('右旋：连续向左的路径缩短一层',t.id,'rotate');if(!t.l)break;}
   let next=t.l;this.set(t,'l',null);this.set(r,'l',t);r=t;t=next;this.forest.t=t;this.snapshot('当前根较大：接入 R，继续进入左子树',t.id,'link');
  }else if(c>0){if(!t.r)break;let cc=this.cmp(k,t.r,'检查右孩子，判断是否为 zig-zig');if(cc>0){let y=t.r;this.set(t,'r',y.l);this.set(y,'l',t);t=y;this.forest.t=t;this.stats.rotate++;this.snapshot('左旋：连续向右的路径缩短一层',t.id,'rotate');if(!t.r)break;}
   let next=t.r;this.set(t,'r',null);this.set(l,'r',t);l=t;t=next;this.forest.t=t;this.snapshot('当前根较小：接入 L，继续进入右子树',t.id,'link');
  }else break;}
  this.set(l,'r',t.l);this.set(r,'l',t.r);this.set(t,'l',head.r);this.set(t,'r',head.l);this.rootTo(t);this.forest=null;this.snapshot('重组：L ← 当前根 → R，保持中序有序',t.id,'assemble');
 }
 insert(k){this.begin('insert',k);if(!this.root){this.rootTo(this.node(k));this.snapshot(`空树：${k} 成为根`,k,'done');return;}
  if(this.kind==='Splay'){this.splay(k);let c=this.cmp(k,this.root,'决定新根如何连接');if(!c){this.snapshot('键已存在，不重复插入',k,'done');return;}let n=this.node(k);if(c<0){this.set(n,'l',this.root.l);this.set(n,'r',this.root);this.set(this.root,'l',null);}else{this.set(n,'r',this.root.r);this.set(n,'l',this.root);this.set(this.root,'r',null);}this.rootTo(n);this.snapshot(`${k} 成为新根，左右子树按键值连接`,k,'done');
  }else{let t=this.root;while(t){let c=this.cmp(k,t);if(!c){this.snapshot('键已存在，不重复插入',k,'done');return;}let side=c<0?'l':'r';if(!t[side]){this.set(t,side,this.node(k));this.snapshot(`把 ${k} 接到 ${t.k} 的${side==='l'?'左':'右'}侧，不维护平衡`,k,'done');break;}t=t[side];}}
 }
 delete(k){this.begin('delete',k);if(!this.root){this.snapshot('空树，无需删除',null,'done');return;}
  if(this.kind==='Splay'){this.splay(k);if(this.cmp(k,this.root,'检查伸展后的根')!==0){this.snapshot('键不存在；保留伸展后的结构',null,'done');return;}let removed=this.root,left=removed.l,right=removed.r;this.rootTo(left);this.join=right;this.snapshot(`移除根 ${k}，分离左右子树`,null,'remove');if(left){this.snapshot('在左子树中伸展原目标键：它大于左侧所有键，因此找到最大值');this.splay(k);this.set(this.root,'r',right);}else this.rootTo(right);this.join=null;this.snapshot(left?'连接完成：左侧最大值为根，接回右子树':'左子树为空：直接以右子树接替根',this.root?this.root.id:null,'done');
  }else{let t=this.root,p=null,side=null;while(t){let c=this.cmp(k,t);if(!c)break;p=t;side=c<0?'l':'r';t=t[side];}if(!t){this.snapshot('键不存在，结构不变',null,'done');return;}let replacement;if(t.l&&t.r){let sp=t,s=t.r;this.snapshot('两个孩子：寻找右子树的最小节点作为后继',s.id);while(s.l){sp=s;s=s.l;this.snapshot('沿左链接寻找后继（指针检查，不额外比较键值）',s.id);}if(sp!==t){this.set(sp,'l',s.r);this.set(s,'r',t.r);}this.set(s,'l',t.l);replacement=s;}else replacement=t.l||t.r;if(p)this.set(p,side,replacement);else this.rootTo(replacement);this.snapshot(`移除 ${k}，连接${replacement?'节点 '+replacement.k:'空指针'}`,replacement?replacement.id:null,'done');}
 }
}
function makeComparison(insertion,deletion=[]){let trees=[new TraceTree('BST'),new TraceTree('Splay')],timeline=[],boundaries=[],cost=[[],[]];trees.forEach(t=>t.snapshot('空树：准备插入',null,'start'));timeline.push({frames:trees.map(t=>t.frames.at(-1)),phase:'insert',key:null,opIndex:0,cost:JSON.parse(JSON.stringify(cost))});
 for(let phase of ['insert','delete']){let order=phase==='insert'?insertion:deletion;if(!order.length)continue;for(let key of order){let start=trees.map(t=>t.frames.length);trees.forEach(t=>{t.phase=phase;t[phase](key);});let events=trees.map((t,i)=>t.frames.slice(start[i]));boundaries.push({at:timeline.length,phase,key});let len=Math.max(...events.map(e=>e.length));for(let i=0;i<len;i++)timeline.push({frames:events.map(e=>e[Math.min(i,e.length-1)]),phase,key,opIndex:boundaries.length,cost:JSON.parse(JSON.stringify(cost))});trees.forEach((t,i)=>cost[i].push(t.stats.compare));timeline.at(-1).cost=JSON.parse(JSON.stringify(cost));}}
 return {timeline,boundaries,trees};
}
if(typeof module!=='undefined')module.exports={TraceTree,makeComparison};

