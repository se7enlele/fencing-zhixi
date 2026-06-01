import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { stableStringify } from './analyzer-core.mjs';

const FIELD_MAP = {
  eventId: {
    target: 'event_items.source_event_id',
    label: '项目内部 ID',
    note: '官方项目记录主键，适合作为源系统唯一键。',
  },
  eventCode: {
    target: 'event_items.source_event_code',
    label: '项目编码',
    note: '结果页 eventCode，后续请求成绩和对阵时会用到。',
  },
  sportId: {
    target: 'events.source_event_id',
    label: '赛事 ID',
    note: '官方赛事 ID，同一赛事下所有项目相同。',
  },
  sportCode: {
    target: 'events.source_sport_code',
    label: '赛事编码',
    note: '官方赛事编码，可辅助去重。',
  },
  eventName: {
    target: 'event_items.item_name',
    label: '项目名称',
    note: '例如 U10男子花剑个人。',
  },
  weaponCode: {
    target: 'event_items.weapon_code',
    label: '剑种编码',
    note: 'F=花剑，E=重剑，S=佩剑。',
  },
  weaponDesc: {
    target: 'event_items.weapon',
    label: '剑种',
    note: '中文剑种名称。',
  },
  gender: {
    target: 'event_items.gender_code',
    label: '性别编码',
    note: 'M=男，F=女。',
  },
  genderDesc: {
    target: 'event_items.gender',
    label: '性别',
    note: '中文性别。',
  },
  groupCode: {
    target: 'event_items.age_group_code',
    label: '年龄组编码',
    note: '例如 U10、U12、17+。',
  },
  groupName: {
    target: 'event_items.age_group',
    label: '年龄组',
    note: '展示用年龄组。',
  },
  itemType: {
    target: 'event_items.item_type_code',
    label: '项目类型编码',
    note: 'I=个人，T 通常表示团体。',
  },
  itemTypeDesc: {
    target: 'event_items.item_type',
    label: '项目类型',
    note: '个人或团体。',
  },
  regType: {
    target: 'event_items.registration_type',
    label: '报名类型',
    note: '当前样本为空，先保留。',
  },
  openDate: {
    target: 'event_items.start_date',
    label: '项目开始日期',
    note: '项目比赛或开放日期，需和赛事详情中的比赛时间交叉确认。',
  },
  closeDate: {
    target: 'event_items.end_date',
    label: '项目结束日期',
    note: '项目结束日期。',
  },
  ageMin: {
    target: 'event_items.age_min',
    label: '最小年龄',
    note: '年龄范围下限。',
  },
  ageMax: {
    target: 'event_items.age_max',
    label: '最大年龄',
    note: '年龄范围上限。',
  },
  proAgeMax: {
    target: 'event_items.pro_age_max',
    label: '专业组最大年龄',
    note: '当前样本为空，先保留。',
  },
  proAgeMin: {
    target: 'event_items.pro_age_min',
    label: '专业组最小年龄',
    note: '当前样本为空，先保留。',
  },
  amtAgeMax: {
    target: 'event_items.amateur_age_max',
    label: '业余组最大年龄',
    note: '当前样本为空，先保留。',
  },
  amtAgeMin: {
    target: 'event_items.amateur_age_min',
    label: '业余组最小年龄',
    note: '当前样本为空，先保留。',
  },
  totalRegNumber: {
    target: 'event_items.participant_count',
    label: '报名人数',
    note: '项目人数，是后续热度和项目规模分析的重要字段。',
  },
  seedsNumber: {
    target: 'event_items.seed_count',
    label: '种子人数',
    note: '当前样本为空，先保留。',
  },
  poolRegNumber: {
    target: 'event_items.pool_participant_count',
    label: '小组赛人数',
    note: '当前样本为空，先保留。',
  },
  poolQualify: {
    target: 'event_items.pool_qualify_count',
    label: '小组赛晋级人数',
    note: '当前样本为空，先保留。',
  },
  perdeStartPhaseDes: {
    target: 'event_items.pre_de_start_phase',
    label: '预淘汰开始阶段',
    note: '当前样本为空，先保留。',
  },
  deStartPhaseDes: {
    target: 'event_items.de_start_phase',
    label: '淘汰赛开始阶段',
    note: '当前样本为空，先保留。',
  },
  ruleId: {
    target: 'event_items.rule_id',
    label: '规则 ID',
    note: '当前样本为空，先保留。',
  },
};

function parseArgs(argv) {
  const args = {
    input: 'E:\\Codex\\data\\projectlist.txt',
    sourceUrl: 'https://fencing.yy-sport.com.cn/fencingapi/competition/projectlist?sportId=101212',
    outputDir: 'data/analysis',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') args.input = argv[++i];
    if (arg === '--source-url' || arg === '-u') args.sourceUrl = argv[++i];
    if (arg === '--output-dir' || arg === '-o') args.outputDir = argv[++i];
  }

  return args;
}

function countBy(rows, key) {
  return rows.reduce((map, row) => {
    const value = row[key] ?? '(空)';
    map[value] = (map[value] ?? 0) + 1;
    return map;
  }, {});
}

function summarizeNumber(rows, key) {
  const values = rows.map((row) => row[key]).filter((value) => typeof value === 'number');
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    total: values.reduce((sum, value) => sum + value, 0),
    average: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
  };
}

function getCompleteness(rows) {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return keys.map((key) => {
    const nonEmpty = rows.filter((row) => row[key] !== null && row[key] !== undefined && row[key] !== '').length;
    return {
      key,
      label: FIELD_MAP[key]?.label ?? key,
      target: FIELD_MAP[key]?.target ?? null,
      nonEmpty,
      total: rows.length,
      fillRate: Number((nonEmpty / rows.length).toFixed(4)),
      sampleValues: [...new Set(rows.map((row) => row[key]).filter((value) => value !== null && value !== undefined && value !== ''))].slice(0, 8),
      note: FIELD_MAP[key]?.note ?? '',
    };
  });
}

function normalizeItem(row) {
  return {
    sourceEventId: row.eventId,
    sourceEventCode: row.eventCode,
    sourceSportId: row.sportId,
    sourceSportCode: row.sportCode,
    itemName: row.eventName,
    weaponCode: row.weaponCode,
    weapon: row.weaponDesc,
    genderCode: row.gender,
    gender: row.genderDesc,
    ageGroupCode: row.groupCode,
    ageGroup: row.groupName,
    itemTypeCode: row.itemType,
    itemType: row.itemTypeDesc,
    startDate: row.openDate,
    endDate: row.closeDate,
    ageMin: row.ageMin,
    ageMax: row.ageMax,
    participantCount: row.totalRegNumber,
    resultLookup: {
      sportId: row.sportId,
      eventCode: row.eventCode,
      expectedResultPath: `/fencingapi/matchresult/${row.sportId}/${row.eventCode}`,
      expectedScoreResource: `/Resource/score/${row.eventCode}.js`,
    },
  };
}

export function buildProjectListReport(rows, source = {}) {
  const sportIds = [...new Set(rows.map((row) => row.sportId))];
  const eventCodes = [...new Set(rows.map((row) => row.eventCode))];
  const normalizedItems = rows.map(normalizeItem);

  return {
    ok: true,
    source,
    summary: {
      itemCount: rows.length,
      sportIds,
      sportCodes: [...new Set(rows.map((row) => row.sportCode))],
      eventCodeCount: eventCodes.length,
      totalParticipants: rows.reduce((sum, row) => sum + (row.totalRegNumber || 0), 0),
      participantStats: summarizeNumber(rows, 'totalRegNumber'),
      ageMinStats: summarizeNumber(rows, 'ageMin'),
      ageMaxStats: summarizeNumber(rows, 'ageMax'),
    },
    distributions: {
      weapon: countBy(rows, 'weaponDesc'),
      gender: countBy(rows, 'genderDesc'),
      ageGroup: countBy(rows, 'groupName'),
      itemType: countBy(rows, 'itemTypeDesc'),
      dateRange: countBy(rows, 'openDate'),
    },
    completeness: getCompleteness(rows),
    fieldMap: FIELD_MAP,
    normalizedItems,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const raw = await readFile(args.input, 'utf8');
  const rows = JSON.parse(raw);

  if (!Array.isArray(rows)) {
    throw new Error('projectlist 数据应该是 JSON 数组。');
  }

  const report = buildProjectListReport(rows, {
    input: args.input,
    sourceUrl: args.sourceUrl,
    analyzedAt: new Date().toISOString(),
  });

  await mkdir(args.outputDir, { recursive: true });
  const outputPath = path.join(args.outputDir, `projectlist-101212-analysis.json`);
  await writeFile(outputPath, stableStringify(report), 'utf8');

  console.log(stableStringify({
    ok: true,
    outputPath,
    itemCount: report.summary.itemCount,
    sportIds: report.summary.sportIds,
    totalParticipants: report.summary.totalParticipants,
    weapon: report.distributions.weapon,
    gender: report.distributions.gender,
    ageGroup: report.distributions.ageGroup,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
