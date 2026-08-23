# 藏文三大方言 G2P · Tibetan Three Dialects G2P

**Rule-based Grapheme-to-Phoneme (G2P) for the three major Tibetan dialects — Ü-Tsang (Lhasa), Khams (Dergé), and Amdo (Labrang) — with Montreal Forced Aligner (MFA) lexicon output.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Language](https://img.shields.io/badge/Language-JavaScript-efd81d.svg)](tibetan-three-dialects-g2p.js)
[![Status](https://img.shields.io/badge/Status-Prototype-orange.svg)](#limitations-and-disclaimer)

**Languages / 语言：** English · [中文](./README.zh-CN.md)



---

## Overview

**Tibetan Three Dialects G2P** (藏文三大方言 G2P) is a lightweight, **rule-based** grapheme-to-phoneme converter for written Tibetan. Given a sentence of standard Tibetan orthography, it produces a pronunciation dictionary in the **Montreal Forced Aligner (MFA) lexicon format** for all three major dialect groups at once:

| Dialect group | Representative variety | Prosodic type |
| --- | --- | --- |
| **Ü-Tsang** (དབུས་གཙང) | Lhasa (ལྷ་ས) | Tonal |
| **Khams** (ཁམས) | Dergé (སྡེ་དགེ) | Tonal |
| **Amdo** (ཨ་མདོ) | Labrang (བླ་བྲང) | Non-tonal (stress/pitch-accent) |

The engine is a small, dependency-free JavaScript module ([`tibetan-three-dialects-g2p.js`](tibetan-three-dialects-g2p.js)) that runs both in the browser and in Node.js. A bilingual interactive demo ([`index.html`](index.html)) and a command-line interface ([`cli.js`](cli.js)) are included. The project is intended as a **transparent, auditable front-end baseline** for Tibetan TTS, forced alignment, and speech-corpus construction — not as a replacement for human linguistic review.

---

## Why Tibetan G2P matters

### The state of Tibetan TTS today

Tibetan is a **low-resource language** in speech technology. The available parallel speech corpora are small and heavily concentrated on the Lhasa/Ü-Tsang variety, while Khams and Amdo data remain scarce ([Tibetan Language and AI: A Comprehensive Survey](https://arxiv.org/abs/2510.19144)). The three dialect groups differ substantially in phonology, lexicon, and prosody — Lhasa is tonal, Amdo is non-tonal and preserves archaic consonant clusters — so a system built for one variety does not transfer to the others.

Until recently, most Tibetan speech-synthesis work targeted a single variety. Multi-dialect and low-resource approaches have only begun to appear in the last few years, e.g. [End-to-End Speech Synthesis for Tibetan Multidialect (2021)](https://onlinelibrary.wiley.com/doi/10.1155/2021/6682871), [FMSD-TTS (2025)](https://arxiv.org/abs/2505.14351), [TMD-TTS (2025)](https://arxiv.org/abs/2509.18060), and [Tibetan-TTS (2026)](https://arxiv.org/abs/2605.02496). A recurring theme in this literature is the need for **accurate pronunciation lexicons and front-ends**, precisely because recorded audio is the bottleneck.

### The importance of G2P

G2P converts orthographic text into phonemic transcription (here, an IPA-like phone sequence) and is the backbone of the TTS **text front-end**: text normalization → G2P → prosody/tone prediction → acoustic model. For forced alignment, G2P produces the pronunciation dictionary that maps each written form to its phone sequence — without which MFA and corpus building cannot proceed.

The challenge is amplified for Tibetan because **the writing system is a deep orthography**. Literary Tibetan has remained conservative for over a millennium: the script encodes historical consonant clusters (prefixes, superscripts, subscripts, suffixes, post-suffixes) that have been simplified, devoiced, or deleted in the modern spoken dialects. The same written syllable therefore has **different — but highly systematic — pronunciations in each dialect**, and there is no simple one-to-one grapheme-to-phone mapping. A dialect-aware, rule-based G2P is the most transparent way to capture this knowledge, and it requires **no training data**, making it an ideal baseline and bootstrap for learned models.

For a fuller discussion, see [`docs/background.md`](docs/background.md).

---

## Features

- **Three dialects in one pass** — one input string yields Ü-Tsang, Khams, and Amdo pronunciations simultaneously.
- **MFA-ready output** — emits the standard two-column `word<TAB>phone phone phone` lexicon format.
- **Linguistically grounded syllable parser** — decomposes each syllable into its orthographic slots (prefix, superscript, root, subscript, vowel, suffix, post-suffix).
- **Dialect-specific sound-change rules** — tone assignment and vowel umlaut (Ü-Tsang/Khams), cluster realization (Amdo), palatalization, and retroflexion.
- **Zero dependencies, zero setup** — a browser demo and a Node CLI; both run offline.
- **Deterministic and auditable** — every rule is explicit in the source, so output can be inspected and corrected.

---

## Quick start

### Browser demo

Open [`index.html`](index.html) in any modern browser (no build step, no server required), paste Tibetan text, and copy the three output panels into your MFA dictionary.

### Command line

```bash
git clone https://github.com/Khepa-Nyima/tibetan-three-dialects-g2p.git
cd tibetan-three-dialects-g2p
node cli.js "ཁྱོད་རང་གང་དུ་ཡོད།"
```

Or pipe from stdin and filter by dialect:

```bash
echo "ཁྱོད་རང་གང་དུ་ཡོད།" | node cli.js --dialect amdo
```

### Library

```js
const { generate } = require('./tibetan-three-dialects-g2p.js');
const res = generate('ཁྱོད་རང་གང་དུ་ཡོད།');
console.log(res.utsang.join('\n'));  // Ü-Tsang lexicon lines
```

> **GitHub Pages:** the demo is published at <https://Khepa-Nyima.github.io/tibetan-three-dialects-g2p/> (served directly from the `main` branch).

---

## Usage

### Input

Any Unicode Tibetan text. Syllables are split on the inter-syllabic mark `་` (U+0F0B *tsheg*) and common punctuation. Duplicate syllables are de-duplicated in the output (a lexicon needs unique keys).

### Output format

Each output is a valid MFA dictionary fragment — one entry per line:

```
<orthographic syllable><TAB><phone1> <phone2> <phone3> ...
```

Example for `ཁྱོད་རང་གང་དུ་ཡོད།` (actual tool output):

```
# Ü-Tsang (Lhasa)
ཁྱོད	cʰ ø53
རང	r a14 ŋ
གང	kʰ a14 ŋ
དུ	tʰ u14
ཡོད	j ø12

# Khams (Dergé)
ཁྱོད	tɕ ø53
རང	r a13 ŋ
གང	kʰ a13 ŋ
དུ	tʰ u13
ཡོད	j ø33

# Amdo (Labrang, non-tonal)
ཁྱོད	kʰj o t
རང	r a ŋ
གང	ɡ a ŋ
དུ	d u
ཡོད	j o t
```

> The exact output depends on the rule tables in [`tibetan-three-dialects-g2p.js`](tibetan-three-dialects-g2p.js); see [`docs/g2p-rules.md`](docs/g2p-rules.md) for the full phone inventory, tone-digit convention, and mapping tables.

### In your pipeline

- **MFA**: concatenate the outputs into a single `.txt` dictionary and reference it with `mfa align ... --dictionary_path`.
- **TTS (VITS, Tacotron, FastSpeech, etc.)**: use the phone sequences as the phoneme sequence of your front-end.
- **Corpus building**: run the tool over a large text corpus to draft a pronunciation lexicon, then have a linguist correct the entries.

---

## Methodology (summary)

1. **Tokenization** — split the text into syllables on `་` and punctuation.
2. **Orthographic parsing** — decompose each syllable into its seven possible slots: prefix, superscript, root (base letter), subscript, vowel, suffix, post-suffix.
3. **Dialect mapping** —
   - **Ü-Tsang** and **Khams** share a root-consonant table carrying tone and aspiration flags, but differ in cluster simplification, tone assignment, and vowel umlaut.
   - **Amdo** uses a separate table (voiced consonants retained, no tone) and realizes prefixes and superscripts as audible consonants.
4. **Serialization** — emit the phone sequence in MFA lexicon format.

Full details: [`docs/phonology.md`](docs/phonology.md) (writing system and dialect phonology) and [`docs/g2p-rules.md`](docs/g2p-rules.md) (rule tables and conventions).

---

## Limitations and disclaimer

This is an **academic rule-based simulation**, not a production front-end.

- The output represents **idealized written-form readings**, not the pronunciation of any specific speaker or recording. It may not reflect real speech audio.
- Rules are **first approximations** of well-documented sound changes; they do not cover all lexical exceptions, loanwords, sandhi across syllable boundaries, or dialect-internal variation.
- The results are a **draft for human review**. For formal MFA/VITS training, a trained linguist **must** verify and correct the lexicons.
- Tone digits use a simplified Chao-number convention and are **not** a claim about any single phonetic analysis of Lhasa/Khams tone.

Contributions that improve rule coverage or add lexical exceptions are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Project structure

```
.
├── tibetan-three-dialects-g2p.js  # The G2P engine (browser + Node.js, dependency-free)
├── cli.js                         # Command-line interface
├── index.html                     # Bilingual interactive demo (GitHub Pages entry)
├── package.json                   # npm metadata
├── test/
│   └── smoke.js                   # Worked-example smoke test
├── .github/
│   └── workflows/                 # CI (smoke test)
├── docs/
│   ├── background.md              # Tibetan TTS landscape and why G2P matters
│   ├── phonology.md               # Tibetan writing system and the three dialect phonologies
│   └── g2p-rules.md               # Full rule tables, phone inventory, output conventions
├── README.md                      # This file (English)
├── README.zh-CN.md                # 中文说明
├── CONTRIBUTING.md                # Contribution guide
├── CITATION.cff                   # Citation metadata
└── LICENSE                        # Apache License 2.0
```

---

## Roadmap

- [x] Extract the engine into a reusable module with a Node.js CLI.
- [ ] Add the full 30-consonant × vowel × cluster coverage matrix with test fixtures.
- [ ] Add a learned (sequence-to-sequence / transformer) G2P for comparison against the rule baseline.
- [ ] Expand dialect coverage (e.g., Dege vs. other Khams varieties; stress marking for Amdo).
- [ ] Add lexical exception lists and a corpus-derived pronunciation dictionary.
- [ ] Package as an npm library and a pip-installable front-end adapter.

---

## Contributing

Bug reports, rule corrections, and new language data are all welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. This project uses the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct; be kind and constructive.

---

## License

[Apache License 2.0](LICENSE) © [Khepa-Nyima](https://github.com/Khepa-Nyima) and contributors.

---

## Citation

If you use this tool in research, please cite it. A ready-to-use [CITATION.cff](CITATION.cff) is provided, or use:

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

## References

- Huang & Tashi et al. — *Tibetan Language and AI: A Comprehensive Survey of Resources, Methods and Challenges*. [arXiv:2510.19144](https://arxiv.org/abs/2510.19144)
- *TMD-TTS: A Unified Tibetan Multi-Dialect Text-to-Speech Synthesis for Ü-Tsang, Amdo and Kham Speech Dataset Generation*. [arXiv:2509.18060](https://arxiv.org/abs/2509.18060)
- *FMSD-TTS: Few-shot Multi-Speaker Multi-Dialect Text-to-Speech Synthesis for Ü-Tsang, Amdo and Kham Speech Dataset Generation*. [arXiv:2505.14351](https://arxiv.org/abs/2505.14351)
- *Tibetan-TTS: Low-Resource Tibetan Speech Synthesis with Large Model Adaptation*. [arXiv:2605.02496](https://arxiv.org/abs/2605.02496)
- *End-to-End Speech Synthesis for Tibetan Multidialect*. Hindawi/Wiley, 2021. [DOI 10.1155/2021/6682871](https://onlinelibrary.wiley.com/doi/10.1155/2021/6682871)
- 西藏藏语言文字网 — 《藏语方言》与《藏语语音结构》 (Tibetan dialect and phonetic-structure references).
