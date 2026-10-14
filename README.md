# Compare Search Trees

一个可离线打开的 16:9 HTML 演示，说明题目要求的五种搜索树、三组插入/删除序列及运行时间比较。直接打开 `index.html`；左右方向键切页，`F` 全屏。第 4、9 页可选场景、播放、单步、跳到插入完成或拖动进度；`Space` 播放/暂停。网页不显示讲稿，演讲者使用独立的 `逐页讲稿.md`。

## 演示结构

1–3 页交代问题、树的维护方式和计时方法。4 页先让 BST、AVL、Splay、红黑树、B+ 树同步执行同一操作。5 页结合刚才的结构变化建立复杂度预期。6–7 页展示七种规模（1,000–100,000）的实测曲线。8 页只提出有序操作下 BST 为什么格外慢、Splay 为什么格外快两个问题。9 页放大比较结构，并把教学示例与报告计时并列说明。10 页用一张对照表汇总三种操作顺序下 BST 与 Splay 的插入、删除和整轮成本，每个复杂度附一句原因。11 页总结结论和局限。

动画使用 9 个键，分“定位”和“更新”两帧。BST、AVL、左倾红黑树与 B+ 树有独立的 JavaScript 教学模型；Splay 复用自顶向下伸展跟踪引擎。B+ 动画采用节点容量 4，以展示分裂、借位和合并；原 C 实验采用容量 32。动画中的树形、层数及维护动作不等于原报告的耗时测量。

`data.js` 的数值来自用户提供的 `compare-search-trees.pdf` §3.3（2026-10-03），为三次运行的插入加删除总时间中位数。原实验报告和 C 代码属于另附的课程提交资料，未包含在本网页仓库。网页图表不会重新运行基准测试；五种树使用同一试验输入的公平性由原 C 程序负责。

## 检查

```sh
node experiment-tests.js
node trace-tests.js
```

`experiment-tests.js` 检查三组规定序列和 80 组随机完整插入/删除周期：键集合、BST 顺序、AVL 高度约束、红黑树颜色与黑高、B+ 占用率/分隔键/叶链，以及最终清空。`trace-tests.js` 验证 Splay 跟踪引擎的混合操作和节点身份。浏览器打印可输出全部十一页；动画页打印当前状态。

## 复杂度分析的依据

第 10 页分析标准 BST 与本仓库采用的自顶向下 Splay 算法的结构操作成本，不把教学快照或 SVG 绘制计入复杂度，也不重新测量原 C 程序。BST 随机场景假设插入与删除是独立、均匀随机排列；Splay 的 O(N log N) 是一般均摊上界。升序插入后的两种顺序删除可达线性总成本，不能仅从一般上界或九键动画推导。

参考：[Sleator 与 Tarjan：Self-Adjusting Binary Search Trees](https://www.cs.cmu.edu/~sleator/papers/Self-Adjusting.htm) 给出标准操作的均摊保证；[Tarjan：Sequential access in splay trees takes linear time](https://link.springer.com/article/10.1007/BF02579253) 讨论顺序访问与单端删除队列的线性总成本。
