/* One timeline drives the five-tree comparison and analysis views. */
(function(){
 const labels=['BST','AVL','Splay','Red-Black','B+ Tree'];
 const mechanisms=['更新后不主动平衡','旋转以维持高度差','将访问区域移向根','旋转与变色限制高度','用多个分支缩短路径'];
 const palette=['#c95652','#347ed1','#168e82','#8b6da9','#b58c36'];
 const keys=['ascending','descending','random'];
 const cache=new Map();
 let mode='ascending',at=0,compare=2,speed=1,timer=null;
 const get=()=>{if(!cache.has(mode))cache.set(mode,makeExperiment(mode));return cache.get(mode);};
 const current=()=>get().states[at];
 const tabs=()=>`<div class="labTabs" role="group" aria-label="选择实验序列">${keys.map((key,i)=>`<button data-lab-mode="${key}">${DEMO_SCENARIOS[key].label}</button>`).join('')}</div>`;
 const controls=()=>`<div class="labControls"><button data-lab-action="back" aria-label="上一步">← 上一步</button><button data-lab-action="play" class="labPlay">播放</button><button data-lab-action="next">下一步 →</button><button data-lab-action="operation">下一操作</button><button data-lab-action="insertEnd">看插入完成</button><button data-lab-action="reset">重播</button><label>速度 <select class="labSpeed" aria-label="播放速度"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><span class="labCounter"></span></div><input class="labRange" type="range" min="0" max="36" value="0" aria-label="实验动画进度">`;
 document.querySelector('#labTrees').innerHTML=`${tabs()}<div class="labStage" id="labStage7"></div><div class="labFive">${labels.map((name,i)=>`<article class="labTreeCard" data-tree="${i}" style="--tree-color:${palette[i]}"><header><span class="labTreeIndex">0${i+1}</span><div><h3>${name}</h3><small>${mechanisms[i]}</small></div></header><svg class="labSvg" viewBox="0 0 260 230" role="img" aria-label="${name} 当前结构"></svg><div class="labTreeMeta"><span>层数 <b class="labHeight">0</b></span><span class="labMetricExtra"></span></div><p class="labAction"></p></article>`).join('')}</div><p class="labCaveat">上方只演示 N = 9 的结构变化；B+ 节点容量设为 4 以显出分裂与合并。报告计时使用 N = 1000–100000、B+ 容量 32。</p>${controls()}`;
 document.querySelector('#labInsight').innerHTML=`${tabs()}<div class="labStage" id="labStage8"></div><div class="labComparePick"><span>与 BST 对照</span>${[1,2,3,4].map(i=>`<button data-compare="${i}">${labels[i]}</button>`).join('')}</div><div class="labDuel"><article class="labDuelCard" data-duel="0" style="--tree-color:${palette[0]}"><header><h3>BST</h3><span class="labDuelHeight"></span></header><svg class="labSvg labLargeSvg" viewBox="0 0 550 230" role="img" aria-label="BST 放大结构"></svg><p class="labDuelAction"></p></article><article class="labDuelCard" data-duel="1" style="--tree-color:${palette[2]}"><header><h3 class="labDuelName">Splay</h3><span class="labDuelHeight"></span></header><svg class="labSvg labLargeSvg" viewBox="0 0 550 230" role="img" aria-label="选定树的放大结构"></svg><p class="labDuelAction"></p></article></div><div class="labBottom"><div class="labExplanation"><strong>这一组序列说明什么？</strong><p id="labReason"></p><small>结构动画是教学示例，不是运行时间测量。</small></div><div class="labEvidence"><strong>报告实测 · N = 100000 · 插入 + 删除 / ms</strong><div id="labTimeRows"></div><small>条长按对数比例绘制，右侧显示准确的毫秒数。</small></div></div>${controls()}`;
 function stageText(state){
  if(state.phase==='setup')return ['空树 · 准备开始','五种树使用同一组 9 个不同整数；可以切换插入和删除顺序。'];
  const verb=state.phase==='insert'?'插入':'删除';
  return state.step==='search'?[`定位键 ${state.key} · ${verb}前`,`先沿当前树的搜索路径定位；下一帧才更新结构。`]:[`${verb} ${state.key} 完成`,`五棵树完成同一操作，观察形状与维护动作的差异。`];
 }
 function updateStage(id,state){const [title,sub]=stageText(state);document.querySelector(id).innerHTML=`<span class="labPhase ${state.phase}">${state.phase==='setup'?'准备':state.phase==='insert'?'INSERT':'DELETE'}</span><strong>${title}</strong><small>${sub}</small>`;}
 function inorder(root,out=[]){if(!root)return out;inorder(root.l,out);out.push(root.k);inorder(root.r,out);return out;}
 const svgNS='http://www.w3.org/2000/svg';
 const svgEl=(tag,attributes={})=>{const node=document.createElementNS(svgNS,tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);return node;};
 function ensureLayers(svg,kind){if(svg.dataset.kind!==kind){svg.replaceChildren();svg.dataset.kind=kind;svg.append(svgEl('g',{class:'labEdges'}),svgEl('g',{class:'labNodes'}));}return[svg.children[0],svg.children[1]];}
 function syncSvg(svg,items,edges,kind){
  const [edgeLayer,nodeLayer]=ensureLayers(svg,kind),validNodes=new Set(),validEdges=new Set();
  for(const edge of edges){const id=`${edge.a}_${edge.b}_${edge.type||'tree'}`;validEdges.add(id);let line=edgeLayer.querySelector(`[data-edge="${id}"]`);
   if(!line){line=svgEl('line',{'data-edge':id});edgeLayer.append(line);}
   for(const [attr,value] of Object.entries({x1:edge.x1,y1:edge.y1,x2:edge.x2,y2:edge.y2}))line.setAttribute(attr,value);
   line.setAttribute('class',edge.type==='leaf'?'labLeafLink':edge.visited?'labVisitedEdge':'');
  }
  for(const item of items){const id=String(item.id);validNodes.add(id);let group=nodeLayer.querySelector(`[data-node="${id}"]`),fresh=!group;
   if(!group){group=svgEl('g',{'data-node':id});if(kind==='binary')group.append(svgEl('circle',{r:item.radius}),svgEl('text'));else group.append(svgEl('rect',{x:0,y:-15,rx:6,ry:6,height:30}));nodeLayer.append(group);}
   group.setAttribute('class',`labNode ${fresh?'labNew':''} ${item.visited?'labVisited':''} ${item.current?'labCurrent':''} ${item.red?'labRed':''} ${item.black?'labBlack':''} ${item.leaf?'labLeaf':''}`);
   group.style.transform=`translate(${item.x}px,${item.y}px)`;
   if(kind==='binary'){group.firstChild.setAttribute('r',item.radius);group.lastChild.textContent=item.label;}
   else{
    const width=item.width,slot=item.slotWidth,left=-width/2;
    group.setAttribute('data-keys',item.keys.join(','));
    group.firstChild.setAttribute('x',left);group.firstChild.setAttribute('y',-15);group.firstChild.setAttribute('width',width);
    for(const child of [...group.children].slice(1))child.remove();
    item.keys.forEach((key,index)=>{
     if(index)group.append(svgEl('line',{class:'labCellDivider',x1:left+item.padding+index*slot,y1:-10,x2:left+item.padding+index*slot,y2:10}));
     const label=svgEl('text',{x:left+item.padding+(index+.5)*slot,y:1,'text-anchor':'middle','dominant-baseline':'central'});
     label.textContent=key;group.append(label);
    });
   }
  }
  [...edgeLayer.children].forEach(node=>{if(!validEdges.has(node.dataset.edge))node.remove();});
  [...nodeLayer.children].forEach(node=>{if(!validNodes.has(node.dataset.node))node.remove();});
 }
 function renderBinary(svg,view,path,key,search){
  const big=svg.classList.contains('labLargeSvg'),width=big?550:260,height=230,radius=big?15:11,margin=big?30:21;
  const nodes=[];function walk(n,depth){if(!n)return;walk(n.l,depth+1);nodes.push({n,depth});walk(n.r,depth+1);}walk(view.root,0);
  const maxDepth=Math.max(1,...nodes.map(x=>x.depth)),gap=Math.min(big?36:28,(height-55)/maxDepth),positions=new Map();
  nodes.forEach(({n,depth},index)=>positions.set(n.k,{x:margin+(index+1)*(width-2*margin)/(nodes.length+1),y:29+depth*gap}));
  const redBlack=Number.isInteger(view.colorFlips);
  const items=nodes.map(({n})=>({id:n.k,label:n.k,x:positions.get(n.k).x,y:positions.get(n.k).y,radius,visited:search&&path.includes(n.k),current:search&&path.at(-1)===n.k||!search&&n.k===key,red:redBlack&&!!n.red,black:redBlack&&!n.red}));
  const edges=[];for(const {n} of nodes)for(const child of [n.l,n.r])if(child){const a=positions.get(n.k),b=positions.get(child.k);edges.push({a:n.k,b:child.k,...{x1:a.x,y1:a.y,x2:b.x,y2:b.y},visited:search&&path.includes(n.k)&&path.includes(child.k)});}
  syncSvg(svg,items,edges,'binary');
 }
 function renderBPlus(svg,view,path,key,search){
  const big=svg.classList.contains('labLargeSvg'),width=big?550:260,height=230,root=view.root;
  if(!root){syncSvg(svg,[],[],'bplus');return;}
  const leaves=[];function collect(n){if(n.leaf)leaves.push(n);else n.children.forEach(collect);}collect(root);
  const positions=new Map(),levels=view.height,gap=levels>1?Math.min(big?80:72,(height-65)/(levels-1)):0;
  const slotWidth=big?29:21,padding=big?8:6,nodeWidth=n=>Math.max(slotWidth,slotWidth*n.keys.length+2*padding);
  const desiredGap=big?20:10,totalWidth=leaves.reduce((sum,n)=>sum+nodeWidth(n),0)+desiredGap*(leaves.length-1);
  const scale=Math.min(1,(width-12)/totalWidth),leafGap=desiredGap*scale;
  let cursor=(width-totalWidth*scale)/2;
  leaves.forEach(n=>{const w=nodeWidth(n)*scale;positions.set(n.id,{x:cursor+w/2,y:levels===1?height/2:35+(levels-1)*gap});cursor+=w+leafGap;});
  function position(n,depth){if(n.leaf)return positions.get(n.id);const children=n.children.map(child=>position(child,depth+1));const pos={x:children.reduce((sum,p)=>sum+p.x,0)/children.length,y:35+depth*gap};positions.set(n.id,pos);return pos;}position(root,0);
  const items=[],edges=[];function visit(n){const p=positions.get(n.id);items.push({id:n.id,keys:n.keys,x:p.x,y:p.y,width:nodeWidth(n)*scale,slotWidth:slotWidth*scale,padding:padding*scale,leaf:n.leaf,visited:search&&path.includes(n.id),current:search&&path.at(-1)===n.id||!search&&n.leaf&&n.keys.includes(key)});if(!n.leaf)for(const child of n.children){const q=positions.get(child.id);edges.push({a:n.id,b:child.id,x1:p.x,y1:p.y+16,x2:q.x,y2:q.y-16,visited:search&&path.includes(n.id)&&path.includes(child.id)});visit(child);}}visit(root);
  if(leaves.length>1)for(let i=0;i<leaves.length-1;i++){const a=positions.get(leaves[i].id),b=positions.get(leaves[i+1].id);edges.push({a:leaves[i].id,b:leaves[i+1].id,x1:a.x+nodeWidth(leaves[i])*scale/2,y1:a.y+24,x2:b.x-nodeWidth(leaves[i+1])*scale/2,y2:b.y+24,type:'leaf'});}
  syncSvg(svg,items,edges,'bplus');
 }
 function draw(svg,view,path,key,search){view.kind==='binary'?renderBinary(svg,view,path,key,search):renderBPlus(svg,view,path,key,search);}
 function renderMiniatures(){
  const models=[new BSTModel(),new AVLModel(),new SplayModel(),new RBModel(),new BPlusModel()];
  for(const key of [4,2,6,1,3,5,7])models.forEach(model=>model.insert(key));
  models.forEach((model,i)=>{
   const host=document.querySelector(`#mini${i}`),svg=svgEl('svg',{class:'labSvg mini',viewBox:'0 0 260 230',role:'img','aria-label':`${labels[i]} 的七键示意结构`});
   host.replaceChildren(svg);host.style.setProperty('--tree-color',palette[i]);draw(svg,model.snapshot(),[],null,false);
  });
 }
 function actionText(view,state){if(state.phase==='setup')return '空树，等待第一步';if(state.step==='search')return `沿路径定位键 ${state.key}`;return view.events.join('；');}
 function renderTrees(state){
  updateStage('#labStage7',state);
  document.querySelectorAll('.labTreeCard').forEach((card,i)=>{const view=state.views[i];draw(card.querySelector('svg'),view,state.paths[i],state.key,state.step==='search');card.querySelector('.labHeight').textContent=view.height;
   const extra=i===1||i===2||i===3?`累计旋转 ${view.rotations}`:i===4?`分裂 ${view.splits} · 合并 ${view.merges}`:`记录 ${inorder(view.root).length}`;
   card.querySelector('.labMetricExtra').textContent=extra;card.querySelector('.labAction').textContent=actionText(view,state);
  });
 }
 const reasons={
  ascending:'BST 升序插入的路径长度为 0、1、…、N−1，相加是 N(N−1)/2，因此仅插入就有 O(N²) 成本。升序删除则每次移除根，共 O(N)。Splay 每次把新最大值放在根；删除最小值时会伸展并重组，不能用第一次的长路径代表整段成本。',
  descending:'BST 插入时逐渐形成右链，路径成本累加到 O(N²)；降序删除又从根反复走到链尾，路径同样累加到平方级。这里的 Splay 升序插入后是以最大值为根的左链，降序删除每次移除根，下一个最大值直接接替，所以这组完整序列只需线性数量的结构操作。',
  random:'随机顺序通常让 BST 不再是一条长链，搜索路径变短，而它无需额外维护平衡。Splay 仍会伸展，但下一次目标未必因此靠近根；其他树也要承担旋转、变色或分裂成本。这解释了排名可能改变，小规模动画本身不能证明哪种树一定最快。'
 };
 function renderInsight(state){
  updateStage('#labStage8',state);
  document.querySelectorAll('[data-compare]').forEach(button=>button.classList.toggle('selected',+button.dataset.compare===compare));
  const cards=document.querySelectorAll('.labDuelCard');
  [0,compare].forEach((i,position)=>{const card=cards[position],view=state.views[i];card.style.setProperty('--tree-color',palette[i]);card.querySelector('h3').textContent=labels[i];card.querySelector('.labDuelHeight').textContent=`层数 ${view.height}`;draw(card.querySelector('svg'),view,state.paths[i],state.key,state.step==='search');card.querySelector('.labDuelAction').textContent=actionText(view,state);});
  document.querySelector('#labReason').textContent=reasons[mode];
  const values=datasets[keys.indexOf(mode)].map(row=>row[6]),max=Math.max(...values);
  document.querySelector('#labTimeRows').innerHTML=values.map((value,i)=>`<div class="labTimeRow"><span style="color:${palette[i]}">${labels[i]}</span><div class="labTimeTrack"><i style="background:${palette[i]};width:${12+88*Math.log10(value+1)/Math.log10(max+1)}%"></i></div><b>${value.toFixed(3)}</b></div>`).join('');
 }
 function renderControls(){const length=get().states.length;document.querySelectorAll('.labTabs [data-lab-mode]').forEach(button=>{const active=button.dataset.labMode===mode;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('.labControls').forEach(box=>{box.querySelector('[data-lab-action="play"]').textContent=timer?'暂停':'播放';box.querySelector('.labCounter').textContent=`${String(at+1).padStart(2,'0')} / ${length}`;box.querySelector('.labSpeed').value=String(speed);});
  document.querySelectorAll('.labRange').forEach(range=>{range.max=length-1;range.value=at;range.style.setProperty('--pct',`${at/(length-1)*100}%`);});
 }
 function render(){const state=current();renderTrees(state);renderInsight(state);renderControls();}
 function stop(){if(timer){clearTimeout(timer);timer=null;}renderControls();}
 function setAt(value){stop();at=Math.max(0,Math.min(get().states.length-1,value));render();}
 function tick(){if(at<get().states.length-1){at++;render();timer=setTimeout(tick,1050/speed);}else stop();}
 function toggle(){if(timer){stop();return;}if(at===get().states.length-1)at=0;timer=setTimeout(tick,130);renderControls();}
 document.addEventListener('click',event=>{const modeButton=event.target.closest('[data-lab-mode]');if(modeButton){stop();mode=modeButton.dataset.labMode;at=0;render();return;}
  const compareButton=event.target.closest('[data-compare]');if(compareButton){compare=+compareButton.dataset.compare;render();return;}
  const action=event.target.closest('[data-lab-action]')?.dataset.labAction;if(!action)return;
  if(action==='play'){toggle();return;}if(action==='back')setAt(at-1);if(action==='next')setAt(at+1);if(action==='reset')setAt(0);if(action==='insertEnd')setAt(18);if(action==='operation'){let next=at+1;while(next<get().states.length-1&&get().states[next].step!=='result')next++;setAt(next);}
 });
 document.addEventListener('input',event=>{if(event.target.matches('.labRange'))setAt(+event.target.value);});
 document.addEventListener('change',event=>{if(event.target.matches('.labSpeed')){speed=+event.target.value;stop();renderControls();}});
 window.experimentLab={render,stop,toggle};
 renderMiniatures();
 render();
})();
