/*!
 * tibetan-three-dialects-g2p — Rule-based Grapheme-to-Phoneme (G2P) for the
 * three major Tibetan dialects: Ü-Tsang (Lhasa), Khams (Dergé), and Amdo (Labrang).
 *
 * Output: Montreal Forced Aligner (MFA) lexicon format.
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
    // Node.js / CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser global
    root.tibetanThreeDialectsG2p = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '0.1.0';

  // ========== Tibetan orthography tables ==========

  var ROOT_CONSONANTS = ['ཀ','ཁ','ག','ང','ཅ','ཆ','ཇ','ཉ','ཏ','ཐ','ད','ན','པ','ཕ','བ','མ','ཙ','ཚ','ཛ','ཝ','ཞ','ཟ','འ','ཡ','ར','ལ','ཤ','ས','ཧ','ཨ'];
  var VOWELS = {'ི':'i','ུ':'u','ེ':'e','ོ':'o'};
  var SUB_Y = 'ྱ', SUB_R = 'ྲ', SUB_L = 'ླ', SUB_W = 'ྭ';
  var PREFIXES = new Set(['ག','ད','བ','མ','འ']);
  var SUPERSCRIPTS = new Set(['ར','ལ','ས']);
  var SUFFIXES = new Set(['ག','ང','ད','ན','བ','མ','འ','ར','ལ','ས']);
  var POST_SUFFIXES = new Set(['ད','ས']);

  // Ü-Tsang & Khams shared root map: [phone, high_tone, aspirated]
  var UT_ROOT_MAP = {
    'ཀ':['k',1,0],'ཁ':['kʰ',1,1],'ག':['kʰ',0,1],'ང':['ŋ',0,0],
    'ཅ':['tɕ',1,0],'ཆ':['tɕʰ',1,1],'ཇ':['tɕʰ',0,1],'ཉ':['ɲ',0,0],
    'ཏ':['t',1,0],'ཐ':['tʰ',1,1],'ད':['tʰ',0,1],'ན':['n',0,0],
    'པ':['p',1,0],'ཕ':['pʰ',1,1],'བ':['pʰ',0,1],'མ':['m',0,0],
    'ཙ':['ts',1,0],'ཚ':['tsʰ',1,1],'ཛ':['tsʰ',0,1],'ཝ':['w',0,0],
    'ཞ':['ɕ',0,0],'ཟ':['s',0,0],'འ':['ʔ',0,0],'ཡ':['j',0,0],
    'ར':['r',0,0],'ལ':['l',0,0],'ཤ':['ɕ',1,0],'ས':['s',1,0],
    'ཧ':['h',1,1],'ཨ':['ʔ',1,0]
  };

  // Amdo root map: root -> phone (voiced retained, no tone)
  var AMDO_ROOT_MAP = {
    'ཀ':'k','ཁ':'kʰ','ག':'ɡ','ང':'ŋ','ཅ':'tɕ','ཆ':'tɕʰ','ཇ':'dʑ','ཉ':'ɲ',
    'ཏ':'t','ཐ':'tʰ','ད':'d','ན':'n','པ':'p','ཕ':'pʰ','བ':'b','མ':'m',
    'ཙ':'ts','ཚ':'tsʰ','ཛ':'dz','ཝ':'w','ཞ':'ʑ','ཟ':'z','འ':'ʁ','ཡ':'j',
    'ར':'r','ལ':'l','ཤ':'ɕ','ས':'s','ཧ':'h','ཨ':'ʔ'
  };

  // ========== Parsing ==========

  function cleanSyllable(syl) {
    syl = syl.trim();
    return syl.replace(/[\u0F0B\u0F0C\u0F0D\u0F0E\u0F0F\u0F04-\u0F0A\s]/g, '');
  }

  function parseSyllable(syl) {
    syl = cleanSyllable(syl);
    if (!syl) return null;

    var vowel = 'a', vowelChar = '';
    var vc;
    for (vc in VOWELS) {
      if (syl.indexOf(vc) !== -1) { vowel = VOWELS[vc]; vowelChar = vc; break; }
    }

    var consStr = vowelChar ? syl.split(vowelChar).join('') : syl;
    var chars = Array.from(consStr);
    var n = chars.length;
    if (n === 0) return null;

    var prefix = '', superscript = '', root = '', subscript = '', suffix = '', post_suffix = '';
    var nonSub = [];
    var i, ch;
    for (i = 0; i < chars.length; i++) {
      ch = chars[i];
      if (ch === SUB_Y) subscript = 'y';
      else if (ch === SUB_R) subscript = 'r';
      else if (ch === SUB_L) subscript = 'l';
      else if (ch === SUB_W) subscript = 'w';
      else nonSub.push(ch);
    }
    chars = nonSub; n = chars.length;

    if (n === 1) {
      root = chars[0];
    } else if (n === 2) {
      if (SUFFIXES.has(chars[1]) && !PREFIXES.has(chars[0])) {
        root = chars[0]; suffix = chars[1];
      } else if (PREFIXES.has(chars[0]) && ROOT_CONSONANTS.indexOf(chars[1]) !== -1) {
        root = chars[0]; suffix = chars[1];
      } else {
        root = chars[0]; suffix = chars[1];
      }
    } else if (n === 3) {
      if (PREFIXES.has(chars[0]) && SUPERSCRIPTS.has(chars[1])) {
        prefix = chars[0]; superscript = chars[1]; root = chars[2];
      } else if (PREFIXES.has(chars[0]) && SUFFIXES.has(chars[2])) {
        prefix = chars[0]; root = chars[1]; suffix = chars[2];
      } else if (SUFFIXES.has(chars[2])) {
        superscript = chars[0]; root = chars[1]; suffix = chars[2];
      } else {
        root = chars[0]; suffix = chars[1]; post_suffix = chars[2];
      }
    } else if (n >= 4) {
      prefix = chars[0]; superscript = chars[1]; root = chars[2]; suffix = chars[3];
      if (n > 4) post_suffix = chars[4];
    }

    return { raw: syl, prefix: prefix, super: superscript, root: root, sub: subscript, vowel: vowel, suffix: suffix, post: post_suffix };
  }

  // ========== Ü-Tsang (Lhasa) ==========

  function genUtsang(parsed) {
    var root = parsed.root;
    if (!UT_ROOT_MAP[root]) return ['UNK'];

    var c_ipa = UT_ROOT_MAP[root][0];
    var high_tone = UT_ROOT_MAP[root][1];
    var asp = UT_ROOT_MAP[root][2];
    var hasPrefix = !!parsed.prefix, hasSuper = !!parsed.super;
    var sub = parsed.sub, suffix = parsed.suffix, vowel = parsed.vowel;

    if (hasPrefix || hasSuper) {
      if (!high_tone) {
        high_tone = 1;
        if (asp) c_ipa = c_ipa.replace('ʰ', '');
      }
    }

    if (sub === 'y') {
      if (['ཀ','ཁ','ག'].indexOf(root) !== -1) c_ipa = (asp && !(hasPrefix || hasSuper)) ? 'cʰ' : 'c';
      else if (['པ','ཕ','བ','མ'].indexOf(root) !== -1) c_ipa = asp ? 'tɕʰ' : 'tɕ';
    } else if (sub === 'r') {
      if (['ཀ','ཁ','ག','ཏ','ཐ','ད','པ','ཕ','བ'].indexOf(root) !== -1) c_ipa = (asp && !(hasPrefix || hasSuper)) ? 'ʈʰ' : 'ʈ';
    }

    var v_ipa = vowel;
    var coda_ipa = '';
    if (['ད','ན','ལ','ས'].indexOf(suffix) !== -1) {
      var umlaut = { 'a':'ɛ', 'u':'y', 'o':'ø', 'e':'e', 'i':'i' };
      v_ipa = umlaut[v_ipa] || v_ipa;
      if (suffix === 'ན') v_ipa += '̃';
      else if (['ད','ས'].indexOf(suffix) !== -1) coda_ipa = 'ʔ';
    }
    if (suffix === 'ག') coda_ipa = 'ʔ';
    else if (suffix === 'ང') coda_ipa = 'ŋ';
    else if (suffix === 'མ') coda_ipa = 'm';
    else if (suffix === 'བ') coda_ipa = 'p';
    else if (suffix === 'ར') coda_ipa = 'r';

    var tone;
    if (high_tone) tone = (['ʔ','p'].indexOf(coda_ipa) !== -1) ? '53' : '55';
    else tone = (['ʔ','p'].indexOf(coda_ipa) !== -1) ? '12' : '14';

    var phones = [c_ipa, v_ipa + tone];
    if (coda_ipa && coda_ipa !== 'ʔ') phones.push(coda_ipa);
    return phones;
  }

  // ========== Amdo (Labrang, non-tonal) ==========

  function genAmdo(parsed) {
    var root = parsed.root;
    if (!AMDO_ROOT_MAP[root]) return ['UNK'];

    var phones = [];
    var prefMap = { 'ག':'ɣ', 'ད':'d', 'བ':'v', 'མ':'m', 'འ':'ʁ' };
    if (parsed.prefix) phones.push(prefMap[parsed.prefix] || '');
    var supMap = { 'ར':'r', 'ལ':'l', 'ས':'s' };
    if (parsed.super) phones.push(supMap[parsed.super] || '');

    var c_ipa = AMDO_ROOT_MAP[root];
    var sub = parsed.sub;
    if (sub === 'y') c_ipa += 'j';
    else if (sub === 'r') c_ipa += 'ʐ';
    else if (sub === 'l') c_ipa = 'l';
    phones.push(c_ipa);
    phones.push(parsed.vowel);

    var sufMap = { 'ག':'k', 'ང':'ŋ', 'ད':'t', 'ན':'n', 'བ':'p', 'མ':'m', 'ར':'r', 'ལ':'l', 'ས':'x' };
    if (parsed.suffix && sufMap[parsed.suffix]) phones.push(sufMap[parsed.suffix]);

    return phones.filter(function (p) { return !!p; });
  }

  // ========== Khams (Dergé) ==========

  function genKhams(parsed) {
    var root = parsed.root;
    if (!UT_ROOT_MAP[root]) return ['UNK'];

    var phones = [];
    var c_ipa = UT_ROOT_MAP[root][0];
    var high_tone = UT_ROOT_MAP[root][1];
    var asp = UT_ROOT_MAP[root][2];
    if (parsed.prefix || parsed.super) phones.push('ʰ');

    var sub = parsed.sub;
    if (sub === 'y') {
      if (c_ipa.charAt(0) === 'k' || c_ipa.charAt(0) === 'p') c_ipa = 'tɕ';
      else c_ipa += 'j';
    } else if (sub === 'r') {
      c_ipa = asp ? 'ʈʂʰ' : 'ʈʂ';
    }
    phones.push(c_ipa);

    var v_ipa = parsed.vowel;
    if (['ད','ན','ས'].indexOf(parsed.suffix) !== -1) {
      var umlaut = { 'a':'ɛ', 'o':'ø', 'u':'y' };
      v_ipa = umlaut[v_ipa] || v_ipa;
    }

    var tone = high_tone ? '55' : '13';
    if (['ག','བ','ད'].indexOf(parsed.suffix) !== -1) tone = high_tone ? '53' : '33';
    phones.push(v_ipa + tone);

    var sufMap = { 'ང':'ŋ', 'མ':'m', 'ར':'r', 'ལ':'l' };
    if (parsed.suffix && sufMap[parsed.suffix]) phones.push(sufMap[parsed.suffix]);
    return phones;
  }

  // ========== Orchestration ==========

  function generate(text) {
    var rawSyl = String(text).split(/[་\s\u0F0D\u0F0E]+/);
    var seen = new Set();
    var uni = [];
    var i, s, cl;
    for (i = 0; i < rawSyl.length; i++) {
      s = rawSyl[i];
      cl = cleanSyllable(s);
      if (cl && !seen.has(cl)) { seen.add(cl); uni.push(cl); }
    }

    var utsang = [], khams = [], amdo = [];
    for (i = 0; i < uni.length; i++) {
      var syl = uni[i];
      var p = parseSyllable(syl);
      if (!p || !p.root) continue;
      var u = genUtsang(p);
      var k = genKhams(p);
      var a = genAmdo(p);
      utsang.push(syl + '\t' + u.join(' '));
      khams.push(syl + '\t' + k.join(' '));
      amdo.push(syl + '\t' + a.join(' '));
    }
    return { utsang: utsang, khams: khams, amdo: amdo };
  }

  return {
    VERSION: VERSION,
    generate: generate,
    parseSyllable: parseSyllable,
    cleanSyllable: cleanSyllable,
    genUtsang: genUtsang,
    genKhams: genKhams,
    genAmdo: genAmdo
  };
});
