# G2P Rules, Phone Inventory, and Output Format

> 中文版见下方「中文版」一节。 / A Chinese version is provided in the "中文版" section below.

This document specifies exactly what [`tibetan-three-dialects-g2p.js`](../tibetan-three-dialects-g2p.js) (v3.7.0) computes. It is the normative reference for anyone auditing, correcting, or extending the rules. The symbols used are a simplified, IPA-like phone set (not a claim about any single phonological analysis).

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

The parser peels the post-suffix, suffix, and vowel sign from the right, then parses the remaining head (prefix, superscript, root, subscript) from the left, with a backtrack when nothing remains. Two rules are central:

- **Subjoined-root normalization** — stacked (subjoined) root forms (U+0F90 range) are normalized to their full root forms; the medial subscripts ྱ ྲ ླ are recorded separately, and ྭ (wazur) is recorded on its own so a leading medial is never overwritten.
- **Two-letter disambiguation ("suffix-first" rule)** — for a two-consonant syllable with no vowel sign, if the second letter is a suffix letter it is read as **root + suffix**; the closed set དབ / འག / འད / འབ / མག is read as **prefix + root**; otherwise a leading prefix letter yields **prefix + root**.

---

## 3. Phone inventory

**Consonants** (union across all three dialects):

```
k kʰ ɡ  c cʰ ɟ  t tʰ d  p pʰ b  ʔ
tɕ tɕʰ dʑ  ts tsʰ dz  ʈʂ ʈʂʰ ɖʐ  pɕ pɕʰ
ŋ ɲ n m
ɕ ʑ ʂ ʂʰ s z  h ɦ x ɣ  f v ɬ
w j  r l ʐ
```

**Vowels**: `a i u e o` plus umlauted `ɛ ø y`; nasalized variants carry a tilde (`ã ẽ ĩ õ ũ ɛ̃ ø̃ ỹ`); a length mark `ː` marks compensatory lengthening; `ʔ` is emitted as a glottal coda (checked tone).

**Tone digits** are appended to the vowel phone:
- Ü-Tsang: `55 53 14 12`
- Khams: `55 53 13 31`
- Amdo: none (non-tonal).

The `generate(text, { toneFormat: 'chao' })` option emits Chao tone letters instead (e.g. `a˥˥`, `a˩˨`).

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
ཙ ts  ཚ tsʰ ཛ dz  ཝ w   ཞ ʑ   ཟ z   འ ɦ   ཡ j
ར r   ལ l   ཤ ɕ   ས s   ཧ x   ཨ ʔ
```

---

## 5. Dialect rules

### 5.1 Ü-Tsang (Lhasa)

1. **ལྷ ligature** — superscript ལ + root ཧ → `ɬ` (high tone).
2. **དབ / དབྱ / དབྲ weakening** — prefix ད + root བ → `w` / `j` / `ʈʂ` (high tone, unaspirated).
3. **Prefix/superscript neutralization** — prefix འ de-aspirates a low-tone root but **keeps the low tone**; any other prefix/superscript de-aspirates and **raises the tone**. Native aspirated roots (ཁ ཐ ཕ) keep aspiration.
4. **Subscript ྱ** — ཀ ཁ ག → `tɕ/tɕʰ`; པ ཕ → `tɕ/tɕʰ`; བ → `tɕ` (with head) / `tɕʰ` (isolated); མ → `ɲ`.
5. **Subscript ྲ** — ཀ ཁ ག ཏ ཐ ད པ ཕ བ → `ʈʂ/ʈʂʰ` (retroflex affricate); ས → `s`; ཧ → `ʂʰ`.
6. **Subscript ླ** — ཟ → `t` (high tone); otherwise → `l`.
7. **Coda-driven umlaut** — suffix ད ན ལ ས triggers `a→ɛ, o→ø, u→y`; ན adds nasalization + length `ː`; ད ས add glottal `ʔ`; ལ adds length `ː`.
8. **Other codas** — ག→`ʔ`, ང→`ŋ`, མ→`m`, བ→`p`, ར→`ː`, འ→`ː`.
9. **Tone** — high `55` (open) / `53` (checked `ʔ`/`p`); low `14` (open) / `12` (checked). The glottal coda `ʔ` **is** emitted as a segment.

### 5.2 Khams (Dergé)

1. Root ཧ → `x` (velar fricative).
2. **ལྷ ligature** → `ɬ` (high tone).
3. **དབ / དབྱ / དབྲ weakening** → `w` / `j` / `ʈʂ` (high tone).
4. **Prefix/superscript neutralization** — as Ü-Tsang (no standalone pre-aspiration phone; aspiration merges into the onset).
5. **Subscript ྱ** — ཀ ཁ ག → `tɕ/tɕʰ`; པ ཕ བ → `pɕ/pɕʰ`; མ → `ɲ`.
6. **Subscript ྲ** — ཀ ཁ ག ཏ ཐ ད པ ཕ བ → `ʈʂ/ʈʂʰ`; ས → `s`; ཧ → `ʂʰ`.
7. **Subscript ླ** — ཟ → `t` (high tone); otherwise → `l`.
8. **Umlaut** — `a→ɛ` before ད ན ས.
9. **Tone** — 55 / 53 / 13 / 31; checked (入声) before ག བ ད ས.
10. **Coda** — ག→`k`, ང→`ŋ`, བ→`p`, མ→`m`, ར→`r`, ལ→`l`, ན→`n`, ད→`t`, ས→`ʔ`.

### 5.3 Amdo (Labrang, non-tonal)

1. **ལྷ ligature** → `ɬ`.
2. **དབ / དབྱ / དབྲ weakening** — prefix ད/ག + root བ → `v` / `j` / `v ʐ`.
3. **Prefixes** (assimilate to the immediately following consonant) — འ → prenasalization `m/ŋ/ɲ/n` by place; ག/ད → `x` before voiceless, `ɣ` before voiced; བ → `f` before voiceless, `v` before voiced; མ → `m`.
4. **Superscripts** surface: ར→`r`, ལ→`l`, ས→`s`.
5. **Subscript ྱ** — ཀ ཁ ག → `c/cʰ/ɟ`; པ ཕ བ → `c/cʰ/ɟ`; མ → `ɲ`; otherwise append `j`.
6. **Subscript ྲ** — ཀ ཁ ག ཏ ཐ ད → `ʈʂ/ʈʂʰ/ɖʐ`; པ ཕ བ → `p ʂ / pʰ ʂ / b ʐ`; ས → `ʂ`; ཧ → `ʂʰ`.
7. **Subscript ླ** — ཀ → `k ɬ`; ག → `ɣ l`; བ → `v l`; ཟ → `z d`; ས → `ɬ`; otherwise → `l`.
8. **Codas** — ག→`ɣ`, ང→`ŋ`, ད→`t`, ན→`n`, བ→`p`, མ→`m`, ར→`r`, ལ→`l`, ས→`s`; post-suffix ས→`s`, ད→`t`.
9. **No tone digits**. Clusters are split into atomic phones (MFA-alignable).

---

## 6. Output format (MFA lexicon)

One entry per line, `<syllable><TAB><phone1> <phone2> ...`. Phones are space-separated; tone digits are attached to the vowel phone.

Worked example — input `ཁྱོད་རང་གང་དུ་ཡོད།`:

**Ü-Tsang (Lhasa):**

```
ཁྱོད	tɕʰ ø53 ʔ
རང	r a14 ŋ
གང	kʰ a14 ŋ
དུ	tʰ u14
ཡོད	j ø12 ʔ
```

**Khams (Dergé):**

```
ཁྱོད	tɕʰ o53 t
རང	r a13 ŋ
གང	kʰ a13 ŋ
དུ	tʰ u13
ཡོད	j o31 t
```

**Amdo (Labrang, non-tonal):**

```
ཁྱོད	cʰ o t
རང	r a ŋ
གང	ɡ a ŋ
དུ	d u
ཡོད	j o t
```

The three panels can be concatenated directly into one MFA `.txt` dictionary file. MFA accepts any consistent phone set; the symbols above are plain Unicode IPA characters.

---

## 7. Known limitations of the rules

- Two-letter syllables without a written vowel are resolved by the "suffix-first" rule plus a closed exception set, so the earlier ambiguity is largely removed; residual cases remain only where a form can be read as either prefix+root or root+suffix outside the exception list — a lexicon is needed to resolve those.
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

解析器从右往左依次剥取再后加字、后加字与元音符号，再从左往右解析剩余音节头，无剩余时回溯。两条关键规则：

- **下加根字归一化**——堆叠的下加根字（U+0F90 段）还原为完整基字；介音 ྱ ྲ ླ 单独记录，ྭ（wazur）独立记录、不覆盖主介音。
- **双字母消歧（后加字优先铁律）**——无元音符号的双辅音音节，第二字属后加字时按「基字+后加字」读；封闭特例 དབ / འག / འད / འབ / མག 按「前加字+基字」读；其余首字为前加字时按「前加字+基字」读。

### 3. 音素表

**辅音**（三方言之并集）：

```
k kʰ ɡ  c cʰ ɟ  t tʰ d  p pʰ b  ʔ
tɕ tɕʰ dʑ  ts tsʰ dz  ʈʂ ʈʂʰ ɖʐ  pɕ pɕʰ
ŋ ɲ n m
ɕ ʑ ʂ ʂʰ s z  h ɦ x ɣ  f v ɬ
w j  r l ʐ
```

**元音**：`a i u e o` 加变音 `ɛ ø y`；鼻化变体带波浪号（`ã ẽ ĩ õ ũ ɛ̃ ø̃ ỹ`）；长音标记 `ː` 表补偿性延长；喉塞韵尾 `ʔ` 作为独立音段输出。

**声调数字**附加在元音音素上：卫藏 `55 53 14 12`；康巴 `55 53 13 31`；安多无声调。`generate(text, { toneFormat: 'chao' })` 可输出赵元任五度调号（如 `a˥˥`）。

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
ཙ ts  ཚ tsʰ ཛ dz  ཝ w   ཞ ʑ   ཟ z   འ ɦ   ཡ j
ར r   ལ l   ཤ ɕ   ས s   ཧ x   ཨ ʔ
```

### 5. 分方言规则

#### 5.1 卫藏（拉萨）

1. ལྷ 合写（上加 ལ + 基字 ཧ）→ `ɬ`（高调）。
2. དབ / དབྱ / དབྲ 声母弱化（前加 ད + 基字 བ）→ `w` / `j` / `ʈʂ`（高调、不送气）。
3. 前置/上加中和律：前加 འ 去送气但**保低调**；其余前加/上加字去送气并**升高调**；原生送气基字 ཁ ཐ ཕ 保留送气。
4. 下加 ྱ：ཀ ཁ ག → `tɕ/tɕʰ`；པ ཕ → `tɕ/tɕʰ`；བ → `tɕ`（有头）/ `tɕʰ`（孤立）；མ → `ɲ`。
5. 下加 ྲ：ཀ ཁ ག ཏ ཐ ད པ ཕ བ → `ʈʂ/ʈʂʰ`（卷舌塞擦音）；ས → `s`；ཧ → `ʂʰ`。
6. 下加 ླ：ཟ → `t`（高调）；其余 → `l`。
7. 韵尾变音：ད ན ལ ས 触发 `a→ɛ, o→ø, u→y`；ན 加鼻化并延长 `ː`；ད ས 加喉塞 `ʔ`；ལ 加延长 `ː`。
8. 其余韵尾：ག→`ʔ`、ང→`ŋ`、མ→`m`、བ→`p`、ར→`ː`、འ→`ː`。
9. 声调：高 `55`（开）/ `53`（促）；低 `14`（开）/ `12`（促）。喉塞韵尾 `ʔ` **作为音段输出**。

#### 5.2 康巴（德格）

1. 基字 ཧ → `x`。
2. ལྷ 合写 → `ɬ`（高调）。
3. དབ / དབྱ / དབྲ 弱化 → `w` / `j` / `ʈʂ`（高调）。
4. 前置/上加中和律：同卫藏（不再输出孤立前送气音素 `ʰ`，送气并入声母）。
5. 下加 ྱ：ཀ ཁ ག → `tɕ/tɕʰ`；པ ཕ བ → `pɕ/pɕʰ`；མ → `ɲ`。
6. 下加 ྲ：ཀ ཁ ག ཏ ཐ ད པ ཕ བ → `ʈʂ/ʈʂʰ`；ས → `s`；ཧ → `ʂʰ`。
7. 下加 ླ：ཟ → `t`（高调）；其余 → `l`。
8. 变音：ད ན ས 前 `a→ɛ`。
9. 声调：`55 / 53 / 13 / 31`；ག བ ད ས 前为入声（促调）。
10. 韵尾：ག→`k`、ང→`ŋ`、བ→`p`、མ→`m`、ར→`r`、ལ→`l`、ན→`n`、ད→`t`、ས→`ʔ`。

#### 5.3 安多（拉卜楞，无声调）

1. ལྷ 合写 → `ɬ`。
2. དབ / དབྱ / དབྲ 弱化（前加 ད/ག + 基字 བ）→ `v` / `j` / `v ʐ`。
3. 前加字（按「紧邻第一辅音」清浊同化）：འ → 前鼻化 `m/ŋ/ɲ/n`；ག/ད → 清前 `x`、浊前 `ɣ`；བ → 清前 `f`、浊前 `v`；མ → `m`。
4. 上加字：ར→`r`、ལ→`l`、ས→`s`。
5. 下加 ྱ：ཀ ཁ ག → `c/cʰ/ɟ`；པ ཕ བ → `c/cʰ/ɟ`；མ → `ɲ`；其余加 `j`。
6. 下加 ྲ：ཀ ཁ ག ཏ ཐ ད → `ʈʂ/ʈʂʰ/ɖʐ`；པ ཕ བ → `p ʂ / pʰ ʂ / b ʐ`；ས → `ʂ`；ཧ → `ʂʰ`。
7. 下加 ླ：ཀ → `k ɬ`；ག → `ɣ l`；བ → `v l`；ཟ → `z d`；ས → `ɬ`；其余 → `l`。
8. 韵尾：ག→`ɣ`、ང→`ŋ`、ད→`t`、ན→`n`、བ→`p`、མ→`m`、ར→`r`、ལ→`l`、ས→`s`；再后加字 ས→`s`、ད→`t`。
9. 无声调数字；复辅音按音素级原子拆分（便于 MFA 对齐）。

### 6. 输出格式（MFA 词典）

每行一条：`<音节><TAB><音素1> <音素2> ...`。音素以空格分隔，声调数字附在元音音素上。

示例——输入 `ཁྱོད་རང་གང་དུ་ཡོད།`：

**卫藏（拉萨）：**

```
ཁྱོད	tɕʰ ø53 ʔ
རང	r a14 ŋ
གང	kʰ a14 ŋ
དུ	tʰ u14
ཡོད	j ø12 ʔ
```

**康巴（德格）：**

```
ཁྱོད	tɕʰ o53 t
རང	r a13 ŋ
གང	kʰ a13 ŋ
དུ	tʰ u13
ཡོད	j o31 t
```

**安多（拉卜楞，无声调）：**

```
ཁྱོད	cʰ o t
རང	r a ŋ
གང	ɡ a ŋ
དུ	d u
ཡོད	j o t
```

三个面板可直接合并为一个 MFA `.txt` 词典文件。MFA 接受任意一致的音素集，上述符号均为纯 Unicode IPA 字符。

### 7. 规则的已知局限

- 无元音符号的双字母音节由「后加字优先」铁律 + 封闭特例解决，此前的歧义已大幅消除；仅当词形在特例表之外仍可两读时（前加字+基字 vs 基字+后加字）需要词典消歧。
- 未建模词汇例外与借词。
- 无跨音节连读，也不处理 `་` 所连虚词的语境读音。
- 安多重音与元音音质作了简化；卫藏/康巴声调数字为简化五度制，非完整韵律转写。

见 README 的[局限说明](../README.zh-CN.md#局限与免责声明)。
