#!/usr/bin/env node
'use strict';

/*
 * tibetan-three-dialects-g2p — command-line interface.
 *
 * Copyright 2026 Khepa-Nyima
 *
 * Reads Tibetan text from arguments or stdin and prints MFA lexicon entries
 * for the three major dialects.
 */

var g2p = require('./tibetan-three-dialects-g2p.js');

var DIALECT_KEYS = {
  'utsang': 'utsang', 'u': 'utsang', 'l': 'utsang', 'lhasa': 'utsang',
  'khams': 'khams', 'k': 'khams', 'd': 'khams', 'derge': 'khams',
  'amdo': 'amdo', 'a': 'amdo', 'labrang': 'amdo'
};

var SECTION_LABELS = {
  'utsang': '# \u00DC-Tsang (Lhasa)',
  'khams': '# Khams (Derg\u00E9)',
  'amdo': '# Amdo (Labrang, non-tonal)'
};

var HELP = [
  'tibetan-three-dialects-g2p — rule-based G2P for the three major Tibetan dialects.',
  '',
  'Usage:',
  '  node cli.js [options] [TEXT...]',
  '  echo "TEXT" | node cli.js [options]',
  '',
  'Options:',
  '  --dialect <name>   utsang | khams | amdo | all   (default: all)',
  '  --tsv              print entries only, without section headers',
  '  -h, --help         show this help',
  '',
  'Examples:',
  '  node cli.js "ཁྱོད་རང་གང་དུ་ཡོད།"',
  '  echo "ཁྱོད་རང་གང་དུ་ཡོད།" | node cli.js --dialect amdo'
].join('\n');

function parseArgs(argv) {
  var opts = { dialect: 'all', tsv: false, text: [], help: false };
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--tsv') opts.tsv = true;
    else if (a === '--dialect') { opts.dialect = argv[++i] || 'all'; }
    else if (a.indexOf('--dialect=') === 0) opts.dialect = a.slice('--dialect='.length);
    else opts.text.push(a);
  }
  return opts;
}

function format(result, opts) {
  var out = [];
  if (opts.dialect === 'all') {
    var sections = ['utsang', 'khams', 'amdo'];
    for (var i = 0; i < sections.length; i++) {
      var key = sections[i];
      if (!opts.tsv) out.push(SECTION_LABELS[key]);
      out.push(result[key].join('\n'));
    }
  } else {
    var key = DIALECT_KEYS[opts.dialect];
    if (!key) {
      console.error('Unknown dialect: ' + opts.dialect + ' (use utsang | khams | amdo | all)');
      process.exit(2);
    }
    out.push(result[key].join('\n'));
  }
  return out.join('\n');
}

function run(text, opts) {
  if (!text || !text.trim()) {
    console.error('No input text provided.');
    console.error('Run `node cli.js --help` for usage.');
    process.exit(1);
  }
  var result = g2p.generate(text);
  console.log(format(result, opts));
}

function main() {
  var opts = parseArgs(process.argv.slice(2));
  if (opts.help) { console.log(HELP); return; }

  var textArg = opts.text.join(' ');
  if (textArg) {
    run(textArg, opts);
  } else {
    var stdin = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) { stdin += chunk; });
    process.stdin.on('end', function () { run(stdin, opts); });
  }
}

main();
