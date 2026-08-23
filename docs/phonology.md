# Tibetan Writing System and Dialect Phonology

> 中文版见下方「中文版」一节。 / A Chinese version is provided in the "中文版" section below.

This document gives the linguistic background needed to read the rule tables in [`g2p-rules.md`](g2p-rules.md) and the source of [`tibetan-three-dialects-g2p.js`](../tibetan-three-dialects-g2p.js). It is intentionally descriptive rather than exhaustive.

---

## 1. The Tibetan script

Tibetan is written in an **abugida (alphasyllabary)** derived from an Indic (Brāhmī) source. Each consonant letter carries an **inherent vowel** *a*, which is modified by four vowel signs:

| Vowel sign | Romanization | IPA (inherent default) |
| --- | --- | --- |
| (none) | a | /a/ |
| ི | i | /i/ |
| ུ | u | /u/ |
| ེ | e | /e/ |
| ོ | o | /o/ |

The **root letter** (基字, མིང་གཞི) is the consonant bearing the vowel. Around it, up to six further orthographic positions may be written; together they form a syllable with (maximally) the following structure:

```
[prefix] [superscript] ROOT [subscript] [vowel] [suffix] [post-suffix]
```

| Slot | Tibetan term | Wylie/example letters | Function in Classical Tibetan |
| --- | --- | --- | --- |
| prefix (前置字) | སྔོན་འཇུག | ག ད བ མ འ | part of initial cluster |
| superscript (上加字) | མགོ་ཅན | ར ལ ས | part of initial cluster |
| **root** (基字) | མིང་གཞི | the 30 consonants | syllable nucleus (consonantal) |
| subscript (下加字) | འདོགས་ཅན | ྱ ྲ ླ ྭ | medial glide / cluster |
| vowel (元音) | དབྱངས | ི ུ ེ ོ (or none) | vowel quality |
| suffix (后加字) | རྗེས་འཇུག | ག ང ད ན བ མ འ ར ལ ས | coda |
| post-suffix (再后加字) | ཡང་འཇུག | ད ས | second coda element |

The thirty root consonants are:

```
ཀ ཁ ག ང ཅ ཆ ཇ ཉ ཏ ཐ ད ན པ ཕ བ མ ཙ ཚ ཛ ཝ ཞ ཟ འ ཡ ར ལ ཤ ས ཧ ཨ
```

Syllables are separated by the inter-syllabic mark `་` (*tsheg*, U+0F0B). This rich, cluster-capable structure is the key fact for G2P: the script preserves a Classical Tibetan phonology that the spoken dialects have re-shaped in different ways.

---

## 2. The three dialect groups

### 2.1 Ü-Tsang (དབུས་གཙང) — Lhasa

The Lhasa (standard) variety is **tonal**. In the common two-register analysis it has **high** and **low** tones, each further modulated by syllable type (short/long or checked coda); the tool represents this with Chao digits (see [`g2p-rules.md`](g2p-rules.md)).

Characteristic sound changes from the written form:

- **Devoicing of voiced stops/affricates**: ག→[kʰ], ད→[tʰ], བ→[pʰ], ཇ→[tɕʰ], ཛ→[tsʰ] (with tone marking the historical voicing).
- **Prefixes and superscripts are silent** as segments but condition the tone and aspiration of the root.
- **Palatalization** with subscript ྱ: ཀྱ/ཁྱ/གྱ→[c/cʰ], པྱ/ཕྱ/བྱ/མྱ→[tɕ/tɕʰ].
- **Retroflexion** with subscript ྲ: ཀྲ/ཏྲ/པྲ etc.→[ʈ/ʈʰ].
- **Coda-driven umlaut and nasalization**: suffixes ད ན ལ ས front/round vowels (a→ɛ, o→ø, u→y) and ན adds nasalization; ག ད ས produce glottal codas [ʔ].

### 2.2 Khams (ཁམས) — Dergé

Khams is **tonal** but phonologically intermediate between Ü-Tsang and Amdo. Relative to Lhasa:

- Tone is typically a simpler **high/low** contrast (here written 55/13, with 53/33 before voiced codas).
- Some historical clusters are retained to varying degrees; the tool treats prefixes/superscripts as contributing aspiration rather than full segments.
- Subscript ྱ yields [tɕ]-type palatals and ྲ yields retroflex [ʈʂ]-type affricates.
- Coda-driven umlaut is present but more limited (a→ɛ, o→ø, u→y before ད ན ས).

### 2.3 Amdo (ཨ་མདོ) — Labrang

Amdo is **non-tonal**: it uses stress/pitch-accent, not phonemic tone, so no tone digits appear in its output. It is also the most conservative dialect:

- **Voiced stops are retained**: ག→[ɡ], ད→[d], བ→[b], ཇ→[dʑ], ཛ→[dz].
- **Prefixes and superscripts are pronounced**: ག→[ɣ], ད→[d], བ→[v], མ→[m], འ→[ʁ]; ར→[r], ལ→[l], ས→[s].
- Subscript ྱ adds [j], ྲ adds [ʐ], ླ surfaces as [l].
- Suffixes surface as audible codas: ག→[k], ང→[ŋ], ད→[t], ན→[n], བ→[p], མ→[m], ར→[r], ལ→[l], ས→[x].

The Amdo mapping is therefore far closer to a transparent letter-to-sound reading — a useful property, since Amdo speech data is the scarcest and a rule-based front-end has the most leverage there.

---

## 3. Consequences for G2P

Because the **same orthographic string** is interpreted differently in each dialect, a Tibetan G2P must:

1. **Parse the orthography** into slots, not treat the string as a flat character sequence.
2. **Apply dialect-specific rules** to the same parse:
   - Ü-Tsang/Khams: tone and aspiration logic + umlaut, with clusters mostly neutralizing.
   - Amdo: cluster realization + voiced retention, with no tone.
3. **Output a phonemic transcription** whose phone inventory and conventions are documented (see [`g2p-rules.md`](g2p-rules.md)).

This is exactly the design of `tibetan-three-dialects-g2p`.

---

## 中文版

### 1. 藏文文字体系

藏文是一种源自印度（婆罗米系）的**元音附标文字（abugida / alphasyllabary）**。每个辅音字母自带**固有元音** *a*，由四个元音符号改变：

| 元音符号 | 转写 | IPA（默认固有元音） |
| --- | --- | --- |
| （无） | a | /a/ |
| ི | i | /i/ |
| ུ | u | /u/ |
| ེ | e | /e/ |
| ོ | o | /o/ |

**基字**（མིང་གཞི）是承载元音的辅音。围绕基字最多还可书写六个正字法位置，共同构成一个（最大）结构如下的音节：

```
[前置字] [上加字] 基字 [下加字] [元音] [后加字] [再后加字]
```

| 槽位 | 藏文名称 | 字母举例 | 古藏语中的功能 |
| --- | --- | --- | --- |
| 前置字 | སྔོན་འཇུག | ག ད བ མ འ | 声母复辅音成分 |
| 上加字 | མགོ་ཅན | ར ལ ས | 声母复辅音成分 |
| **基字** | མིང་གཞི | 三十个辅音 | 音节（辅音）核心 |
| 下加字 | འདོགས་ཅན | ྱ ྲ ླ ྭ | 介音/复辅音 |
| 元音 | དབྱངས | ི ུ ེ ོ（或无） | 元音音质 |
| 后加字 | རྗེས་འཇུག | ག ང ད ན བ མ འ ར ལ ས | 韵尾 |
| 再后加字 | ཡང་འཇུག | ད ས | 第二韵尾成分 |

三十个基字为：

```
ཀ ཁ ག ང ཅ ཆ ཇ ཉ ཏ ཐ ད ན པ ཕ བ མ ཙ ཚ ཛ ཝ ཞ ཟ འ ཡ ར ལ ཤ ས ཧ ཨ
```

音节之间以音节符 `་`（*tsheg*，U+0F0B）分隔。这套丰富、可承载复辅音的结构，正是 G2P 的关键：文字保留了一套古藏语音系，而各方言口语对其进行了不同的重塑。

### 2. 三大方言

#### 2.1 卫藏（དབུས་གཙང）——拉萨

拉萨（标准）话**有声调**。常见的双调域分析区分**高调**与**低调**，再按音节类型（长短/促声韵尾）细分；本工具用五度制数字表示（见 [`g2p-rules.md`](g2p-rules.md)）。

相对书面形式的主要音变：

- **浊塞音/塞擦音清化**：ག→[kʰ]、ད→[tʰ]、བ→[pʰ]、ཇ→[tɕʰ]、ཛ→[tsʰ]（历史浊音由声调标记）。
- **前置字、上加字作为音段不发音**，但决定基字的声调与送气。
- 下加字 ྱ 引起**腭化**：ཀྱ/ཁྱ/གྱ→[c/cʰ]，པྱ/ཕྱ/བྱ/མྱ→[tɕ/tɕʰ]。
- 下加字 ྲ 引起**卷舌化**：ཀྲ/ཏྲ/པྲ 等→[ʈ/ʈʰ]。
- **韵尾引起的变音与鼻化**：后加字 ད ན ལ ས 使元音前化/圆唇化（a→ɛ、o→ø、u→y），ན 增加鼻化；ག ད ས 产生喉塞韵尾 [ʔ]。

#### 2.2 康巴（ཁམས）——德格

康巴**有声调**，但音系上介于卫藏与安多之间。相对拉萨：

- 声调通常是更简单的**高/低**对立（本工具写作 55/13，浊韵尾前为 53/33）。
- 部分历史复辅音在不同程度上保留；本工具把前置字/上加字处理为对基字送气的贡献，而非完整音段。
- 下加字 ྱ 产生 [tɕ] 类腭音，ྲ 产生 [ʈʂ] 类卷舌塞擦音。
- 韵尾引起的变音存在但更有限（ད ན ས 前 a→ɛ、o→ø、u→y）。

#### 2.3 安多（ཨ་མདོ）——拉卜楞

安多**无声调**：以重音/音高重音而非音位声调，故其输出不含声调数字。它也是最保守的方言：

- **浊塞音保留**：ག→[ɡ]、ད→[d]、བ→[b]、ཇ→[dʑ]、ཛ→[dz]。
- **前置字、上加字发音**：ག→[ɣ]、ད→[d]、བ→[v]、མ→[m]、འ→[ʁ]；ར→[r]、ལ→[l]、ས→[s]。
- 下加字 ྱ 加 [j]，ྲ 加 [ʐ]，ླ 表现为 [l]。
- 后加字表现为可听见的韵尾：ག→[k]、ང→[ŋ]、ད→[t]、ན→[n]、བ→[p]、མ→[m]、ར→[r]、ལ→[l]、ས→[x]。

因此安多的映射远更接近透明的“字母到读音”直读——这是一个很有用的性质，因为安多语音数据最稀缺，规则式前端在那里最能发挥杠杆作用。

### 3. 对 G2P 的意义

由于**同一个书面串**在各方言中有不同解读，藏语 G2P 必须：

1. **把正字法解析为槽位**，而不是把字符串当作扁平字符序列；
2. 对同一解析**应用分方言规则**：
   - 卫藏/康巴：声调与送气逻辑 + 元音变音，复辅音大多中和；
   - 安多：复辅音实现 + 浊音保留，无声调；
3. **输出音位转写**，其音素表与约定需有明确文档（见 [`g2p-rules.md`](g2p-rules.md)）。

这正是 `tibetan-three-dialects-g2p` 的设计。
