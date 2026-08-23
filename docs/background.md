# Background — Tibetan TTS and the Role of G2P

> 本文同时提供中文版，见下方「中文版」一节。 / A Chinese version is provided in the "中文版" section below.

---

## 1. Tibetan in speech technology: a low-resource language

Tibetan is spoken by roughly six million people across the Tibetan Plateau and adjacent regions, and it is conventionally divided into three major dialect groups:

1. **Ü-Tsang** (དབུས་གཙང) — the basis of the Lhasa standard; **tonal**.
2. **Khams** (ཁམས) — east and southeast; **tonal**, intermediate in its innovations.
3. **Amdo** (ཨ་མདོ) — northeast; **non-tonal** (it has stress/pitch-accent rather than phonemic tone) and phonologically the most conservative.

These groups differ enough in phonology, lexicon, and prosody that mutual intelligibility is limited, and a model trained on one variety does not simply transfer to the others.

For speech technology, Tibetan qualifies as **low-resource**. Compared with English or Mandarin, the public resources are thin: there are few large, multi-speaker, multi-dialect corpora; annotated data is sparse; and what exists is skewed toward the Lhasa variety. The survey *Tibetan Language and AI* ([arXiv:2510.19144](https://arxiv.org/abs/2510.19144)) documents this imbalance across speech, NLP, and machine-translation resources, and it remains the clearest recent statement of the field's data bottleneck.

### The current state of Tibetan TTS

Historically, Tibetan TTS research has been dominated by **single-variety, Lhasa/Ü-Tsang** systems, often with classical concatenative or parametric methods and, later, neural end-to-end models. Multi-dialect and explicitly low-resource work is a recent development:

- **End-to-End Speech Synthesis for Tibetan Multidialect** (2021, [DOI 10.1155/2021/6682871](https://onlinelibrary.wiley.com/doi/10.1155/2021/6682871)) — an early neural multi-dialect effort.
- **完全端到端的藏语语音合成方法** (《中文信息学报》, 2024) — fully end-to-end Tibetan TTS.
- **基于藏字构件的低资源多方言藏语语音合成方法研究** (《计算机工程与科学》, 2025) — uses Tibetan character components for low-resource multi-dialect synthesis.
- **FMSD-TTS** ([arXiv:2505.14351](https://arxiv.org/abs/2505.14351), 2025) — few-shot, multi-speaker, multi-dialect TTS framed explicitly around *generating* Ü-Tsang/Amdo/Khams speech data.
- **TMD-TTS** ([arXiv:2509.18060](https://arxiv.org/abs/2509.18060), 2025) — a unified multi-dialect framework for the same three groups.
- **Tibetan-TTS** ([arXiv:2605.02496](https://arxiv.org/abs/2605.02496), 2026) — large-model adaptation for low-resource Tibetan synthesis.

Two observations stand out from this literature:

1. **Data scarcity is the binding constraint.** The recent multi-dialect papers exist precisely because there is too little recorded speech in Khams and Amdo; several of them *synthesize* the training data.
2. **The front-end matters as much as the acoustic model.** Because audio is scarce, the cheapest way to improve a Tibetan TTS system is to get the *text-side* representation right — normalization, pronunciation, and prosody — rather than to collect more hours of speech.

---

## 2. Why Tibetan orthography makes G2P hard

Grapheme-to-phoneme conversion (G2P) maps a written string to a sequence of phones (an IPA-like phonemic transcription). In "shallow" orthographies (e.g., Spanish, Finnish), this mapping is nearly one-to-one and trivial. In "deep" orthographies (e.g., English, French), spelling and sound have diverged, and the mapping must be learned or encoded by rule.

Tibetan is a **deep orthography in a specific sense**: it is not irregular, but **archaic**. The script, fixed in its essentials by the 9th century, encodes the phonology of Classical Tibetan:

- **Consonant clusters** written with *prefixes* (སྔོན་འཇུག, e.g. ག ད བ མ འ), *superscripts* (མགོ་ཅན, ར ལ ས), *subscripts* (འདོགས་ཅན, ྱ ྲ ླ ྭ), *suffixes* (རྗེས་འཇུག), and *post-suffixes* (ཡང་འཇུག, ད ས).
- **Voiced, voiceless, and aspirated** stop series that the script still distinguishes.
- An **inherent vowel** *a* modified by the four vowel signs ི ུ ེ ོ.

In the modern dialects these historical distinctions are realized very differently:

- **Lhasa/Ü-Tsang** has largely lost the clusters: prefixes and superscripts are silent as segments, but they condition the tone and aspiration of the following root; voiced stops are devoiced (ག→[kʰ], ད→[tʰ], བ→[pʰ]); and several codas trigger vowel umlaut and nasalization.
- **Khams** is intermediate: some clusters remain, tone is simpler, and the inventory sits between Ü-Tsang and Amdo.
- **Amdo** retains most clusters and the voiced series (ག→[ɡ], ད→[d], བ→[b]) and has no phonemic tone; its spelling-to-sound mapping is consequently much more transparent.

The consequence for G2P is direct: **one orthographic string has multiple correct pronunciations, one per dialect**, and each mapping is a *system of conditioned sound changes* rather than a lookup table. This is precisely the situation a rule-based, dialect-aware G2P is designed to handle — the grapheme string is parsed into its orthographic slots, and the same parse is then interpreted under three different phonological systems.

---

## 3. The importance of G2P in the TTS pipeline

G2P sits inside the TTS **text front-end**:

```
text → text normalization → G2P → prosody/tone prediction → acoustic model → waveform
```

Its output (the phone sequence) is the interface contract between language knowledge and the acoustic model. Its quality therefore propagates directly into two measurable outcomes:

- **Intelligibility** — a wrong phone is heard as a wrong sound.
- **Naturalness** — prosody and tone labels ride on top of the phone sequence; if the segments or tone classes are wrong, the model learns the wrong prosodic generalizations.

G2P is also the gateway to **forced alignment**. Tools such as the Montreal Forced Aligner (MFA) require a pronunciation dictionary — a two-column list mapping every written form to its phone sequence. Without G2P, that dictionary must be produced by hand, which does not scale to a whole corpus. For a low-resource language, rule-based G2P is especially valuable because it can convert an effectively *unlimited* supply of written text into pronunciation data with **no audio and no training data**.

Beyond TTS, the same G2P serves:

- **ASR** pronunciation lexicons and pronunciation modeling.
- **Speech-corpus construction** and **data-augmentation** for multi-dialect datasets.
- **Language documentation** and **dialectology** — making the systematic sound correspondences between dialects explicit and testable.
- **Language learning** and digital preservation of minority languages.

---

## 4. Where this project fits

`tibetan-three-dialects-g2p` is a **transparent, rule-based front-end** for the three dialects:

- It encodes the orthographic parse and the dialect-specific sound changes as explicit, auditable rules — the kind of linguistic knowledge a linguist can review, correct, and extend line by line.
- It requires **zero training data**, so it works today for Khams and Amdo, where corpora are scarcest.
- It emits **MFA-ready lexicons**, so it drops directly into forced-alignment and corpus-building pipelines.
- It is meant to be a **baseline**: rule output can seed or verify a learned G2P model, and the two can be compared quantitatively.

Its output is a *draft for review*, not a final product — see the [limitations](../README.md#limitations-and-disclaimer) in the README.

---

## 中文版

### 1. 藏语在语音技术中的定位：一门低资源语言

藏语使用者约六百万人，传统上分为三大方言：**卫藏**（དབུས་གཙང，拉萨标准语的基础，**有声调**）、**康巴**（ཁམས，东部与东南部，**有声调**，创新程度居中）、**安多**（ཨ་མདོ，东北部，**无声调**，以重音/音高重音取代音位声调，音系上最保守）。三大方言在音系、词汇、韵律上差异显著，互通度有限，为某一种口音训练的系统无法直接迁移。

就语音技术而言，藏语属于**低资源语言**：公开资源少，缺乏大规模、多说话人、多方言语料，标注数据稀疏，且高度集中于拉萨口音。综述 *Tibetan Language and AI*（[arXiv:2510.19144](https://arxiv.org/abs/2510.19144)）清晰记录了语音、NLP、机器翻译各方向上的这种资源失衡，是当前对数据瓶颈最明确的表述。

#### 藏语 TTS 现状

历史上藏语 TTS 研究长期以**单一口音（拉萨/卫藏）**为主，早期多为拼接式或参数式，后逐步转向神经端到端模型。多方言与显式低资源研究是近几年才兴起的：

- **End-to-End Speech Synthesis for Tibetan Multidialect**（2021，[DOI 10.1155/2021/6682871](https://onlinelibrary.wiley.com/doi/10.1155/2021/6682871)）——早期神经多方言工作。
- **完全端到端的藏语语音合成方法**（《中文信息学报》，2024）。
- **基于藏字构件的低资源多方言藏语语音合成方法研究**（《计算机工程与科学》，2025）——利用藏字构件做低资源多方言合成。
- **FMSD-TTS**（[arXiv:2505.14351](https://arxiv.org/abs/2505.14351)，2025）——少样本、多说话人、多方言 TTS，其出发点正是**生成**卫藏/安多/康巴语音数据。
- **TMD-TTS**（[arXiv:2509.18060](https://arxiv.org/abs/2509.18060)，2025）——面向同一三方言的统一多方言框架。
- **Tibetan-TTS**（[arXiv:2605.02496](https://arxiv.org/abs/2605.02496)，2026）——大模型适配的低资源藏语合成。

从这些文献可得出两点观察：

1. **数据稀缺是根本约束。** 近年多方言论文之所以出现，正是因为康巴、安多的录音语料太少，其中多篇干脆**合成**训练数据。
2. **前端与声学模型同等重要。** 既然音频稀缺，改进藏语 TTS 最廉价的方式就是先把**文本侧**做对——规整、读音、韵律——而非一味收集更多录音。

### 2. 为什么藏文正字法让 G2P 变难

G2P 把书面文本映射为音素序列（类 IPA 的音位转写）。在“浅层”正字法（如西班牙语、芬兰语）里，这一映射几乎一一对应、十分简单；在“深层”正字法（如英语、法语）里，拼写与读音已经分化，映射必须靠学习或用规则刻画。

藏文是一种特定意义上的**深层正字法**：它不是不规则，而是**古老保守**。文字体系在 9 世纪基本定型，编码的是古藏语（古典藏语）的音系：

- **辅音复辅音**，以前置字（ག ད བ མ འ）、上加字（ར ལ ས）、下加字（ྱ ྲ ླ ྭ）、后加字、再后加字（ད ས）书写。
- 文字仍区分**浊、清、送气**三套塞音。
- 有一个**固有元音** *a*，由 ི ུ ེ ོ 四个元音符号改变。

这些历史区分在现代各方言中的实现截然不同：

- **拉萨/卫藏**基本丢失复辅音：前置字、上加字作为音段不发音，但决定后续基字的声调与送气；浊塞音清化（ག→[kʰ]、ད→[tʰ]、བ→[pʰ]）；若干韵尾触发元音变音与鼻化。
- **康巴**居中：部分复辅音保留，声调更简单，音系介于卫藏与安多之间。
- **安多**保留大部分复辅音与浊音系列（ག→[ɡ]、ད→[d]、བ→[b]），无音位声调，字音对应因此更透明。

对 G2P 的直接后果是：**同一个书面串有多种正确读音（每个方言一种）**，且每种映射都是一套“受条件制约的音变系统”，而非一张查表。这正是规则式、区分方言的 G2P 所擅长处理的场景——把字素串解析为正字法槽位，再让同一解析在三套音系下分别得到解释。

### 3. G2P 在 TTS 流程中的重要性

G2P 位于 TTS **文本前端**内部：

```
文本 → 文本规整 → G2P → 韵律/声调预测 → 声学模型 → 波形
```

其输出（音素序列）是语言知识与声学模型之间的接口契约，因此质量会直接传导为两个可测量结果：

- **可懂度**——音素错则听感错。
- **自然度**——韵律与声调标注叠加在音素序列之上，若音段或调类错了，模型学到的韵律概括也是错的。

G2P 同时也是**强制对齐**的入口。Montreal Forced Aligner（MFA）等工具需要发音词典——把每个书写形式映射到其音素序列的两列表。没有 G2P，词典只能手工制作，无法扩展到整个语料。对低资源语言而言，规则式 G2P 尤其宝贵：它能把**近乎无限**的书面文本转化为读音数据，**无需音频、无需训练数据**。

除 TTS 外，同一套 G2P 还服务于：

- **ASR** 的发音词典与发音建模；
- **语音语料建设**与多方言数据的**数据增强**；
- **语言记录与方言学**——把方言间的系统性语音对应显式化、可验证化；
- **语言学习**与少数民族语言的数字化保存。

### 4. 本项目的位置

`tibetan-three-dialects-g2p` 是面向三大方言的**透明、规则式前端**：

- 把正字法解析与分方言音变编码为显式、可审计的规则——语言学家可逐行审查、修正与扩展的语言学知识。
- **零训练数据**，因此对语料最稀缺的康巴、安多当下即可用。
- 输出 **MFA 就绪词典**，可直接接入强制对齐与语料建设流程。
- 定位为**基线**：规则输出可为学习式 G2P 提供种子或校验，二者可定量对比。

其输出是**供校对的初稿**，而非成品——见 README 的[局限与免责声明](../README.zh-CN.md#局限与免责声明)。
