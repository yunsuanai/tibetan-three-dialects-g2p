/*!
 * tibetan-three-dialects-g2p — 藏文三大方言 G2P（grapheme-to-phoneme）规则转换引擎 v3.7.0
 *
 * 一次输入，同时输出三大方言（MFA lexicon 格式）：
 *   - utsang  卫藏（拉萨标准音）  有声调（55 / 53 / 12 / 14）
 *   - khams   康巴（德格标准音）  有声调（55 / 53 / 13 / 31）
 *   - amdo    安多（拉卜楞话）    无声调，完整保留古藏语复辅音
 *
 * 语言学级规则：正字法右剥定根 + 双字母「后加字优先」铁律 + 下加根字/介音区分 +
 * 卫藏卷舌塞擦音 ʈʂ、喉塞韵尾 ʔ、安多前加字清浊同化（f/v/x/ɣ）与鼻化（m/ŋ/ɲ/n）等。
 * 无任何依赖，可在 Node.js 与浏览器中运行（UMD）。
 *
 * Copyright 2026 Khepa-Nyima
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.tibetanThreeDialectsG2p = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERSION = '3.7.0';

  // ========== 1. 正字法常量表 ==========

  // 元音符号（无符号时为固有元音 a）
  const VOWELS = { 'ི': 'i', 'ུ': 'u', 'ེ': 'e', 'ོ': 'o' };

  // 下加介音（写在基字下方的 ཡ ར ལ ཝ）
  const SUBSCRIPTS = { 'ྱ': 'y', 'ྲ': 'r', 'ླ': 'l', 'ྭ': 'w' };

  // 下加根字（基字位于上加字下方时的 Unicode 下加形式）→ 还原为基字。
  const SUBJOINED_ROOT = {
    'ྐ': 'ཀ', 'ྑ': 'ཁ', 'ྒ': 'ག', 'ྔ': 'ང',
    'ྕ': 'ཅ', 'ྖ': 'ཆ', 'ྗ': 'ཇ', 'ྙ': 'ཉ',
    'ྟ': 'ཏ', 'ྠ': 'ཐ', 'ྡ': 'ད', 'ྣ': 'ན',
    'ྤ': 'པ', 'ྥ': 'ཕ', 'ྦ': 'བ', 'ྨ': 'མ',
    'ྩ': 'ཙ', 'ྪ': 'ཚ', 'ྫ': 'ཛ',
    'ྴ': 'ཤ', 'ྶ': 'ས', 'ྷ': 'ཧ', 'ྸ': 'ཨ'
  };

  // 前置字（写在基字前的辅音，读时多与基字合并）
  const PREFIXES = new Set(['ག', 'ད', 'བ', 'མ', 'འ']);
  // 上加字（写在基字上方的辅音，仅 ར ལ ས）
  const SUPERSCRIPTS = new Set(['ར', 'ལ', 'ས']);
  // 后加字（元音之后的韵尾辅音）
  const SUFFIXES = new Set(['ག', 'ང', 'ད', 'ན', 'བ', 'མ', 'འ', 'ར', 'ལ', 'ས']);
  // 再后加字（仅 ད ས，出现在部分后加字之后）
  const POST_SUFFIXES = new Set(['ད', 'ས']);

  // 清音基字（用于安多前加字清浊同化判定）
  const VOICELESS_ROOTS = new Set(['ཀ', 'ཁ', 'ཅ', 'ཆ', 'ཏ', 'ཐ', 'པ', 'ཕ', 'ཙ', 'ཚ', 'ཤ', 'ས', 'ཧ', 'ཨ']);

  // 双字母音节消歧铁律（《三十颂》）：第二字属后加字 → [基字 + 后加字]；
  // 仅封闭特例（无「基字+后加字」实词）读作 [前加字 + 基字]。
  const TWO_LETTER_PREFIX_EXCEPTIONS = new Set(['དབ', 'འག', 'འད', 'འབ', 'མག']);

  // 五度调值符号（Chao Tone Letters）映射，用于学术出版级音标输出
  const CHAO_TONE_MAP = {
    '55': '˥˥', '53': '˥˧', '14': '˩˦', '12': '˩˨', '13': '˩˧', '31': '˧˩'
  };

  // ========== 2. 基字音系表 ==========

  // 卫藏 / 康巴 共用基字表：[音素, 高调(1/0), 送气(1/0)]
  const UT_KHM_ROOT_MAP = {
    'ཀ': ['k', 1, 0], 'ཁ': ['kʰ', 1, 1], 'ག': ['kʰ', 0, 1], 'ང': ['ŋ', 0, 0],
    'ཅ': ['tɕ', 1, 0], 'ཆ': ['tɕʰ', 1, 1], 'ཇ': ['tɕʰ', 0, 1], 'ཉ': ['ɲ', 0, 0],
    'ཏ': ['t', 1, 0], 'ཐ': ['tʰ', 1, 1], 'ད': ['tʰ', 0, 1], 'ན': ['n', 0, 0],
    'པ': ['p', 1, 0], 'ཕ': ['pʰ', 1, 1], 'བ': ['pʰ', 0, 1], 'མ': ['m', 0, 0],
    'ཙ': ['ts', 1, 0], 'ཚ': ['tsʰ', 1, 1], 'ཛ': ['tsʰ', 0, 1], 'ཝ': ['w', 0, 0],
    'ཞ': ['ɕ', 0, 0], 'ཟ': ['s', 0, 0], 'འ': ['ʔ', 0, 0], 'ཡ': ['j', 0, 0],
    'ར': ['r', 0, 0], 'ལ': ['l', 0, 0], 'ཤ': ['ɕ', 1, 0], 'ས': ['s', 1, 0],
    'ཧ': ['h', 1, 1], 'ཨ': ['ʔ', 1, 0]
  };

  // 安多基字表：基字 → 音素（完整保留古藏语清浊对立，无声调）
  const AMD_ROOT_MAP = {
    'ཀ': 'k', 'ཁ': 'kʰ', 'ག': 'ɡ', 'ང': 'ŋ', 'ཅ': 'tɕ', 'ཆ': 'tɕʰ', 'ཇ': 'dʑ', 'ཉ': 'ɲ',
    'ཏ': 't', 'ཐ': 'tʰ', 'ད': 'd', 'ན': 'n', 'པ': 'p', 'ཕ': 'pʰ', 'བ': 'b', 'མ': 'm',
    'ཙ': 'ts', 'ཚ': 'tsʰ', 'ཛ': 'dz', 'ཝ': 'w', 'ཞ': 'ʑ', 'ཟ': 'z', 'འ': 'ɦ', 'ཡ': 'j',
    'ར': 'r', 'ལ': 'l', 'ཤ': 'ɕ', 'ས': 's', 'ཧ': 'x', 'ཨ': 'ʔ'
  };

  // ========== 3. 音节解析 ==========

  function cleanSyllable(syl) {
    syl = String(syl).trim();
    return syl.replace(/[\u0F0B\u0F0C\u0F0D\u0F0E\u0F0F\u0F04-\u0F0A\s]/g, '');
  }

  /**
   * 藏文正字法音节结构解析。
   * Unicode 逻辑顺序：[前置字] [上加字] [基字(可能下加)] [下加介音] [元音] [后加字] [再后加字]
   */
  function parseSyllable(syl) {
    const raw = cleanSyllable(syl);
    if (!raw) return null;

    let prefix = '', superscript = '', root = '', subscript = '', suffix = '', post_suffix = '';
    let has_wazur = false;
    let vowel = 'a';
    const chars = Array.from(raw);

    // ⓪ 双字母音节消歧铁律（《三十颂》）：第二字属后加字 → [基字 + 后加字]；
    //    仅封闭特例读作 [前加字 + 基字]；第二字非后加字且首字为前加字 → [前加字 + 基字]。
    if (chars.length === 2 && !VOWELS[chars[1]] && !SUBSCRIPTS[chars[1]] && !SUBJOINED_ROOT[chars[1]]) {
      const pair = chars.join('');
      if (TWO_LETTER_PREFIX_EXCEPTIONS.has(pair)) {
        return { raw, prefix: chars[0], super: '', root: chars[1], sub: '', has_wazur: false, vowel: 'a', suffix: '', post: '' };
      }
      if (SUFFIXES.has(chars[1])) {
        return { raw, prefix: '', super: '', root: chars[0], sub: '', has_wazur: false, vowel: 'a', suffix: chars[1], post: '' };
      }
      if (PREFIXES.has(chars[0])) {
        return { raw, prefix: chars[0], super: '', root: chars[1], sub: '', has_wazur: false, vowel: 'a', suffix: '', post: '' };
      }
    }

    // ① 从右剥取「再后加字 + 后加字」（它们位于元音之后，在音节末尾）。
    if (chars.length >= 2 && POST_SUFFIXES.has(chars[chars.length - 1]) && SUFFIXES.has(chars[chars.length - 2])) {
      post_suffix = chars.pop();
      suffix = chars.pop();
    } else if (chars.length >= 1 && SUFFIXES.has(chars[chars.length - 1])) {
      suffix = chars.pop();
    }

    // ② 从右剥取元音符号（如有）。
    if (chars.length >= 1 && VOWELS[chars[chars.length - 1]] !== undefined) {
      vowel = VOWELS[chars[chars.length - 1]];
      chars.pop();
    }

    // ③ 回溯：若已无剩余，则被剥取的“后加字”实为基字。
    if (chars.length === 0) {
      if (suffix) { root = suffix; suffix = ''; }
      if (post_suffix) { suffix = post_suffix; post_suffix = ''; }
      return { raw, prefix, super: superscript, root, sub: subscript, has_wazur, vowel, suffix, post: post_suffix };
    }

    // ④ 解析音节头（元音之前）：[前置字] [上加字] 基字 [下加介音]。
    const headCons = [];
    for (const ch of chars) {
      if (SUBSCRIPTS[ch] !== undefined) {
        if (SUBSCRIPTS[ch] === 'w') {
          has_wazur = true;                  // ྭ（wazur）：已弱化脱落，单独记录，不覆盖主介音
        } else {
          subscript = SUBSCRIPTS[ch];        // 主介音 ྱ ྲ ླ（主导颚化/卷舌化）
        }
      } else {
        headCons.push(SUBJOINED_ROOT[ch] || ch); // 下加根字还原为基字
      }
    }

    // 基字为音节头的最后一个辅音；其前为前置字 / 上加字。
    const n = headCons.length;
    if (n === 1) {
      root = headCons[0];
    } else if (n === 2) {
      if (PREFIXES.has(headCons[0])) { prefix = headCons[0]; root = headCons[1]; }
      else if (SUPERSCRIPTS.has(headCons[0])) { superscript = headCons[0]; root = headCons[1]; }
      else { root = headCons[1]; }
    } else if (n >= 3) {
      prefix = headCons[0]; superscript = headCons[1]; root = headCons[2];
    }

    return { raw, prefix, super: superscript, root, sub: subscript, has_wazur, vowel, suffix, post: post_suffix };
  }

  // ========== 4. 卫藏（拉萨）utsang ==========

  function genUtsang(p, toneFormat) {
    const info = UT_KHM_ROOT_MAP[p.root];
    if (!info) return ['UNK'];

    let [c_ipa, high_tone, asp] = info;
    const hasHead = Boolean(p.prefix || p.super);

    // ལྷ 合写：上加 ལ + 基字 ཧ → 清边擦音 ɬ（高调）
    if (p.super === 'ལ' && p.root === 'ཧ') {
      c_ipa = 'ɬ';
      high_tone = 1;
    }
    // 特殊音变：དབ / དབྱ / དབྲ 声母弱化 → w / j / ʈʂ
    else if (p.prefix === 'ད' && p.root === 'བ') {
      c_ipa = (p.sub === 'y') ? 'j' : (p.sub === 'r') ? 'ʈʂ' : 'w';
      high_tone = 1;
      asp = 0;
    } else {
      // 声调与送气中和律：前加 འ 仅清化去送气并保低调；其余前加/上加字清化去送气并升高调
      if (hasHead) {
        if (p.prefix === 'འ') {
          if (!high_tone) { c_ipa = c_ipa.replace('ʰ', ''); asp = 0; }
        } else {
          if (!high_tone) { high_tone = 1; c_ipa = c_ipa.replace('ʰ', ''); asp = 0; }
        }
      }

      // 下加介音（复辅音演变）
      if (p.sub === 'y') {
        if (['ཀ', 'ཁ', 'ག'].includes(p.root)) {
          c_ipa = (asp && (!hasHead || p.root === 'ཁ')) ? 'tɕʰ' : 'tɕ';
        } else if (['པ', 'ཕ'].includes(p.root)) {
          c_ipa = asp ? 'tɕʰ' : 'tɕ';
        } else if (p.root === 'བ') {
          c_ipa = hasHead ? 'tɕ' : 'tɕʰ';
        } else if (p.root === 'མ') {
          c_ipa = 'ɲ';
        }
      } else if (p.sub === 'r') {
        if (['ཀ', 'ཁ', 'ག', 'ཏ', 'ཐ', 'ད', 'པ', 'ཕ', 'བ'].includes(p.root)) {
          c_ipa = (asp && (!hasHead || ['ཁ', 'ཐ', 'ཕ'].includes(p.root))) ? 'ʈʂʰ' : 'ʈʂ';
        } else if (p.root === 'ས') {
          c_ipa = 's';
        } else if (p.root === 'ཧ') {
          c_ipa = 'ʂʰ';
        }
      } else if (p.sub === 'l') {
        if (p.root === 'ཟ') { c_ipa = 't'; high_tone = 1; }
        else c_ipa = 'l';
      }
    }

    // 韵母音变（Umlaut / 元音前移）与韵尾
    let v_ipa = p.vowel;
    let coda_ipa = '';
    if (['ད', 'ན', 'ལ', 'ས'].includes(p.suffix)) {
      const umlaut = { 'a': 'ɛ', 'o': 'ø', 'u': 'y' };
      v_ipa = umlaut[v_ipa] || v_ipa;
      if (p.suffix === 'ན') {
        v_ipa += '\u0303ː';     // 鼻化 + 补偿性长元音化
      } else if (['ད', 'ས'].includes(p.suffix)) {
        coda_ipa = 'ʔ';         // 喉塞化（入声）
      } else if (p.suffix === 'ལ') {
        v_ipa += 'ː';           // 边音脱落，元音补偿性延长
      }
    } else if (p.suffix === 'ག') coda_ipa = 'ʔ';
    else if (p.suffix === 'ང') coda_ipa = 'ŋ';
    else if (p.suffix === 'མ') coda_ipa = 'm';
    else if (p.suffix === 'བ') coda_ipa = 'p';
    else if (p.suffix === 'ར') v_ipa += 'ː';
    else if (p.suffix === 'འ') v_ipa += 'ː';

    // 拉萨四调：55 高平、53 高降（入声）、14 低升、12 低入
    const isChecked = ['ʔ', 'p'].includes(coda_ipa);
    let tone = high_tone ? (isChecked ? '53' : '55') : (isChecked ? '12' : '14');
    if (toneFormat === 'chao') tone = CHAO_TONE_MAP[tone];

    const phones = [c_ipa, v_ipa + tone];
    if (coda_ipa) phones.push(coda_ipa);
    return phones;
  }

  // ========== 5. 康巴（德格）khams ==========

  function genKhams(p, toneFormat) {
    const info = UT_KHM_ROOT_MAP[p.root];
    if (!info) return ['UNK'];

    let [c_ipa, high_tone, asp] = info;
    const hasHead = Boolean(p.prefix || p.super);
    if (p.root === 'ཧ') c_ipa = 'x';

    // ལྷ 合写 → 清边擦音 ɬ（高调）
    if (p.super === 'ལ' && p.root === 'ཧ') {
      c_ipa = 'ɬ';
      high_tone = 1;
    }
    // 康巴 དབ / དབྱ / དབྲ 弱化
    else if (p.prefix === 'ད' && p.root === 'བ') {
      c_ipa = (p.sub === 'y') ? 'j' : (p.sub === 'r') ? 'ʈʂ' : 'w';
      high_tone = 1;
      asp = 0;
    } else {
      if (hasHead) {
        if (p.prefix === 'འ') {
          if (!high_tone) { c_ipa = c_ipa.replace('ʰ', ''); asp = 0; }
        } else {
          if (!high_tone) { high_tone = 1; c_ipa = c_ipa.replace('ʰ', ''); asp = 0; }
        }
      }

      if (p.sub === 'y') {
        if (['ཀ', 'ཁ', 'ག'].includes(p.root)) {
          c_ipa = (asp && (!hasHead || p.root === 'ཁ')) ? 'tɕʰ' : 'tɕ';
        } else if (['པ', 'ཕ', 'བ'].includes(p.root)) {
          c_ipa = (asp && (!hasHead || p.root === 'ཕ')) ? 'pɕʰ' : 'pɕ';
        } else if (p.root === 'མ') {
          c_ipa = 'ɲ';
        }
      } else if (p.sub === 'r') {
        if (['ཀ', 'ཁ', 'ག', 'ཏ', 'ཐ', 'ད', 'པ', 'ཕ', 'བ'].includes(p.root)) {
          c_ipa = (asp && (!hasHead || ['ཁ', 'ཐ', 'ཕ'].includes(p.root))) ? 'ʈʂʰ' : 'ʈʂ';
        } else if (p.root === 'ས') {
          c_ipa = 's';
        } else if (p.root === 'ཧ') {
          c_ipa = 'ʂʰ';
        }
      } else if (p.sub === 'l') {
        if (p.root === 'ཟ') { c_ipa = 't'; high_tone = 1; }
        else c_ipa = 'l';
      }
    }

    // 元音（康巴前移较卫藏弱，仅 a→ɛ）
    let v_ipa = p.vowel;
    if (['ད', 'ན', 'ས'].includes(p.suffix)) {
      const umlaut = { 'a': 'ɛ' };
      v_ipa = umlaut[v_ipa] || v_ipa;
    }

    // 德格四调：55 高平、53 高降（入声）、13 低升、31 低降（入声）
    const checked = ['ག', 'བ', 'ད', 'ས'].includes(p.suffix);
    let tone = high_tone ? (checked ? '53' : '55') : (checked ? '31' : '13');
    if (toneFormat === 'chao') tone = CHAO_TONE_MAP[tone];

    const phones = [c_ipa, v_ipa + tone];
    const codaMap = { 'ག': 'k', 'ང': 'ŋ', 'བ': 'p', 'མ': 'm', 'ར': 'r', 'ལ': 'l', 'ན': 'n', 'ད': 't', 'ས': 'ʔ' };
    if (p.suffix && codaMap[p.suffix]) phones.push(codaMap[p.suffix]);
    return phones;
  }

  // ========== 6. 安多（拉卜楞）amdo（无声调） ==========

  function genAmdo(p) {
    const AMD_CODA = { 'ག': 'ɣ', 'ང': 'ŋ', 'ད': 't', 'ན': 'n', 'བ': 'p', 'མ': 'm', 'ར': 'r', 'ལ': 'l', 'ས': 's' };
    const pushCoda = (phones) => {
      if (p.suffix && AMD_CODA[p.suffix]) phones.push(AMD_CODA[p.suffix]);
      if (p.post === 'ས') phones.push('s');
      else if (p.post === 'ད') phones.push('t');
    };

    // ལྷ 合写 → 清边擦音 ɬ
    if (p.super === 'ལ' && p.root === 'ཧ') {
      const phones = ['ɬ', p.vowel];
      pushCoda(phones);
      return phones;
    }

    // དབ / དབྱ / དབྲ 特殊弱化（前加 ད/ག + 基字 བ 整体弱化）
    if ((p.prefix === 'ད' || p.prefix === 'ག') && p.root === 'བ') {
      const main = p.sub === 'y' ? ['j'] : p.sub === 'r' ? ['v', 'ʐ'] : ['v'];
      const phones = [...main, p.vowel];
      pushCoda(phones);
      return phones;
    }

    const c_root = AMD_ROOT_MAP[p.root];
    if (!c_root) return ['UNK'];

    const onset = [];

    // 前加字（安多完整保留古复辅音，前加字按「紧邻第一辅音」清浊同化实读）
    if (p.prefix) {
      const adjacentCons = p.super || p.root;
      const voiceless = VOICELESS_ROOTS.has(adjacentCons);
      if (p.prefix === 'འ') {
        const nasal = ['པ', 'ཕ', 'བ', 'མ'].includes(p.root) ? 'm'
                    : ['ཀ', 'ཁ', 'ག', 'ང'].includes(p.root) ? 'ŋ'
                    : ['ཅ', 'ཆ', 'ཇ', 'ཉ', 'ཤ', 'ཞ', 'ཡ'].includes(p.root) ? 'ɲ'
                    : 'n';
        onset.push(nasal);
      } else if (p.prefix === 'ག' || p.prefix === 'ད') {
        onset.push(voiceless ? 'x' : 'ɣ');
      } else if (p.prefix === 'བ') {
        onset.push(voiceless ? 'f' : 'v');
      } else if (p.prefix === 'མ') {
        onset.push('m');
      }
    }

    // 上加字（作为独立音素）
    if (p.super) {
      const supMap = { 'ར': 'r', 'ལ': 'l', 'ས': 's' };
      if (supMap[p.super]) onset.push(supMap[p.super]);
    }

    // 下加介音（输出为原子音素数组，彻底避免 MFA 粘连字符串）
    let mainCons = [c_root];
    if (p.sub === 'y') {
      if (['ཀ', 'ཁ', 'ག'].includes(p.root)) {
        mainCons = [p.root === 'ག' ? 'ɟ' : (p.root === 'ཁ' ? 'cʰ' : 'c')];
      } else if (['པ', 'ཕ', 'བ'].includes(p.root)) {
        mainCons = [p.root === 'བ' ? 'ɟ' : (p.root === 'ཕ' ? 'cʰ' : 'c')];
      } else if (p.root === 'མ') {
        mainCons = ['ɲ'];
      } else {
        mainCons.push('j');
      }
    } else if (p.sub === 'r') {
      if (['ཀ', 'ཁ', 'ག', 'ཏ', 'ཐ', 'ད'].includes(p.root)) {
        mainCons = [c_root.includes('ʰ') ? 'ʈʂʰ'
                   : (['ɡ', 'd'].includes(c_root) ? 'ɖʐ' : 'ʈʂ')];
      } else if (['པ', 'ཕ', 'བ'].includes(p.root)) {
        mainCons = c_root === 'pʰ' ? ['pʰ', 'ʂ']
                 : c_root === 'b' ? ['b', 'ʐ']
                 : ['p', 'ʂ'];
      } else if (p.root === 'ས') {
        mainCons = ['ʂ'];
      } else if (p.root === 'ཧ') {
        mainCons = ['ʂʰ'];
      }
    } else if (p.sub === 'l') {
      if (p.root === 'ཀ') mainCons = ['k', 'ɬ'];
      else if (p.root === 'ག') mainCons = ['ɣ', 'l'];
      else if (p.root === 'བ') mainCons = ['v', 'l'];
      else if (p.root === 'ཟ') mainCons = ['z', 'd'];
      else if (p.root === 'ས') mainCons = ['ɬ'];
      else mainCons = ['l'];
    }

    onset.push(...mainCons);

    const phones = [...onset.filter(Boolean), p.vowel];
    pushCoda(phones);
    return phones;
  }

  // ========== 7. 编排 ==========

  const DIALECTS = ['utsang', 'khams', 'amdo'];
  const GENERATORS = { utsang: genUtsang, khams: genKhams, amdo: genAmdo };

  /**
   * 生成三大方言的 MFA 词典行（音节去重，保持首次出现顺序）。
   * @param {string} text 藏文文本
   * @param {{toneFormat?: string}} [options] toneFormat: 'number' | 'chao'
   * @returns {{utsang: string[], khams: string[], amdo: string[]}}
   */
  function generate(text, options) {
    const toneFormat = (options && options.toneFormat) || 'number';
    const rawSyl = String(text).split(/[་\s\u0F0D\u0F0E]+/);
    const seen = new Set();
    const uni = [];
    for (const s of rawSyl) {
      const cl = cleanSyllable(s);
      if (cl && !seen.has(cl)) { seen.add(cl); uni.push(cl); }
    }

    const result = { utsang: [], khams: [], amdo: [] };
    for (const syl of uni) {
      const p = parseSyllable(syl);
      if (!p || !p.root) continue;
      for (const dialect of DIALECTS) {
        const phones = GENERATORS[dialect](p, toneFormat);
        result[dialect].push(syl + '\t' + phones.join(' '));
      }
    }
    return result;
  }

  return {
    VERSION,
    DIALECTS,
    generate,
    parseSyllable,
    cleanSyllable,
    genUtsang,
    genKhams,
    genAmdo
  };
});
