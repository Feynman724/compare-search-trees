const $=s=>document.querySelector(s);
const heading=title=>`<h2>${title}</h2>`;
const card=(title,body)=>`<div class="card"><h3>${title}</h3>${body}</div>`;
const costCell=(cost,reason)=>`<td><strong>${cost}</strong><span>${reason}</span></td>`;
const complexityRows=[
 {order:'升序插入<br>升序删除',trees:[
  ['BST',['Θ(N²)','右链逐渐变长，路径长度累加。'],['Θ(N)','每次删除根，单次成本为常数。'],['Θ(N²)','平方级插入主导总成本。']],
  ['Splay',['Θ(N)','每个新最大值直接成为根。'],['Θ(N)','首次虽慢，顺序伸展的总成本线性。'],['Θ(N)','插入与删除的总成本都线性。']]
 ]},
 {order:'升序插入<br>降序删除',trees:[
  ['BST',['Θ(N²)','同样形成右链，插入路径累加。'],['Θ(N²)','反复走到链尾，路径再次累加。'],['Θ(N²)','两段都是平方级成本。']],
  ['Splay',['Θ(N)','新最大值成为根，单次成本为常数。'],['Θ(N)','每次删除根，下个最大值接替。'],['Θ(N)','两段各做 N 次常数成本操作。']]
 ]},
 {order:'随机插入<br>随机删除',trees:[
  ['BST',['期望 Θ(N log N)','随机树的期望路径长度为对数级。'],['期望 O(N log N)','删除不增加高度，沿对数级路径查找。'],['期望 Θ(N log N)','插入成本与删除上界共同确定。']],
  ['Splay',['O(N log N)','单次均摊 O(log N)，插入 N 次。'],['O(N log N)','单次均摊 O(log N)，删除 N 次。'],['O(N log N)','两段相加仍是这一上界。']]
 ]}
];
const complexityTable=()=>`<table class="complexityTable" aria-label="三种操作顺序下 BST 与 Splay 的复杂度及原因"><colgroup><col style="width:15%"><col style="width:8%"><col style="width:26%"><col style="width:28%"><col style="width:23%"></colgroup><thead><tr><th scope="col">操作顺序</th><th scope="col">树</th><th scope="col">N 次插入</th><th scope="col">N 次删除</th><th scope="col">整轮总成本</th></tr></thead>${complexityRows.map(group=>`<tbody>${group.trees.map(([name,...costs],i)=>`<tr>${i===0?`<th scope="rowgroup" rowspan="2" class="orderCell">${group.order}</th>`:''}<th scope="row" class="${name==='BST'?'bstLabel':'splayLabel'}">${name}</th>${costs.map(([cost,reason])=>costCell(cost,reason)).join('')}</tr>`).join('')}</tbody>`).join('')}</table>`;
const slides=[
`<h1>Compare<br><span class="blue">Search Trees.</span></h1><p class="intro">把同一组整数交给五种搜索树，插入一次，再全部删除。我们只改变操作顺序，看看它们为什么会花费截然不同的时间。</p><div class="grid three">${[
['先从小到大插入，再从小到大删除','插入：1 → 2 → 3 → 4 → 5<br>删除：1 → 2 → 3 → 4 → 5'],
['先从小到大插入，再从大到小删除','插入：1 → 2 → 3 → 4 → 5<br>删除：5 → 4 → 3 → 2 → 1'],
['打乱插入顺序，再独立打乱删除顺序','插入：3 → 1 → 5 → 2 → 4<br>删除：2 → 5 → 1 → 4 → 3']
].map(([title,sequence])=>card(title,`<p>${sequence}</p>`)).join('')}</div><p class="statement">每种树都做 N 次插入和 N 次删除，<br><span class="blue">为什么耗时仍会相差数千倍？</span></p>`,
heading('五种树，五种调整方式')+`<div class="grid five">${names.map((name,i)=>card(name,`<div id="mini${i}"></div><p>${[
'按大小决定向左还是向右。插入和删除后不主动平衡，所以有序输入可能把它拉成一条长链。',
'每次更新后检查左右子树的高度差，必要时旋转，让两边的高度差不超过 1。',
'在访问过程中旋转，把访问到的节点移向根。后续操作能否受益，取决于访问顺序。',
'用颜色规则约束树的高度。更新后通过旋转和变色修复规则，避免树变成过长的链。',
'一个节点可以指向多个子节点，记录放在叶节点。节点太满就分裂，太空就借位或合并。'
][i]}</p>`)).join('')}</div><p class="statement">调整结构也要花时间。只有它节省的搜索成本足够多，这份维护成本才划算。</p>`,
heading('怎样让比较有意义？')+`<div class="grid two">${card('五种树收到完全相同的输入','<ol class="experimentSteps"><li><b>准备同一组键</b><span>使用 0 到 N−1；每次试验五种树共用同一排列。</span></li><li><b>先插入，再删除</b><span>从空树开始，最后回到空树；分别记录两段时间。</span></li><li><b>重复三次</b><span>将插入与删除时间相加，取三次总时间的中位数。</span></li></ol>')}${card('改变规模与顺序，保持实现环境一致','<dl class="experimentConfig"><div><dt>输入规模</dt><dd>1k、2k、5k、10k、20k、50k、100k</dd></div><div><dt>实现与编译</dt><dd>使用 C 实现，GCC 13.3.0 以 -O2 编译。</dd></div><div><dt>运行环境</dt><dd>WSL2 / Linux，Ryzen 7 H 255；未绑定 CPU。</dd></div><div><dt>计时方式</dt><dd>使用 CLOCK_MONOTONIC，单进程顺序运行；B+ 节点容量为 32。</dd></div></dl>')}</div><p class="bodyCopy">原报告记载：边界操作、抽样查询和完整删除周期检查通过，ASan / UBSan 未报告问题。它们提高了结果的可信度，但抽样检查不能代替完整的结构验证。</p>`,
heading('先看过程：同一操作如何改变五棵树？')+`<div id="labTrees"></div>`,
heading('理论上，一次操作要走多远？')+`<table><tr><th>结构</th><th>如何控制搜索路径</th><th>单次最坏成本</th><th>完整插入、删除序列的上界</th></tr>${names.map((name,i)=>`<tr><td>${name}</td><td>${['不主动平衡，可能形成长链','通过旋转维持左右高度差','访问时伸展，把节点移向根','通过旋转和变色限制高度','通过分裂、借位和合并维持多路结构'][i]}</td><td>${i===0||i===2?'O(N)':'O(log N)'}</td><td>${i===0?'O(N²)':'O(N log N)'}</td></tr>`).join('')}</table><p class="bodyCopy">Splay 的某一次操作可能很慢，但把一长串操作的成本合起来平均，均摊成本是 O(log N)。B+ 这里按固定节点容量讨论。</p><p class="statement">这些上界帮助我们判断增长趋势，<br><span class="blue">却不能直接预测哪一种实现耗时最少。</span></p>`,
heading('有序输入，让耗时差距迅速扩大')+`<p class="chartContext">横轴是键的数量 N，纵轴是插入加删除的总时间（毫秒）。两个轴都采用对数刻度；每个点是三次运行的中位数。</p><div class="legend" id="legend5"></div><div class="grid two orderedCharts"><div><h3>从小到大插入，再从小到大删除</h3><div id="chart0"></div></div><div><h3>从小到大插入，再从大到小删除</h3><div id="chart1"></div></div></div><div class="grid two orderedStats"><div><span class="big blue">3,233×</span><p>十万个键时，BST 用时约 11 秒，<br>Splay 用时约 3.4 毫秒。</p></div><div><span class="big blue">5,633×</span><p>十万个键时，BST 用时约 21.9 秒，<br>Splay 用时约 3.9 毫秒。</p></div></div><p class="resultTakeaway">两组实验都从升序插入开始。随着规模增大，BST 的耗时增长明显更快；Splay 在这两组有序序列中表现突出。</p>`,
heading('换成随机顺序，排名就变了')+`<p class="chartContext">插入和删除分别独立洗牌。左图仍用双对数坐标展示增长趋势，右图比较十万个键时的总时间，单位均为毫秒。</p><div class="legend" id="legend6"></div><div class="grid two"><div id="chart2"></div><div class="bars">${[4,0,1,2,3].map(i=>`<div><span>${names[i]}</span><span class="bar" style="width:${datasets[2][i][6]*5}px;background:${colors[i]}"></span><b>${datasets[2][i][6].toFixed(3)}</b></div>`).join('')}<p>这次测量中，B+ 用时 22.443 毫秒，BST 用时 22.791 毫秒，两者只相差约 1.55%。</p></div></div><p class="statement">随机输入让 BST 更有竞争力，<br><span class="blue">也说明 Splay 的优势取决于操作顺序。</span></p><p class="bodyCopy">这里只测了三次，不能据此断言随机场景下 B+ 总是最快。接下来回到结构，解释有序输入为什么会拉开差距。</p>`,
heading('有序操作，为什么拉开差距？')+`<p class="intro">随机插入和删除时，五种树的耗时处于同一数量级。<br>但在有序操作中，BST 的耗时格外高，Splay 的耗时格外低。</p><div class="grid two questionGrid">${card('为什么有序操作让 BST 这么慢？','')}${card('为什么 Splay 在有序操作中这么快？','')}</div>`,
heading('用结构解释：BST 为什么慢，Splay 如何获利？')+`<div id="labInsight"></div>`,
heading('三种操作顺序，成本怎样累积？')+complexityTable()+`<p class="complexityNote">均为整段成本：Θ 表示紧确阶，O 表示上界。BST 的期望值依赖均匀随机输入；Splay 使用均摊分析。</p><p class="complexityTakeaway">有序时，BST 的长路径反复累积，Splay 利用操作顺序获利；随机时，两者都落在 N log N 尺度，排名仍受常数成本影响。</p>`,
heading('选树之前，先看实际操作顺序')+`<div class="grid three">${card('输入顺序改变搜索路径','<p>有序输入会把普通 BST 拉成长链；随机输入通常让它更分散。同样数量的操作，可能走过完全不同长度的路径。</p>')}${card('调整能为后续操作节省成本','<p>AVL 和红黑树限制最坏高度；Splay 把访问区域移向根，在某些有序序列中减少后续访问的成本。</p>')}${card('维护成本也会影响实际排名','<p>旋转、变色和分裂都要花时间。哪种树更快，还取决于具体实现、内存访问和工作负载。</p>')}</div><p class="bodyCopy">这次实验只测了插入与删除，每个配置重复三次。它没有覆盖查询、混合操作，也没有测量 B+ 树的磁盘 I/O，因此结论只适用于这里的实现与测试条件。</p><p class="statement">复杂度帮助判断增长趋势，实验帮助比较具体实现。<br><span class="blue">先了解负载，再结合理论与测量选择结构。</span></p>`
];
const chapters=['问题','结构','方法','操作过程','理论','有序结果','随机结果','两个问题','动画解释','复杂度对照','结论'];
$('#deck').innerHTML=slides.map((content,i)=>`<section id="slide${i+1}" data-screen-label="${String(i+1).padStart(2,'0')} ${chapters[i]}" aria-label="第 ${i+1} 页：${chapters[i]}"><div class="slideMeta"><span>${String(i+1).padStart(2,'0')} / ${slides.length} · ${chapters[i]}</span></div>${content}</section>`).join('');
const hidden=new Set;function chart(id,index){let rows=datasets[index],out='<svg class="chart" viewBox="0 0 650 330" role="img" aria-label="输入规模 N 与插入删除总时间（毫秒）的双对数性能图">';let x=n=>65+(Math.log10(n)-3)*270,y=v=>280-(Math.log10(v)+2)*38;[-2,-1,0,1,2,3,4,5].forEach(v=>{let yy=y(10**v);out+=`<line x1="65" y1="${yy}" x2="605" y2="${yy}" stroke="#dde3e8"/><text x="56" y="${yy+5}" text-anchor="end">${10**v}</text>`;});[1000,10000,100000].forEach(n=>out+=`<text x="${x(n)}" y="307" text-anchor="middle">${n/1000}k</text>`);rows.forEach((r,i)=>{if(hidden.has(i))return;out+=`<polyline class="curve" fill="none" stroke="${colors[i]}" stroke-width="3" points="${r.map((v,j)=>`${x(sizes[j])},${y(v)}`).join(' ')}"/>`;r.forEach((v,j)=>out+=`<circle cx="${x(sizes[j])}" cy="${y(v)}" r="5" fill="${colors[i]}"><title>${names[i]} · N=${sizes[j]} · ${v.toFixed(3)} ms</title></circle>`);});$(id).innerHTML=out+'</svg>';}
function charts(){[0,1,2].forEach(i=>chart('#chart'+i,i));}['#legend5','#legend6'].forEach(id=>{$(id).innerHTML=names.map((n,i)=>`<button style="color:${colors[i]}" data-series="${i}" aria-pressed="true">● ${n}</button>`).join('');$(id).onclick=e=>{let b=e.target.closest('button');if(!b)return;let i=+b.dataset.series;hidden.has(i)?hidden.delete(i):hidden.add(i);document.querySelectorAll(`[data-series="${i}"]`).forEach(b=>{b.style.opacity=hidden.has(i)?.35:1;b.setAttribute('aria-pressed',!hidden.has(i));});charts();};});charts();
let page=0;function go(n){window.experimentLab?.stop();page=Math.max(0,Math.min(slides.length-1,n));document.querySelectorAll('section').forEach((s,i)=>s.classList.toggle('active',i===page));$('#progress').style.width=(page+1)/slides.length*100+'%';$('#pageLabel').textContent=`${String(page+1).padStart(2,'0')} / ${slides.length}`;window.experimentLab?.render();if(document.querySelector('section.active .chart'))charts();}function resize(){let s=Math.min(innerWidth/1600,innerHeight/900),d=$('#deck');d.style.transform=`scale(${s})`;d.style.left=(innerWidth-1600*s)/2+'px';d.style.top=(innerHeight-900*s)/2+'px';}$('#prev').onclick=()=>go(page-1);$('#next').onclick=()=>go(page+1);function full(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.();}$('#full').onclick=full;document.onkeydown=e=>{if(e.target.matches('select,input'))return;if(e.key==='ArrowRight'){e.preventDefault();go(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1);}if(e.key.toLowerCase()==='f')full();if(e.code==='Space'&&document.querySelector('section.active #labTrees, section.active #labInsight')){e.preventDefault();window.experimentLab?.toggle();}};window.onresize=resize;resize();go(0);

