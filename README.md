# Compare Search Trees

一个可离线打开的 16:9 HTML 演示，说明题目要求的五种搜索树、三组插入/删除序列及运行时间比较。直接打开 `index.html`；左右方向键切页，`F` 全屏。第 5、9 页可选场景、播放、单步、跳到插入完成或拖动进度；`Space` 播放/暂停。网页不显示讲稿，演讲者使用独立的 `逐页讲稿.md`。

## 演示结构

1–2 页交代问题与树的维护方式。3 页比较单次插入/删除的一般与最坏时间复杂度，4 页说明实验设计，5 页让五种树同步执行同一操作。6–7 页只展示原报告七种规模（1,000–100,000）的实测数据。第 6 页两轴按对数刻度排布；第 7 页左图也使用真实毫秒数，但将纵轴缩到适合随机组的范围，右图放大十万键的具体毫秒数。8–11 页解释机制、复杂度和局限。

动画使用 9 个键，分“定位”和“更新”两帧。BST、AVL、左倾红黑树与 B+ 树有独立的 JavaScript 教学模型；Splay 复用自顶向下伸展跟踪引擎。B+ 动画采用节点容量 4，以展示分裂、借位和合并；原 C 实验采用容量 32。动画中的树形、层数及维护动作不等于原报告的耗时测量。

网页图表只使用用户提供的 `compare-search-trees.pdf` §3.3（2026-10-03）的原报告数据，取三次插入加删除总时间的中位数。此前的本机复现实验作为独立记录保存在 [`benchmarks/README.md`](benchmarks/README.md)，不参与网页图表或结论。原 C 代码属于另附的课程提交资料，未包含在本网页仓库。

## 检查

```sh
node experiment-tests.js
node trace-tests.js
node benchmark-data-tests.js
```

`experiment-tests.js` 检查三组规定序列和 80 组随机完整插入/删除周期：键集合、BST 顺序、AVL 高度约束、红黑树颜色与黑高、B+ 占用率/分隔键/叶链，以及最终清空。`trace-tests.js` 验证 Splay 跟踪引擎的混合操作和节点身份。浏览器打印可输出全部十一页；动画页打印当前状态。

## 复杂度分析的依据

第 10 页分析标准 BST 与本仓库采用的自顶向下 Splay 算法的结构操作成本，不把教学快照或 SVG 绘制计入复杂度，也不重新测量原 C 程序。BST 随机场景假设插入与删除是独立、均匀随机排列；Splay 的 O(N log N) 是一般均摊上界。升序插入后的两种顺序删除可达线性总成本，不能仅从一般上界或九键动画推导。

参考：[Sleator 与 Tarjan：Self-Adjusting Binary Search Trees](https://www.cs.cmu.edu/~sleator/papers/Self-Adjusting.htm) 给出标准操作的均摊保证；[Tarjan：Sequential access in splay trees takes linear time](https://link.springer.com/article/10.1007/BF02579253) 讨论顺序访问与单端删除队列的线性总成本。

第 7 页正文补充 B+ 的树高与局部性分析：高分支数可减少树的层数，多键节点可能改善局部性，但节点内查找和分裂、合并仍有成本。该段是可能的机制解释，不是本实验的缓存测量结论。参考 [Cornell：B-Trees](https://www.cs.cornell.edu/courses/cs3110/2011sp/Recitations/rec24-B-trees/B-trees.htm)。

第 2 页的结构与维护说明依据用户提供的 `lec1.pdf` §1.1（BST）、§1.2（AVL）、§1.4（Splay），以及 `lec2.pdf` §2.1.1（红黑树）、§2.2.1–2.2.4（B+ 树），只描述定义与更新方式。讲义中的 Splay 用自底向上伸展介绍；本仓库动画仍采用自顶向下实现。红黑树卡片介绍一般红黑性质，动画仍使用满足这些性质的左倾红黑模型。
