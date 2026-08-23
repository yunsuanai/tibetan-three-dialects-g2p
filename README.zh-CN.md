# 藏文三大方言 G2P · Tibetan Three Dialects G2P

**面向藏语三大方言（卫藏/拉萨、康巴/德格、安多/拉卜楞）的规则式 G2P（字素到音素转换），输出 Montreal Forced Aligner（MFA）词典格式。**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Language](https://img.shields.io/badge/Language-JavaScript-efd81d.svg)](tibetan-three-dialects-g2p.js)
[![Status](https://img.shields.io/badge/Status-Prototype-orange.svg)](#局限与免责声明)

**语言 / Languages：** [English](./README.md) · 中文



---

## 项目概述

**藏文三大方言 G2P**（Tibetan Three Dialects G2P）是一个轻量、**基于规则**的藏文 G2P 转换器。输入一句规范书面藏文，即可一次性得到三大方言的读音词典，格式为 **MFA（Montreal Forced Aligner）lexicon** 词典格式：

| 方言 | 代表点 | 韵律类型 |
| --- | --- | --- |
| **卫藏**（དབུས་གཙང） | 拉萨（ལྷ་ས） | 有声调 |
| **康巴**（ཁམས） | 德格（སྡེ་དགེ） | 有声调 |
| **安多**（ཨ་མདོ） | 拉卜楞（བླ་བྲང） | 无声调（重音/音高重音） |

引擎是一个无任何依赖的小型 JavaScript 模块（[`tibetan-three-dialects-g2p.js`](tibetan-three-dialects-g2p.js)），浏览器与 Node.js 均可运行。附带中英对照的交互式演示（[`index.html`](index.html)）与命令行工具（[`cli.js`](cli.js)）。它的定位是藏语 TTS、强制对齐和语音语料建设的一个**透明、可审计的文本前端基线**，而不是替代语言学人工校对的成品工具。

---

## 为什么藏语 G2P 很重要

### 藏语 TTS 的现状

藏语在语音技术领域属于**低资源语言**。可用的平行语音语料规模小，且高度集中在拉萨/卫藏口音上，康巴、安多的数据仍然稀缺（见 [Tibetan Language and AI 综合综述](https://arxiv.org/abs/2510.19144)）。三大方言在音系、词汇和韵律上差异显著——拉萨话有声调，安多话无声调且保留了古藏语的辅音复辅音——因此为某一种口音训练的系统无法直接迁移到另外两种。

长期以来，大多数藏语语音合成工作只针对单一口音。多方言、低资源的研究直到近几年才陆续出现，例如 [端到端藏语多方言语声合成（2021）](https://onlinelibrary.wiley.com/doi/10.1155/2021/6682871)、[FMSD-TTS（2025）](https://arxiv.org/abs/2505.14351)、[TMD-TTS（2025）](https://arxiv.org/abs/2509.18060) 和 [Tibetan-TTS（2026）](https://arxiv.org/abs/2605.02496)。这些文献反复强调的一个共同诉求正是**准确的读音词典和文本前端**——因为录音数据恰恰是最稀缺的资源。

### G2P 的重要性

G2P 把书面文本转写为音素序列（本项目输出的是类 IPA 音素串），是 TTS **文本前端**的核心环节：文本规整 → G2P → 韵律/声调预测 → 声学模型。对于强制对齐而言，G2P 生成的正是“字/词 → 音素序列”的发音词典，没有它，MFA 对齐和语料建设便无从谈起。

对藏语而言，这一挑战被进一步放大，因为**藏文是一种深层正字法（deep orthography）**。书面藏语一千多年来保持高度保守：文字记录了历史上的辅音复辅音（前置字、上加字、下加字、后加字、再后加字），而这些音在现代各方言口语中已发生简化、清化或脱落。因此，同一个书面音节在各方言中有**不同但高度系统化**的读音，字素与音素之间不存在简单的一一对应。**区分方言的规则式 G2P** 是刻画这一知识的最高透明度方式，而且**无需训练数据**，是学习式模型的理想基线与冷启动手段。

更完整的讨论见 [`docs/background.md`](docs/background.md)。

---

## 功能特性

- **一次生成三方言**——同一输入，同时得到卫藏、康巴、安多三套读音。
- **MFA 就绪输出**——标准的两列 `词<TAB>音素 音素 音素` 词典格式。
- **语言学可靠的音节解析器**——把每个音节拆解为前置字、上加字、基字、下加字、元音、后加字、再后加字等正字法槽位。
- **分方言音变规则**——声调指派与元音变音（卫藏/康巴）、复辅音实现（安多）、腭化、卷舌化等。
- **零依赖、零配置**——浏览器演示 + Node 命令行，均可离线运行。
- **确定性与可审计性**——每条规则都在源码中显式可见，输出可逐条检查与修正。

---

## 快速开始

### 浏览器演示

用任意现代浏览器打开 [`index.html`](index.html)（无需构建、无需服务器），粘贴藏文，把三个输出面板复制进你的 MFA 词典。

### 命令行

```bash
git clone https://github.com/Khepa-Nyima/tibetan-three-dialects-g2p.git
cd tibetan-three-dialects-g2p
node cli.js "ཁྱོད་རང་གང་དུ་ཡོད།"
```

或用 stdin 输入并按方言过滤：

```bash
echo "ཁྱོད་རང་གང་དུ་ཡོད།" | node cli.js --dialect amdo
```

### 作为库使用

```js
const { generate } = require('./tibetan-three-dialects-g2p.js');
const res = generate('ཁྱོད་རང་གང་དུ་ཡོད།');
console.log(res.utsang.join('\n'));  // 卫藏词典行
```

> **GitHub Pages：** 演示已发布在 <https://Khepa-Nyima.github.io/tibetan-three-dialects-g2p/>（从 `main` 分支直接托管）。

---

## 使用方法

### 输入

任意 Unicode 藏文文本。音节按音节符 `་`（U+0F0B）及常见标点切分；输出中对重复音节去重（词典要求键唯一）。

### 输出格式

每段输出都是合法的 MFA 词典片段——每行一条：

```
<藏文音节><TAB><音素1> <音素2> <音素3> ...
```

以 `ཁྱོད་རང་གང་དུ་ཡོད།` 为例（实际工具输出）：

```
# 卫藏（拉萨）
ཁྱོད	cʰ ø53
རང	r a14 ŋ
གང	kʰ a14 ŋ
དུ	tʰ u14
ཡོད	j ø12

# 康巴（德格）
ཁྱོད	tɕ ø53
རང	r a13 ŋ
གང	kʰ a13 ŋ
དུ	tʰ u13
ཡོད	j ø33

# 安多（拉卜楞，无声调）
ཁྱོད	kʰj o t
རང	r a ŋ
གང	ɡ a ŋ
དུ	d u
ཡོད	j o t
```

> 实际输出取决于 [`tibetan-three-dialects-g2p.js`](tibetan-three-dialects-g2p.js) 中的规则表；完整音素表、声调数字约定与映射表见 [`docs/g2p-rules.md`](docs/g2p-rules.md)。

### 接入你的流程

- **MFA**：把各面板输出合并为一个 `.txt` 词典，用 `mfa align ... --dictionary_path` 引用。
- **TTS（VITS / Tacotron / FastSpeech 等）**：把音素序列作为前端的音素输入。
- **语料建设**：对大规模文本跑一遍本工具，先产出词典初稿，再由语言学家逐条校对。

---

## 方法概述

1. **分词**——按 `་` 和标点把文本切分为音节。
2. **正字法解析**——把每个音节拆解为最多七个槽位：前置字、上加字、基字、下加字、元音、后加字、再后加字。
3. **分方言映射**——
   - **卫藏**与**康巴**共用一张带声调与送气标记的基字表，但在复辅音简化、声调指派与元音变音上不同。
   - **安多**使用独立的基字表（保留浊辅音、无声调），并把前置字、上加字实现为可听见的辅音。
4. **序列化**——按 MFA 词典格式输出音素串。

详见 [`docs/phonology.md`](docs/phonology.md)（书写系统与三方言音系）和 [`docs/g2p-rules.md`](docs/g2p-rules.md)（规则表与输出约定）。

---

## 局限与免责声明

这是一个**学术性质的规则模拟**，不是生产级前端。

- 输出代表的是**书面理论读音**，不代表任何具体说话人或录音的真实发音，可能与真实口语不一致。
- 规则只是对公认音变的**一阶近似**，未覆盖全部词汇例外、借词、跨音节连读（sandhi）以及方言内部差异。
- 结果只是**供人工校对的初稿**；正式用于 MFA/VITS 训练前，**必须**由受过训练的语言学家核对修正。
- 声调数字采用简化的五度制数字约定，不代表对拉萨/康巴声调任何单一音系学分析的主张。

欢迎提交改进规则覆盖度、补充词汇例外的贡献，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 项目结构

```
.
├── tibetan-three-dialects-g2p.js  # G2P 引擎（浏览器 + Node.js，无依赖）
├── cli.js                         # 命令行工具
├── index.html                     # 中英对照交互式演示（GitHub Pages 入口）
├── package.json                   # npm 元数据
├── test/
│   └── smoke.js                   # 示例冒烟测试
├── .github/
│   └── workflows/                 # CI（冒烟测试）
├── docs/
│   ├── background.md              # 藏语 TTS 现状与 G2P 的重要性
│   ├── phonology.md               # 藏文书写系统与三大方言音系
│   └── g2p-rules.md               # 完整规则表、音素表、输出约定
├── README.md                      # 英文说明
├── README.zh-CN.md                # 本文件（中文说明）
├── CONTRIBUTING.md                # 贡献指南
├── CITATION.cff                   # 引用元数据
└── LICENSE                        # Apache License 2.0
```

---

## 路线图

- [x] 把引擎抽取为可复用模块，并提供 Node.js CLI。
- [ ] 补全 30 基字 × 元音 × 复辅音的完整覆盖矩阵与测试用例。
- [ ] 增加学习式（seq2seq / Transformer）G2P 作为规则基线的对照。
- [ ] 扩展方言覆盖（如德格与其他康巴变体；安多重音标注）。
- [ ] 增加词汇例外表与基于语料的发音词典。
- [ ] 打包为 npm 库与 pip 可安装的前端适配器。

---

## 参与贡献

欢迎提交 bug 报告、规则修正和新的语言数据。请在提交 PR 前阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。本项目遵循 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则，请友善、建设性地交流。

---

## 许可证

[Apache License 2.0](LICENSE) © [Khepa-Nyima](https://github.com/Khepa-Nyima) 及贡献者。

---

## 引用

如果你在研究中使用了本工具，请引用它。仓库提供了现成的 [CITATION.cff](CITATION.cff)，或使用：

```bibtex
@misc{tibetan-three-dialects-g2p,
  title        = {藏文三大方言 G2P (Tibetan Three Dialects G2P): Rule-based Grapheme-to-Phoneme for the three major Tibetan dialects},
  author       = {Khepa-Nyima},
  year         = {2026},
  howpublished = {\url{https://github.com/Khepa-Nyima/tibetan-three-dialects-g2p}},
  license      = {Apache-2.0}
}
```

---

## 参考文献

- Huang & Tashi 等 — *Tibetan Language and AI: A Comprehensive Survey of Resources, Methods and Challenges*. [arXiv:2510.19144](https://arxiv.org/abs/2510.19144)
- *TMD-TTS: A Unified Tibetan Multi-Dialect Text-to-Speech Synthesis for Ü-Tsang, Amdo and Kham Speech Dataset Generation*. [arXiv:2509.18060](https://arxiv.org/abs/2509.18060)
- *FMSD-TTS: Few-shot Multi-Speaker Multi-Dialect Text-to-Speech Synthesis for Ü-Tsang, Amdo and Kham Speech Dataset Generation*. [arXiv:2505.14351](https://arxiv.org/abs/2505.14351)
- *Tibetan-TTS: Low-Resource Tibetan Speech Synthesis with Large Model Adaptation*. [arXiv:2605.02496](https://arxiv.org/abs/2605.02496)
- *End-to-End Speech Synthesis for Tibetan Multidialect*. Hindawi/Wiley, 2021. [DOI 10.1155/2021/6682871](https://onlinelibrary.wiley.com/doi/10.1155/2021/6682871)
- 西藏藏语言文字网 — 《藏语方言》与《藏语语音结构》
