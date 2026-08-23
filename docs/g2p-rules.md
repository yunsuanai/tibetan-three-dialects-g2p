# G2P Rules, Phone Inventory, and Output Format

> 中文版见下方「中文版」一节。 / A Chinese version is provided in the "中文版" section below.

This document specifies exactly what [`tibetan-three-dialects-g2p.js`](../tibetan-three-dialects-g2p.js) computes. It is the normative reference for anyone auditing, correcting, or extending the rules. The symbols used are a simplified, IPA-like phone set (not a claim about any single phonological analysis).

---

## 1. Pipeline

```
input text
  → tokenize into syllables (split on ་ and punctuation, de-duplicate)
  → parse each syllable into orthographic slots
  → apply dialect-specific rules (Ü-Tsang / Khams / Amdo)
  → serialize to MFA lexicon format
```

---

## 2. Orthographic slots

Each syllable is decomposed into the following slots (see [`phonology.md`](phonology.md) for terminology):

| Slot | Letters recognized by the parser |
| --- | --- |
| prefix (前置字) | ག ད བ མ འ |
| superscript (上加字) | ར ལ ས |
| root (基字) | the 30 consonants (see below) |
| subscript (下加字) | ྱ ྲ ླ ྭ |
| vowel (元音) | (inherent a) ི→i ུ→u ེ→e ོ→o |
| suffix (后加字) | ག ང ད ན བ མ འ ར ལ ས |
| post-suffix (再后加字) | ད ས |

The 30 root consonants:

```
ཀ ཁ ག ང ཅ ཆ ཇ ཉ ཏ ཐ ད ན པ ཕ བ མ ཙ ཚ ཛ ཝ ཞ ཟ འ ཡ ར ལ ཤ ས ཧ ཨ
```

The parser assigns slots with simple length- and membership-based heuristics (1–4+ non-subscript consonant letters). These heuristics are deliberately minimal and are the main known source of error on ambiguous or rare spellings.

---

## 3. Phone inventory

**Consonants** (union across all three dialects):

```
k kʰ ɡ ŋ  c cʰ  tɕ tɕʰ dʑ ɲ  t tʰ d n  p pʰ b m
ts tsʰ dz  w  ʈ ʈʰ ʈʂ ʈʂʰ  ɕ ʑ s z  h  ʔ  r l  j
ɣ v ʁ ʐ x
```

**Vowels**: `a i u e o` plus umlauted `ɛ ø y`; nasalized variants carry a tilde (`ã ẽ ĩ õ ũ ɛ̃ ø̃ ỹ`).

**Tone digits** are appended to the vowel phone:
- Ü-Tsang: `55 53 14 12`
- Khams: `55 53 13 33`
- Amdo: none (non-tonal).

---

## 4. Root-consonant tables

### 4.1 Ü-Tsang & Khams shared table

Each root maps to `[phone, high_tone, aspirated]`:

| Root | phone | high | asp | | Root | phone | high | asp |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ཀ | k | 1 | 0 | | པ | p | 1 | 0 |
| ཁ | kʰ | 1 | 1 | | ཕ | pʰ | 1 | 1 |
| ག | kʰ | 0 | 1 | | བ | pʰ | 0 | 1 |
| ང | ŋ | 0 | 0 | | མ | m | 0 | 0 |
| ཅ | tɕ | 1 | 0 | | ཙ | ts | 1 | 0 |
| ཆ | tɕʰ | 1 | 1 | | ཚ | tsʰ | 1 | 1 |
| ཇ | tɕʰ | 0 | 1 | | ཛ | tsʰ | 0 | 1 |
| ཉ | ɲ | 0 | 0 | | ཝ | w | 0 | 0 |
| ཏ | t | 1 | 0 | | ཞ | ɕ | 0 | 0 |
| ཐ | tʰ | 1 | 1 | | ཟ | s | 0 | 0 |
| ད | tʰ | 0 | 1 | | འ | ʔ | 0 | 0 |
| ན | n | 0 | 0 | | ཡ | j | 0 | 0 |
| ཤ | ɕ | 1 | 0 | | ར | r | 0 | 0 |
| ས | s | 1 | 0 | | ལ | l | 0 | 0 |
| ཧ | h | 1 | 1 | | ཨ | ʔ | 1 | 0 |

### 4.2 Amdo table

Amdo maps roots directly to phones (no tone/aspiration flags):

```
ཀ k   ཁ kʰ  ག ɡ   ང ŋ   ཅ tɕ  ཆ tɕʰ ཇ dʑ  ཉ ɲ
ཏ t   ཐ tʰ  ད d   ན n   པ p   ཕ pʰ  བ b   མ m
ཙ ts  ཚ tsʰ ཛ dz  ཝ w   ཞ ʑ   ཟ z   འ ʁ   ཡ j
ར r   ལ l   ཤ ɕ   ས s   ཧ h   ཨ ʔ
```

---

## 5. Dialect rules

### 5.1 Ü-Tsang (Lhasa)

1. **Prefix/superscript neutralization** — if a prefix or superscript is present and the root is low-tone, the syllable becomes high-tone and aspiration is removed (`kʰ→k`, etc.).
2. **Subscript ྱ (palatalization)** — ཀ ཁ ག → `c/cʰ`; པ ཕ བ མ → `tɕ/tɕʰ` (aspiration retained only when no prefix/superscript).
3. **Subscript ྲ (retroflexion)** — ཀ ཁ ག ཏ ཐ ད པ ཕ བ → `ʈ/ʈʰ` (same aspiration condition).
4. **Coda-driven umlaut** — suffix ད ན ལ ས triggers `a→ɛ, o→ø, u→y`; suffix ན adds nasalization `˜`.
5. **Suffix codas** — ག→`ʔ`, ང→`ŋ`, མ→`m`, བ→`p`, ར→`r`; ད ས→`ʔ` (checked). The glottal coda is **not** emitted as a segment; it is signaled by the checked tone.
6. **Tone** —
   - high: `55` (open), `53` (checked `ʔ`/`p`)
   - low: `14` (open), `12` (checked `ʔ`/`p`)

### 5.2 Khams (Dergé)

1. Prefix/superscript contribute a pre-aspiration `ʰ`.
2. **Subscript ྱ** — `k`/`p`-initial roots → `tɕ`; otherwise append `j`.
3. **Subscript ྲ** — → `ʈʂ/ʈʂʰ` (aspirated roots).
4. **Umlaut** — `a→ɛ, o→ø, u→y` before ད ན ས.
5. **Tone** — high `55`/low `13`; before ག བ ད → high `53`/low `33`.
6. **Coda** — ང→`ŋ`, མ→`m`, ར→`r`, ལ→`l`.

### 5.3 Amdo (Labrang, non-tonal)

1. **Prefixes** surface: ག→`ɣ`, ད→`d`, བ→`v`, མ→`m`, འ→`ʁ`.
2. **Superscripts** surface: ར→`r`, ལ→`l`, ས→`s`.
3. **Root** from the Amdo table (voiced retained).
4. **Subscript** — ྱ adds `j`, ྲ adds `ʐ`, ླ → `l`.
5. **Suffixes** surface: ག→`k`, ང→`ŋ`, ད→`t`, ན→`n`, བ→`p`, མ→`m`, ར→`r`, ལ→`l`, ས→`x`.
6. **No tone digits**.

---

## 6. Output format (MFA lexicon)

One entry per line, `<syllable><TAB><phone1> <phone2> ...`. Phones are space-separated; tone digits are attached to the vowel phone.

Worked example — input `ཁྱོད་རང་གང་དུ་ཡོད།`:

**Ü-Tsang (Lhasa):**

```
ཁྱོད	cʰ ø53
རང	r a14 ŋ
གང	kʰ a14 ŋ
དུ	tʰ u14
ཡོད	j ø12
```

**Khams (Dergé):**

```
ཁྱོད	tɕ ø53
རང	r a13 ŋ
གང	kʰ a13 ŋ
དུ	tʰ u13
ཡོད	j ø33
```

**Amdo (Labrang, non-tonal):**

```
ཁྱོད	kʰj o t
རང	r a ŋ
གང	ɡ a ŋ
དུ	d u
ཡོད	j o t
```

The three panels can be concatenated directly into one MFA `.txt` dictionary file. MFA accepts any consistent phone set; the symbols above are plain Unicode IPA characters.

---

## 7. Known limitations of the rules

- The syllable-slot parser uses membership/length heuristics. It correctly handles prefix+root, superscript+root, and root+suffix sequences, but two-letter syllables whose letters belong to overlapping sets remain genuinely ambiguous — e.g. མད (prefix མ + root ད) vs དག (root ད + suffix ག) — and are conservatively read as root + suffix; a lexicon is needed for full disambiguation.
- Lexical exceptions and loanwords are not modeled.
- No cross-syllable sandhi, and no handling of ་ -attached particles' contextual readings.
- Amdo stress and vowel quality are simplified; Ü-Tsang/Khams tone digits are a reduced Chao scheme, not a full prosodic transcription.

See the README [limitations](../README.md#limitations-and-disclaimer) section.

---

## 中文版

### 1. 流程

```
输入文本
  → 切分为音节（按 ་ 与标点切分，去重）
  → 解析每个音节的正字法槽位
  → 应用分方言规则（卫藏 / 康巴 / 安多）
  → 序列化为 MFA 词典格式
```

### 2. 正字法槽位

| 槽位 | 解析器识别的字母 |
| --- | --- |
| 前置字 | ག ད བ མ འ |
| 上加字 | ར ལ ས |
| 基字 | 三十个辅音（见下） |
| 下加字 | ྱ ྲ ླ ྭ |
| 元音 | （固有 a）ི→i ུ→u ེ→e ོ→o |
| 后加字 | ག ང ད ན བ མ འ ར ལ ས |
| 再后加字 | ད ས |

三十个基字：`ཀ ཁ ག ང ཅ ཆ ཇ ཉ ཏ ཐ ད ན པ ཕ བ མ ཙ ཚ ཛ ཝ ཞ ཟ འ ཡ ར ལ ཤ ས ཧ ཨ`。

解析器用简单的长度与成员关系启发式来指派槽位，这是生僻或歧义拼写上的主要已知误差来源。

### 3. 音素表

**辅音**（三方言之并集）：

```
k kʰ ɡ ŋ  c cʰ  tɕ tɕʰ dʑ ɲ  t tʰ d n  p pʰ b m
ts tsʰ dz  w  ʈ ʈʰ ʈʂ ʈʂʰ  ɕ ʑ s z  h  ʔ  r l  j
ɣ v ʁ ʐ x
```

**元音**：`a i u e o` 加变音 `ɛ ø y`；鼻化变体带波浪号（`ã ẽ ĩ õ ũ ɛ̃ ø̃ ỹ`）。

**声调数字**附加在元音音素上：卫藏 `55 53 14 12`；康巴 `55 53 13 33`；安多无声调。

### 4. 基字表

#### 4.1 卫藏与康巴共用表（[音素, 高调, 送气]）

| 基字 | 音素 | 高 | 送 | | 基字 | 音素 | 高 | 送 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ཀ | k | 1 | 0 | | པ | p | 1 | 0 |
| ཁ | kʰ | 1 | 1 | | ཕ | pʰ | 1 | 1 |
| ག | kʰ | 0 | 1 | | བ | pʰ | 0 | 1 |
| ང | ŋ | 0 | 0 | | མ | m | 0 | 0 |
| ཅ | tɕ | 1 | 0 | | ཙ | ts | 1 | 0 |
| ཆ | tɕʰ | 1 | 1 | | ཚ | tsʰ | 1 | 1 |
| ཇ | tɕʰ | 0 | 1 | | ཛ | tsʰ | 0 | 1 |
| ཉ | ɲ | 0 | 0 | | ཝ | w | 0 | 0 |
| ཏ | t | 1 | 0 | | ཞ | ɕ | 0 | 0 |
| ཐ | tʰ | 1 | 1 | | ཟ | s | 0 | 0 |
| ད | tʰ | 0 | 1 | | འ | ʔ | 0 | 0 |
| ན | n | 0 | 0 | | ཡ | j | 0 | 0 |
| ཤ | ɕ | 1 | 0 | | ར | r | 0 | 0 |
| ས | s | 1 | 0 | | ལ | l | 0 | 0 |
| ཧ | h | 1 | 1 | | ཨ | ʔ | 1 | 0 |

#### 4.2 安多表（直接映射，无声调/送气标记）

```
ཀ k   ཁ kʰ  ག ɡ   ང ŋ   ཅ tɕ  ཆ tɕʰ ཇ dʑ  ཉ ɲ
ཏ t   ཐ tʰ  ད d   ན n   པ p   ཕ pʰ  བ b   མ m
ཙ ts  ཚ tsʰ ཛ dz  ཝ w   ཞ ʑ   ཟ z   འ ʁ   ཡ j
ར r   ལ l   ཤ ɕ   ས s   ཧ h   ཨ ʔ
```

### 5. 分方言规则

#### 5.1 卫藏（拉萨）

1. 有前置字/上加字且基字为低调时，音节变高调并去送气（`kʰ→k` 等）。
2. 下加字 ྱ（腭化）：ཀ ཁ ག → `c/cʰ`；པ ཕ བ མ → `tɕ/tɕʰ`（仅无前置/上加时保留送气）。
3. 下加字 ྲ（卷舌化）：ཀ ཁ ག ཏ ཐ ད པ ཕ བ → `ʈ/ʈʰ`（送气条件同上）。
4. 韵尾变音：后加字 ད ན ལ ས 触发 `a→ɛ, o→ø, u→y`；ན 加鼻化 `˜`。
5. 后加字韵尾：ག→`ʔ`、ང→`ŋ`、མ→`m`、བ→`p`、ར→`r`；ད ས→`ʔ`（促声）。喉塞韵尾不作为音段输出，而以促声调表示。
6. 声调：高 `55`（开）/`53`（促 `ʔ`/`p`）；低 `14`（开）/`12`（促）。

#### 5.2 康巴（德格）

1. 前置字/上加字贡献前送气 `ʰ`。
2. 下加字 ྱ：`k`/`p` 起首基字 → `tɕ`；否则加 `j`。
3. 下加字 ྲ：→ `ʈʂ/ʈʂʰ`（送气基字）。
4. 变音：ད ན ས 前 `a→ɛ, o→ø, u→y`。
5. 声调：高 `55`/低 `13`；ག བ ད 前 → 高 `53`/低 `33`。
6. 韵尾：ང→`ŋ`、མ→`m`、ར→`r`、ལ→`l`。

#### 5.3 安多（拉卜楞，无声调）

1. 前置字发音：ག→`ɣ`、ད→`d`、བ→`v`、མ→`m`、འ→`ʁ`。
2. 上加字发音：ར→`r`、ལ→`l`、ས→`s`。
3. 基字取安多表（保留浊音）。
4. 下加字：ྱ 加 `j`，ྲ 加 `ʐ`，ླ → `l`。
5. 后加字发音：ག→`k`、ང→`ŋ`、ད→`t`、ན→`n`、བ→`p`、མ→`m`、ར→`r`、ལ→`l`、ས→`x`。
6. 无声调数字。

### 6. 输出格式（MFA 词典）

每行一条：`<音节><TAB><音素1> <音素2> ...`。音素以空格分隔，声调数字附在元音音素上。

示例——输入 `ཁྱོད་རང་གང་དུ་ཡོད།`：

**卫藏（拉萨）：**

```
ཁྱོད	cʰ ø53
རང	r a14 ŋ
གང	kʰ a14 ŋ
དུ	tʰ u14
ཡོད	j ø12
```

**康巴（德格）：**

```
ཁྱོད	tɕ ø53
རང	r a13 ŋ
གང	kʰ a13 ŋ
དུ	tʰ u13
ཡོད	j ø33
```

**安多（拉卜楞，无声调）：**

```
ཁྱོད	kʰj o t
རང	r a ŋ
གང	ɡ a ŋ
དུ	d u
ཡོད	j o t
```

三个面板可直接合并为一个 MFA `.txt` 词典文件。MFA 接受任意一致的音素集，上述符号均为纯 Unicode IPA 字符。

### 7. 规则的已知局限

- 音节槽位解析使用成员/长度启发式，已能正确区分“前置字+基字”“上加字+基字”“基字+后加字”等结构；但当两个字母同属多个集合时（如 མད 是“前置字 མ + 基字 ད”，而 དག 是“基字 ད + 后加字 ག”）仍存在固有歧义，暂按“基字+后加字”保守处理，需借助词典才能完全消歧。
- 未建模词汇例外与借词。
- 无跨音节连读，也不处理 `་` 所连虚词的语境读音。
- 安多重音与元音音质作了简化；卫藏/康巴声调数字为简化五度制，非完整韵律转写。

见 README 的[局限说明](../README.zh-CN.md#局限与免责声明)。
