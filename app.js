const $=s=>document.querySelector(s);
const heading=title=>`<h2>${title}</h2>`;
const card=(title,body)=>`<div class="card"><h3>${title}</h3>${body}</div>`;
const costCell=(cost,reason)=>`<td><strong>${cost}</strong><span>${reason}</span></td>`;
const sourcePicker=()=>`<div class="chartSourceWrap"><div class="chartSource" role="group" aria-label="选择计时数据来源"><button type="button" data-source="report">原报告</button><button type="button" data-source="mac">本机复现</button></div><small class="benchmarkSourceLabel"></small></div>`;
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
`<h1>Compare<br><span class="blue">Search Trees.</span></h1><div class="grid three">${[
['先从小到大插入，再从小到大删除','插入：1 → 2 → 3 → 4 → 5<br>删除：1 → 2 → 3 → 4 → 5'],
['先从小到大插入，再从大到小删除','插入：1 → 2 → 3 → 4 → 5<br>删除：5 → 4 → 3 → 2 → 1'],
['打乱插入顺序，再独立打乱删除顺序','插入：3 → 1 → 5 → 2 → 4<br>删除：2 → 5 → 1 → 4 → 3']
].map(([title,sequence])=>card(title,`<p>${sequence}</p>`)).join('')}</div><p class="statement">每种树都做 N 次插入和 N 次删除，<br><span class="blue">为什么耗时仍会相差数千倍？</span></p>`,
heading('结构与维护')+`<div class="grid five">${names.map((name,i)=>card(name,`<div id="mini${i}"></div><p>${[
'每个结点的左子树键值都小于它，右子树键值都大于它。查找与插入按键值选择分支，删除时重新连接子树。',
'每个结点的左右子树高度差不超过 1。插入、删除后检查平衡因子，通过单旋或双旋恢复平衡，并保持键值有序。',
'用 zig、zig-zag、zig-zig 步骤将访问结点伸展到根；插入后伸展新结点，删除时先伸展目标，再拼接左右子树。',
'结点分红、黑两色；根和 NIL 为黑，红结点的孩子为黑，各结点到后代 NIL 的路径含相同数量的黑结点。更新后以旋转和变色修复规则。',
'内部结点只存索引，记录存于叶子；叶子深度相同，按键序连接。插入溢出时分裂，删除不足时借位或合并，并更新索引。'
][i]}</p>`)).join('')}</div>`,
heading('标准时间复杂度')+`<table><tr><th>结构</th><th>维护方式</th><th>单次一般成本</th><th>单次最坏成本</th></tr>${names.map((name,i)=>`<tr><td>${name}</td><td>${['遵循左小右大，不主动平衡','通过旋转维持左右高度差','访问时伸展，将结点移到根','通过旋转和变色维护颜色规则','通过分裂、借位和合并维护多路结构'][i]}</td><td class="operationCost">O(log N)${i===0?'<small class="costQualifier">（期望）</small>':i===2?'<small class="costQualifier">（均摊）</small>':''}</td><td>${i===0||i===2?'O(N)':'O(log N)'}</td></tr>`).join('')}</table>`,
heading('实验设计')+`<div class="grid two">${card('五种树收到完全相同的输入','<ol class="experimentSteps"><li><b>准备同一组键</b><span>使用 0 到 N−1；每次试验五种树共用同一排列。</span></li><li><b>先插入，再删除</b><span>从空树开始，最后回到空树；分别记录两段时间。</span></li><li><b>重复三次</b><span>将插入与删除时间相加，取三次总时间的中位数。</span></li></ol>')}${card('原报告的计时配置','<dl class="experimentConfig"><div><dt>输入规模</dt><dd>1k、2k、5k、10k、20k、50k、100k</dd></div><div><dt>实现与编译</dt><dd>使用 C 实现，GCC 13.3.0 以 -O2 编译。</dd></div><div><dt>运行环境</dt><dd>WSL2 / Linux，Ryzen 7 H 255；未绑定 CPU。</dd></div><div><dt>计时方式</dt><dd>使用 CLOCK_MONOTONIC，单进程顺序运行；B+ 节点容量为 32。</dd></div></dl>')}</div>`,
heading('操作演示')+`<div id="labTrees"></div>`,
heading('有序操作结果')+`<div class="chartTop"><p class="chartContext">横轴为键数 N，纵轴为总时间（毫秒）；两轴按对数刻度。<strong>纵轴每条横线相差 10 倍。</strong></p>${sourcePicker()}</div><div class="legend" id="legend5"></div><div class="grid two orderedCharts"><div><h3>从小到大插入，再从小到大删除</h3><div id="chart0"></div></div><div><h3>从小到大插入，再从大到小删除</h3><div id="chart1"></div></div></div><div class="grid two orderedStats"><div><span class="big blue" id="orderedRatio0"></span><p id="orderedDetail0"></p></div><div><span class="big blue" id="orderedRatio1"></span><p id="orderedDetail1"></p></div></div>`,
heading('随机操作结果')+`<div class="chartTop"><p class="chartContext">插入和删除独立洗牌；左图两轴按对数刻度，<strong>纵轴每条横线相差 10 倍。</strong>右图为十万键时的毫秒数。</p>${sourcePicker()}</div><div class="legend" id="legend6"></div><div class="grid two"><div id="chart2"></div><div class="bars"><div id="sampleBars"></div><p id="randomSourceSummary"></p></div></div><p class="randomSummary">两轮随机测试的十万键排序相同，但领先幅度不同：趋势可以复现，细小差距不可泛化。</p><div class="bplusAnalysis"><p><strong>B+ 的优势可能来自更矮的树和更集中的存储。</strong>有效分支数为 b 时，树高约为 O(log<sub>b</sub> N)。</p><p>节点内查找、分裂与合并也有成本。两组测量里 B+ 都快于 BST，但领先幅度不同；每组仅重复三次，不能据此断言 B+ 普遍最快。</p></div>`,
heading('突出问题')+`<p class="intro">随机插入和删除时，五种树的耗时处于同一数量级。<br>但在有序操作中，BST 的耗时格外高，Splay 的耗时格外低。</p><div class="grid two questionGrid">${card('为什么有序操作让 BST 这么慢？','')}${card('为什么 Splay 在有序操作中这么快？','')}</div>`,
heading('结构对照')+`<div id="labInsight"></div>`,
heading('复杂度对照')+complexityTable()+`<div class="balancedComparison"><strong>AVL、红黑树、B+ 树：三种序列均为 O(N log N)</strong><p>单次插入、删除的最坏成本为 O(log N)，共执行 2N 次操作；B+ 按固定节点容量讨论。</p></div>`,
heading('总结与局限')+`<div class="grid three">${card('有序操作：差距达数千倍','<p>升序插入令普通 BST 形成长链。报告与本机复现中，十万键的 BST / Splay 耗时比约为 3,233–12,525 倍。</p>')}${card('随机操作：回到同一数量级','<p>两轮十万键测试排序相同，都是 B+、BST、AVL、Splay、红黑树；但 B+ 相对 BST 的领先从约 1.55% 变为 24.5%。</p>')}${card('机制与实测要一起看','<p>Splay 在特定有序序列里很快，却不是随机组最快；旋转、变色、分裂以及内存访问都会影响实际耗时。</p>')}</div><div class="finalScope"><h3>实验范围与局限</h3><p>报告与本机复现都只测插入、删除，每组重复三次。硬件和编译器不同，绝对毫秒不能直接比较；未覆盖查询、混合负载或 B+ 的磁盘 I/O，细小领先不能推广。</p></div>`
];
const chapters=['问题','结构','理论','方法','操作过程','有序结果','随机结果','两个问题','动画解释','复杂度对照','结论'];
$('#deck').innerHTML=slides.map((content,i)=>`<section id="slide${i+1}" data-screen-label="${String(i+1).padStart(2,'0')} ${chapters[i]}" aria-label="第 ${i+1} 页：${chapters[i]}"><div class="slideMeta"><span>${String(i+1).padStart(2,'0')} / ${slides.length} · ${chapters[i]}</span></div>${content}</section>`).join('');
const hidden=new Set;
let benchmarkSource='report';
const activeData=()=>benchmarkSource==='mac'?macDatasets:datasets;
const formatMs=value=>value>=1000?`${(value/1000).toFixed(1)} 秒`:`${value.toFixed(value<10?3:1)} 毫秒`;
function renderBenchmarkSummary(){
 const data=activeData();
 document.querySelectorAll('[data-source]').forEach(button=>{const selected=button.dataset.source===benchmarkSource;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
 document.querySelectorAll('.benchmarkSourceLabel').forEach(label=>label.textContent=benchmarkSource==='mac'?'Mac · Apple Clang -O2 · 3 次中位数':'原报告 · WSL2 / GCC -O2 · 3 次中位数');
 for(let i=0;i<2;i++){const bst=data[i][0][6],splay=data[i][2][6];$(`#orderedRatio${i}`).textContent=`${Math.round(bst/splay).toLocaleString('en-US')}×`;$(`#orderedDetail${i}`).textContent=`十万键：BST ${formatMs(bst)}；Splay ${formatMs(splay)}。`;}
 const values=data[2].map(row=>row[6]);
 $('#sampleBars').innerHTML=[4,0,1,2,3].map(i=>`<div><span>${names[i]}</span><span class="bar" style="width:${Math.max(10,values[i]/Math.max(...values)*100)}%;background:${colors[i]}"></span><b>${values[i].toFixed(3)}</b></div>`).join('');
 const lead=(values[0]/values[4]-1)*100;
 $('#randomSourceSummary').textContent=`十万键：B+ ${values[4].toFixed(3)} ms，BST ${values[0].toFixed(3)} ms；BST 比 B+ 慢约 ${lead.toFixed(benchmarkSource==='report'?2:1)}%。`;
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-source]');if(!button)return;benchmarkSource=button.dataset.source;charts();renderBenchmarkSummary();});
function chart(id,index){
 const rows=activeData()[index],left=130,right=650,bottom=300,top=34;
 const x=n=>left+(Math.log10(n)-3)*(right-left)/2;
 const y=v=>bottom-(Math.log10(v)+2)*38;
 let out='<svg class="chart" viewBox="0 0 700 380" role="img" aria-label="横轴键数 N、纵轴插入删除总时间毫秒；两轴均为对数刻度，每条横线代表十倍">';
 for(let exponent=-2;exponent<=5;exponent++){
  const yy=y(10**exponent);
  out+=`<line x1="${left}" y1="${yy}" x2="${right}" y2="${yy}" class="chartGrid"/><line x1="${left-6}" y1="${yy}" x2="${left}" y2="${yy}" class="chartAxis"/><text x="${left-13}" y="${yy+5}" text-anchor="end">${(10**exponent).toLocaleString('en-US')}</text>`;
 }
 for(const exponent of [3,4,5]){
  const xx=x(10**exponent);
  out+=`<line x1="${xx}" y1="${bottom}" x2="${xx}" y2="${bottom+6}" class="chartAxis"/><text x="${xx}" y="${bottom+28}" text-anchor="middle">${(10**exponent).toLocaleString('en-US')}</text>`;
 }
 out+=`<path d="M ${left} ${top-8} V ${bottom} H ${right+8}" class="chartAxis"/><path d="M ${left-4} ${top-3} L ${left} ${top-9} L ${left+4} ${top-3} M ${right+3} ${bottom-4} L ${right+9} ${bottom} L ${right+3} ${bottom+4}" class="chartAxis"/>`;
 out+=`<text class="chartAxisTitle" x="${(left+right)/2}" y="365" text-anchor="middle">键数 N · 对数刻度</text><text class="chartAxisTitle" transform="translate(25 ${(top+bottom)/2}) rotate(-90)" text-anchor="middle">总时间 / ms · 对数刻度</text>`;
 rows.forEach((row,i)=>{
  if(hidden.has(i))return;
  out+=`<polyline class="curve" fill="none" stroke="${colors[i]}" stroke-width="3" points="${row.map((v,j)=>`${x(sizes[j])},${y(v)}`).join(' ')}"/>`;
  row.forEach((value,j)=>out+=`<circle cx="${x(sizes[j])}" cy="${y(value)}" r="5" fill="${colors[i]}"><title>${names[i]} · N=${sizes[j]} · T=${value.toFixed(3)} ms</title></circle>`);
 });
 $(id).innerHTML=out+'</svg>';
}
function charts(){[0,1,2].forEach(i=>chart('#chart'+i,i));}['#legend5','#legend6'].forEach(id=>{$(id).innerHTML=names.map((n,i)=>`<button style="color:${colors[i]}" data-series="${i}" aria-pressed="true">● ${n}</button>`).join('');$(id).onclick=e=>{let b=e.target.closest('button');if(!b)return;let i=+b.dataset.series;hidden.has(i)?hidden.delete(i):hidden.add(i);document.querySelectorAll(`[data-series="${i}"]`).forEach(b=>{b.style.opacity=hidden.has(i)?.35:1;b.setAttribute('aria-pressed',!hidden.has(i));});charts();};});charts();
renderBenchmarkSummary();
let page=0;function go(n){window.experimentLab?.stop();page=Math.max(0,Math.min(slides.length-1,n));document.querySelectorAll('section').forEach((s,i)=>s.classList.toggle('active',i===page));$('#progress').style.width=(page+1)/slides.length*100+'%';$('#pageLabel').textContent=`${String(page+1).padStart(2,'0')} / ${slides.length}`;window.experimentLab?.render();if(document.querySelector('section.active .chart'))charts();}function resize(){let s=Math.min(innerWidth/1600,innerHeight/900),d=$('#deck');d.style.transform=`scale(${s})`;d.style.left=(innerWidth-1600*s)/2+'px';d.style.top=(innerHeight-900*s)/2+'px';}$('#prev').onclick=()=>go(page-1);$('#next').onclick=()=>go(page+1);function full(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.();}$('#full').onclick=full;document.onkeydown=e=>{if(e.target.matches('select,input'))return;if(e.key==='ArrowRight'){e.preventDefault();go(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1);}if(e.key.toLowerCase()==='f')full();if(e.code==='Space'&&document.querySelector('section.active #labTrees, section.active #labInsight')){e.preventDefault();window.experimentLab?.toggle();}};window.onresize=resize;resize();go(0);

