/* Detailed paired playback; each operation shares a clock, shorter side waits. */
const comparisonModes={
 insert:{title:'同样形成长链，插入成本却不同',insert:[1,2,3,4,5,6,7],remove:[],text:'先看树形：两者都成链。再看路径：BST 每次从旧根走到末端；Splay 的新最大值留在根，下一次插入从根附近完成。此序列不需要旋转。',theory:'升序插入：BST Θ(N²) · Splay Θ(N)',evidence:'N = 100000：报告两组有序实验均由 Splay 领先；此处单独解释插入阶段。'},
 asc:{title:'升序删除：BST 删除根，Splay 先走长路径',insert:[1,2,3,4,5,6,7],remove:[1,2,3,4,5,6,7],text:'先定位要删的最小值：BST 在根，直接让右孩子接替；Splay 的最小值在左链底部，首次删除要沿链伸展，再重组。后续路径随树形变化。',theory:'BST：插入 Θ(N²) + 删除 Θ(N)；Splay：完整序列一般上界 O(N log N)',evidence:'Scenario 1 · N = 100000 · BST 10999.209 ms / Splay 3.402 ms（总耗时）'},
 desc:{title:'降序删除：BST 走到链尾，Splay 移除根',insert:[1,2,3,4,5,6,7],remove:[7,6,5,4,3,2,1],text:'BST 每次都从根走到剩余链尾，路径长度逐次减少但总和仍为平方级。Splay 当前最大值就在根；移除后，左子树最大值接任根。',theory:'BST：插入 Θ(N²) + 删除 Θ(N²)；Splay：此插入与删除序列均为 Θ(N)',evidence:'Scenario 2 · N = 100000 · BST 21933.532 ms / Splay 3.894 ms（总耗时）'},
 random:{title:'随机操作：Splay 的调整也有成本',insert:[4,2,6,1,3,7,5],remove:[2,7,4,1,6,3,5],text:'固定乱序用于重复观察：BST 往往更分散，无平衡维护；Splay 每次插入、删除都围绕目标重组，局部性优势不再持续。观察左右旋、临时树和删除后的子树连接；单个小样本不能推出性能排名。',theory:'随机排列 BST 期望高度 O(log N)；Splay 一般均摊 O(log N)，不保证单次快',evidence:'Scenario 3 · N = 100000 · BST 22.791 ms / Splay 41.841 ms（总耗时）'}
};
function forestView(host){
 host.innerHTML='<svg class="forest" viewBox="0 0 690 245" role="img" aria-label="树节点、访问路径及临时树的逐步变化"></svg><div class="traceMetrics"></div><div class="traceMessage" aria-live="polite"></div>';
 const svg=host.querySelector('svg');
 const backdrops=el('g',{class:'forestBackdrops'}),connections=el('g',{class:'forestConnections'}),nodes=el('g',{class:'forestNodes'}),ghosts=el('g',{class:'forestGhosts'}),labels=el('g',{class:'forestLabels'});
 svg.append(backdrops,connections,nodes,ghosts,labels);
 return frame=>{
  const groups=frame.groups,positions=new Map(),edges=[],list=[],width=690/groups.length;
  backdrops.replaceChildren();labels.replaceChildren();
  groups.forEach((group,index)=>{
   const items=[];
   function scan(node,depth){if(!node)return;scan(node.l,depth+1);items.push({node,depth});scan(node.r,depth+1);}
   scan(group.root,0);
   if(groups.length>1)backdrops.append(el('rect',{x:index*width+3,y:31,width:width-6,height:207,rx:13,class:'forestGroup'}));
   const deepest=Math.max(1,...items.map(item=>item.depth)),gap=Math.min(30,168/deepest);
   items.forEach(({node,depth},i)=>{
    positions.set(node.id,{x:index*width+(i+1)*width/(items.length+1),y:50+depth*gap});list.push(node);
    for(const side of ['l','r'])if(node[side])edges.push([node.id,node[side].id]);
   });
   const label=el('text',{x:index*width+width/2,y:22,'text-anchor':'middle',class:'forestLabel'});
   label.textContent=group.label;labels.append(label);
   if(!items.length){const empty=el('text',{x:index*width+width/2,y:145,'text-anchor':'middle',class:'emptyTree'});empty.textContent='∅';labels.append(empty);}
  });
  const valid=new Set();
  for(const [a,b] of edges){
   const id=`edge${a}_${b}`;let line=connections.querySelector(`[data-trace="${id}"]`);
   if(!line){line=el('line',{'data-trace':id,class:'traceEdge traceEnter'});connections.append(line);}
   valid.add(id);const p=positions.get(a),q=positions.get(b);
   for(const [key,value] of Object.entries({x1:p.x,y1:p.y,x2:q.x,y2:q.y}))line.setAttribute(key,value);
   line.classList.toggle('pathEdge',frame.path.includes(a)&&frame.path.includes(b));
  }
  for(const node of list){
   const id=`node${node.id}`;let item=nodes.querySelector(`[data-trace="${id}"]`),isNew=!item;
   if(isNew){item=el('g',{'data-trace':id,class:'traceNode'});item.append(el('circle',{r:24,class:'nodeHalo'}),el('circle',{r:16,class:'nodeDisc'}),el('text'));item.lastChild.textContent=node.k;nodes.append(item);}
   valid.add(id);item.setAttribute('class',`traceNode ${isNew?'traceEnter':''} ${frame.path.includes(node.id)?'traceVisited':''} ${frame.hot===node.id?'traceHot':''}`);
   const p=positions.get(node.id);item.style.transform=`translate(${p.x}px,${p.y}px)`;
  }
  for(const item of [...connections.children,...nodes.children]){
   if(valid.has(item.dataset.trace))continue;
   if(item.parentNode===nodes&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const ghost=item.cloneNode(true);ghost.removeAttribute('data-trace');ghost.setAttribute('class','traceNode traceExit');ghosts.append(ghost);setTimeout(()=>ghost.remove(),380);}
   item.remove();
  }
  host.querySelector('.traceMetrics').innerHTML=`<span>键比较 <b>${frame.stats.compare}</b></span><span>旋转 <b>${frame.stats.rotate}</b></span><span>指针写入 <b>${frame.stats.write}</b></span>`;
  host.querySelector('.traceMessage').textContent=frame.message;
 };
}
function installComparison(slideId,initial,withModes){let section=$(slideId);const slideMeta=section.querySelector('.slideMeta')?.outerHTML||'',slideFooter=section.querySelector('.slideFooter')?.outerHTML||'';section.classList.add('detailed');section.innerHTML=`${slideMeta}<h2 class="traceTitle"></h2>${withModes?'<div class="traceTabs"><button data-case="asc">升序插入 → 升序删除</button><button data-case="desc">升序插入 → 降序删除</button><button data-case="random">随机插入 → 随机删除</button></div>':'<p class="traceIntro">逐次插入 1 → 2 → 3 → 4 → 5 → 6 → 7，比较两棵树如何积累成本。</p>'}<div class="operationStrip"></div><div class="traceStage"><span class="stageBadge"></span><span class="stageEvent"></span><strong class="stageMessage"></strong></div><div class="grid two"><div class="tracePanel bst"><h3>BST <small>直接修改连接</small></h3><div class="traceB"></div></div><div class="tracePanel splay"><h3>Splay Tree <small>自顶向下伸展</small></h3><div class="traceS"></div></div></div><div class="traceControls"><button data-play>播放</button><button data-back>上一步</button><button data-next>下一步</button><button data-op>下一操作</button><button data-reset>重播全流程</button>${withModes?'<button data-delete>从删除开始</button>':''}<select aria-label="动画速度"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select><span class="traceStep"></span></div><input class="traceRange" type="range" min="0" value="0" aria-label="算法步骤进度"><div class="traceExplanation"><div><p class="traceLesson"></p><b class="traceTheory"></b><p class="traceEvidence"></p></div><div class="traceCost"></div></div><details class="traceDefinitions"><summary>指标与实现说明</summary><p>比较：每次三路键比较器调用计 1；包括 Splay 对孩子的 zig-zig 判断。旋转单独计数。指针写入包含根、子指针与临时树链接，不是 C 指令数。曲线为已完成操作的累计键比较，不是毫秒。临时 L / T / R 都是实际执行状态。BST 双子节点删除使用后继节点移接，避免交换标签；与报告的后继键替换等价，但写入次数不相同。</p></details>${slideFooter}`;
 let draw=[forestView(section.querySelector('.traceB')),forestView(section.querySelector('.traceS'))],data,mode,at=0,timer=null;
 const stop=()=>{clearTimeout(timer);timer=null;section.querySelector('[data-play]').textContent='播放';};
 function render(){let state=data.timeline[at];state.frames.forEach((f,i)=>draw[i](f));section.querySelector('.traceStep').textContent=`${at+1} / ${data.timeline.length}`;section.querySelector('.traceRange').value=at;const focus=state.frames.find(f=>f.event==='rotate')||state.frames.find(f=>f.event==='compare')||state.frames.find(f=>f.event!=='done')||state.frames[1];section.querySelector('.stageBadge').textContent=state.phase==='insert'?'插入':'删除';section.querySelector('.stageEvent').textContent=({start:'准备',compare:'比较',rotate:'旋转',link:'连接',assemble:'重组',remove:'移除',done:'完成'})[focus.event]||'调整';section.querySelector('.stageMessage').textContent=focus.message;section.querySelector('.traceStage').dataset.event=focus.event;section.querySelector('.traceRange').style.setProperty('--range-pct',`${at/(data.timeline.length-1)*100}%`);const phaseIndex=state.phase==='insert'?state.opIndex:state.opIndex-mode.insert.length;section.querySelector('.operationStrip').innerHTML=`<b>${state.phase==='insert'?'插入阶段':'删除阶段'} ${state.key??''}</b><span>${(state.phase==='insert'?mode.insert:mode.remove).map((k,i)=>`<i class="${k===state.key?'currentKey':i<phaseIndex-1?'pastKey':''}">${k}</i>`).join('')}</span><small>${state.frames.some(f=>f.event==='rotate')?'正在旋转：节点身份不变':state.frames.some(f=>f.groups.length>1)?'拆分为临时树，随后保持中序顺序重组':'两侧按同一操作同步；先完成的一侧等待'}</small>`;
 let costs=state.cost,max=Math.max(1,...data.timeline.at(-1).cost.flat()),n=Math.max(1,mode.insert.length+mode.remove.length);section.querySelector('.traceCost').innerHTML=`<small>累计键比较 · ${state.opIndex} / ${n} 次操作</small><svg viewBox="0 0 250 78" role="img" aria-label="两种树的累计键比较曲线"><path d="M15 4V65H242" stroke="#c8c8ce" fill="none"/><path d="M15 35H242" stroke="#e8e8ed" stroke-dasharray="3 4"/>${costs.map((values,i)=>`<polyline class="costLine" fill="none" stroke="${i?'#168e82':'#c95652'}" stroke-width="3" points="15,65 ${values.map((v,j)=>`${15+(j+1)*225/n},${65-v/max*55}`).join(' ')}"/>${values.length?`<circle class="costDot" cx="${15+values.length*225/n}" cy="${65-values.at(-1)/max*55}" r="4" fill="${i?'#168e82':'#c95652'}"/>`:''}`).join('')}</svg><small><span style="color:#c95652">BST ${costs[0].at(-1)??0}</span>　/　<span style="color:#168e82">Splay ${costs[1].at(-1)??0}</span></small>`;
 }
 function advance(){if(at<data.timeline.length-1){at++;render();}else stop();}
 function tick(){advance();if(at<data.timeline.length-1)timer=setTimeout(tick,1250/+section.querySelector('select').value);else stop();}
 function play(){if(timer){stop();return;}if(at===data.timeline.length-1)at=0;section.querySelector('[data-play]').textContent='暂停';timer=setTimeout(tick,100);}
 function reset(){stop();at=0;render();}
 function load(key){stop();mode=comparisonModes[key];data=makeComparison(mode.insert,mode.remove);at=0;section.querySelector('.traceTitle').textContent=mode.title;section.querySelector('.traceLesson').textContent=mode.text;section.querySelector('.traceTheory').textContent=mode.theory;section.querySelector('.traceEvidence').textContent=mode.evidence;section.querySelector('.traceRange').max=data.timeline.length-1;section.querySelectorAll('[data-case]').forEach(b=>b.classList.toggle('selected',b.dataset.case===key));render();}
 section.onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.case){load(b.dataset.case);return;}if(b.hasAttribute('data-play')){play();return;}stop();if(b.hasAttribute('data-next'))at=Math.min(at+1,data.timeline.length-1);if(b.hasAttribute('data-back'))at=Math.max(0,at-1);if(b.hasAttribute('data-reset'))at=0;if(b.hasAttribute('data-op'))at=data.boundaries.find(o=>o.at>at)?.at??data.timeline.length-1;if(b.hasAttribute('data-delete'))at=data.boundaries.find(o=>o.phase==='delete')?.at??0;render();};section.querySelector('.traceRange').oninput=e=>{stop();at=+e.target.value;render();};load(initial);let controller={play,stop,reset};players.push(controller);return controller;
}
p8.stop();p9.stop();p8=installComparison('#slide8','insert',false);p9=installComparison('#slide9','asc',true);
