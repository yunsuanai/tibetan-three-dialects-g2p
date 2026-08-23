'use strict';

/*
 * Smoke test for tibetan-three-dialects-g2p.
 *
 * Verifies the documented worked example from docs/g2p-rules.md:
 *   input: ཁྱོད་རང་གང་དུ་ཡོད།
 */

const assert = require('assert');
const g2p = require('../tibetan-three-dialects-g2p.js');

const res = g2p.generate('ཁྱོད་རང་གང་དུ་ཡོད།');

function phones(lines) {
  return lines.map((line) => line.split('\t')[1]);
}

assert.deepStrictEqual(
  phones(res.utsang),
  ['cʰ ø53', 'r a14 ŋ', 'kʰ a14 ŋ', 'tʰ u14', 'j ø12']
);

assert.deepStrictEqual(
  phones(res.khams),
  ['tɕ ø53', 'r a13 ŋ', 'kʰ a13 ŋ', 'tʰ u13', 'j ø33']
);

assert.deepStrictEqual(
  phones(res.amdo),
  ['kʰj o t', 'r a ŋ', 'ɡ a ŋ', 'd u', 'j o t']
);

// API surface sanity checks
assert.strictEqual(typeof g2p.generate, 'function');
assert.strictEqual(typeof g2p.parseSyllable, 'function');
assert.strictEqual(typeof g2p.genUtsang, 'function');
assert.strictEqual(typeof g2p.genKhams, 'function');
assert.strictEqual(typeof g2p.genAmdo, 'function');
assert.ok(/^\d+\.\d+\.\d+/.test(g2p.VERSION));

// Regression: prefix + root + subscript (བཀྲ) must not be mis-parsed as root + suffix.
const bkra = g2p.generate('བཀྲ');
assert.deepStrictEqual(phones(bkra.utsang), ['ʈ a55']);
assert.deepStrictEqual(phones(bkra.khams), ['ʰ ʈʂ a55']);
assert.deepStrictEqual(phones(bkra.amdo), ['v kʐ a']);

// Regression: prefix + root (གཡ) and superscript + root (ར + ཀ) parse correctly.
assert.strictEqual(g2p.parseSyllable('གཡ').prefix, 'ག');
assert.strictEqual(g2p.parseSyllable('གཡ').root, 'ཡ');
const rka = g2p.parseSyllable(String.fromCharCode(0x0F62, 0x0F40)); // ར (super) + ཀ (root, full form)
assert.strictEqual(rka.super, 'ར');
assert.strictEqual(rka.root, 'ཀ');

// Regression: vowel position disambiguates head vs coda (མདོ = མ prefix + ད root + ོ vowel).
const mdo = g2p.generate('མདོ');
assert.deepStrictEqual(phones(mdo.utsang), ['t o55']);
assert.deepStrictEqual(phones(mdo.khams), ['ʰ tʰ o13']);
assert.deepStrictEqual(phones(mdo.amdo), ['m d o']);

// Regression: full syllable བསྒྲིགས decomposes into all seven orthographic slots.
const bsgrigs = g2p.parseSyllable('བསྒྲིགས');
assert.strictEqual(bsgrigs.prefix, 'བ');
assert.strictEqual(bsgrigs.super, 'ས');
assert.strictEqual(bsgrigs.root, 'ག');
assert.strictEqual(bsgrigs.sub, 'r');
assert.strictEqual(bsgrigs.vowel, 'i');
assert.strictEqual(bsgrigs.suffix, 'ག');
assert.strictEqual(bsgrigs.post, 'ས');

console.log('smoke test passed \u2713');
