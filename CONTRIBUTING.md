# Contributing to tibetan-three-dialects-g2p

Thank you for your interest in contributing! This project welcomes help from linguists, Tibetan speakers, and speech-technology engineers alike. / 感谢你的关注！本项目欢迎语言学家、藏语母语者与语音技术工程师的贡献。

## Code of Conduct / 行为准则

We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. Be kind, patient, and constructive. / 我们遵循 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则，请友善、耐心、建设性地交流。

## Ways to contribute / 贡献方式

- **Bug reports / 报告问题** — open an issue with a minimal Tibetan input, the expected output, and the actual output.
- **Rule corrections / 修正规则** — propose a fix to a sound-change rule in [`tibetan-three-dialects-g2p.js`](tibetan-three-dialects-g2p.js), with a linguistic citation or native-speaker judgement.
- **Lexical exceptions / 词汇例外** — many real words do not follow the regular rules; exception lists are very welcome.
- **Test fixtures / 测试用例** — add input→expected-output triples for all three dialects.
- **Documentation / 文档** — improve the README or the [`docs/`](docs/) files, in English or Chinese.
- **Dialect coverage / 方言扩展** — add a new variety (e.g., other Khams varieties, stress marking for Amdo).

## Before submitting / 提交前

1. Check open issues and pull requests to avoid duplication.
2. If you are changing rules, please explain *why* in the pull request description and, where possible, cite a source (paper, grammar, or native-speaker judgement).
3. Verify that everything still works: open [`index.html`](index.html) in a browser and run `node test/smoke.js`.
4. Keep changes focused: one logical change per pull request.

## Style / 风格

- Keep the engine dependency-free and browser-compatible (plain ES2017+ JavaScript, no build step), and usable from Node.js as a CommonJS module.
- Preserve the IPA-like phone set documented in [`docs/g2p-rules.md`](docs/g2p-rules.md); do not silently change phone symbols.
- Mention the change and its rationale clearly in the pull request description.

## License / 许可证

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).

## Development notes / 开发说明

The G2P engine lives inside [`tibetan-three-dialects-g2p.js`](tibetan-three-dialects-g2p.js) (browser + Node.js). The functions of interest are:

- `cleanSyllable`, `parseSyllable` — tokenization and orthographic-slot parsing.
- `genUtsang`, `genKhams`, `genAmdo` — dialect-specific rule application.
- `generate` — orchestration and de-duplication.

See [`docs/g2p-rules.md`](docs/g2p-rules.md) for the normative specification of the rules.
