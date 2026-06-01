import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  analyzeRecords,
  parseOfficialResultUrl,
  stableStringify,
} from './analyzer-core.mjs';

const DEFAULT_OUTPUT_DIR = 'data/analysis';

function parseArgs(argv) {
  const args = {
    input: null,
    url: null,
    outputDir: DEFAULT_OUTPUT_DIR,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') {
      args.input = argv[++i];
    } else if (arg === '--url') {
      args.url = argv[++i];
    } else if (arg === '--output-dir' || arg === '-o') {
      args.outputDir = argv[++i];
    }
  }

  return args;
}

async function loadInput(inputPath) {
  const raw = await readFile(inputPath, 'utf8');
  const parsed = JSON.parse(raw);
  return analyzeRecords(parsed);
}

async function main() {
  const args = parseArgs(process.argv);
  await mkdir(args.outputDir, { recursive: true });

  const parsedUrl = parseOfficialResultUrl(args.url);

  if (!args.input) {
    const output = {
      ok: false,
      reason: 'missing_input',
      message: '请先从浏览器 Network 面板保存 JSON 响应或 HAR 文件，然后使用 --input 指定文件路径。',
      parsedUrl,
      expectedCommand: 'npm run analyze:sample -- --input data/samples/example.har --url "https://fencing.yy-sport.com.cn/#/game/result?id=101199&eventCode=RZSS2035112MFIU10"',
    };
    console.log(stableStringify(output));
    return;
  }

  const loaded = await loadInput(args.input);

  const report = {
    ok: true,
    source: {
      input: args.input,
      kind: loaded.kind,
      parsedUrl,
      analyzedAt: new Date().toISOString(),
    },
    records: loaded.records,
  };

  const outputPath = path.join(args.outputDir, `sample-analysis-${Date.now()}.json`);
  await writeFile(outputPath, stableStringify(report), 'utf8');

  console.log(stableStringify({
    ok: true,
    outputPath,
    recordCount: loaded.records.length,
    parsedUrl,
    bestCandidates: loaded.records.slice(0, 5).map((record) => ({
      url: record.url,
      rankingPath: record.extractedSamples.rankingPath,
      matchPath: record.extractedSamples.matchPath,
      candidateArrays: record.analysis.candidateArrays.slice(0, 5),
    })),
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
