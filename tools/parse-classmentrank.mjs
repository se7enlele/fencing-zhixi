import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { stableStringify } from './analyzer-core.mjs';

const FIELD_MAP = {
  eventshowrank: {
    target: 'event_entries.display_rank',
    label: '展示名次',
    note: '可能出现并列名次或 DNS 等非数字展示值。',
    privacy: 'public_result',
  },
  eventrank: {
    target: 'event_entries.final_rank',
    label: '排序名次',
    note: '通常为数字字符串，适合作为排名排序依据。',
    privacy: 'public_result',
  },
  fencer: {
    target: 'athletes.display_name',
    label: '运动员姓名',
    note: '可识别个人，公开页应支持隐藏和纠错。',
    privacy: 'personal_info',
  },
  licence: {
    target: 'athlete_source_ids.source_licence',
    label: '运动员注册号',
    note: '强标识符，不建议公开展示；只用于内部去重和同名消歧。',
    privacy: 'sensitive_identifier',
  },
  noccode: {
    target: 'clubs.name',
    label: '代表单位/俱乐部',
    note: '用于俱乐部归一和运动员消歧。',
    privacy: 'public_result',
  },
  organname: {
    target: 'clubs.source_organ_name',
    label: '组织名称',
    note: '当前样本为空，先保留。',
    privacy: 'public_result',
  },
  organcode: {
    target: 'clubs.source_organ_code',
    label: '组织编码',
    note: '当前样本为空，若出现则不建议公开展示。',
    privacy: 'internal_identifier',
  },
  birthday: {
    target: 'athlete_source_profiles.birthday',
    label: '出生日期',
    note: '未成年人敏感信息，不建议入公开展示；如存储需最小化和权限控制。',
    privacy: 'sensitive_minor_info',
  },
  medal: {
    target: 'event_entries.medal',
    label: '奖牌',
    note: '金、银、铜或空值。',
    privacy: 'public_result',
  },
  valiable: {
    target: 'event_entries.source_valiable',
    label: '源状态字段',
    note: '当前样本为空，保留原始值。',
    privacy: 'internal',
  },
  statut: {
    target: 'event_entries.source_status',
    label: '源状态',
    note: '当前样本为 N，含义待更多样本确认。',
    privacy: 'internal',
  },
  feventdispos: {
    target: 'event_entries.source_position',
    label: '源排序位置',
    note: '看起来与最终排序位置一致。',
    privacy: 'public_result',
  },
  rid: {
    target: 'event_entries.source_result_id',
    label: '结果 ID',
    note: '当前样本为空。',
    privacy: 'internal_identifier',
  },
  points: {
    target: 'event_entries.points',
    label: '积分',
    note: '当前样本为空。',
    privacy: 'public_result',
  },
  ecode: {
    target: 'event_items.source_event_code',
    label: '项目编码',
    note: '对应 projectlist.eventCode。',
    privacy: 'public_result',
  },
  qualifystatusid: {
    target: 'event_entries.qualification_status',
    label: '晋级/有效状态',
    note: '样本中 1 多见于正常名次，0 出现在 DNS 和后段名次；含义需结合对阵数据确认。',
    privacy: 'public_result',
  },
  itemtype: {
    target: 'event_entries.item_type',
    label: '项目类型',
    note: '当前样本为空。',
    privacy: 'public_result',
  },
  members: {
    target: 'event_entry_members.raw_members',
    label: '团体成员',
    note: '个人项目中为 [null]，团体项目可能会填充成员列表。',
    privacy: 'personal_info',
  },
};

function parseArgs(argv) {
  const args = {
    input: 'E:\\Codex\\data\\classmentrank.txt',
    sourceUrl: 'https://fencing.yy-sport.com.cn/fencingapi/matchresult/classmentrank/RZSS2036022MFIU8',
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

function parseRank(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function countBy(rows, getter) {
  return rows.reduce((map, row) => {
    const value = getter(row) ?? '(空)';
    map[value] = (map[value] ?? 0) + 1;
    return map;
  }, {});
}

function getCompleteness(rows) {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return keys.map((key) => {
    const nonEmpty = rows.filter((row) => {
      const value = row[key];
      return value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.every((item) => item === null));
    }).length;

    return {
      key,
      label: FIELD_MAP[key]?.label ?? key,
      target: FIELD_MAP[key]?.target ?? null,
      nonEmpty,
      total: rows.length,
      fillRate: Number((nonEmpty / rows.length).toFixed(4)),
      sampleValues: [...new Set(rows.map((row) => row[key]).filter((value) => value !== null && value !== undefined && value !== ''))].slice(0, 8),
      privacy: FIELD_MAP[key]?.privacy ?? 'unknown',
      note: FIELD_MAP[key]?.note ?? '',
    };
  });
}

function normalizeEntry(row) {
  return {
    sourceEventCode: row.ecode,
    displayRank: row.eventshowrank,
    finalRank: parseRank(row.eventrank),
    athlete: {
      displayName: row.fencer,
      sourceLicence: row.licence,
      birthday: row.birthday,
    },
    club: {
      name: row.noccode,
      sourceOrganName: row.organname,
      sourceOrganCode: row.organcode,
    },
    medal: row.medal || null,
    sourceStatus: row.statut,
    sourcePosition: parseRank(row.feventdispos),
    points: row.points,
    qualificationStatus: row.qualifystatusid,
    rawMembers: row.members,
  };
}

function buildReport(payload, source) {
  const rows = payload.data;
  if (!Array.isArray(rows)) {
    throw new Error('classmentrank 响应应包含 data 数组。');
  }

  const normalizedEntries = rows.map(normalizeEntry);
  const numericRanks = normalizedEntries.map((entry) => entry.finalRank).filter((rank) => rank !== null);
  const dnsCount = rows.filter((row) => String(row.eventshowrank).toUpperCase() === 'DNS').length;

  return {
    ok: true,
    source,
    response: {
      code: payload.code,
      msg: payload.msg,
    },
    summary: {
      entryCount: rows.length,
      eventCodes: [...new Set(rows.map((row) => row.ecode))],
      rankMin: Math.min(...numericRanks),
      rankMax: Math.max(...numericRanks),
      dnsCount,
      medalCount: countBy(rows, (row) => row.medal || '(无奖牌)'),
      clubCount: Object.keys(countBy(rows, (row) => row.noccode)).length,
      athleteCount: new Set(rows.map((row) => row.licence || row.fencer)).size,
    },
    distributions: {
      displayRank: countBy(rows, (row) => row.eventshowrank),
      medal: countBy(rows, (row) => row.medal || '(无奖牌)'),
      clubTop20: Object.fromEntries(
        Object.entries(countBy(rows, (row) => row.noccode))
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20),
      ),
      qualificationStatus: countBy(rows, (row) => row.qualifystatusid),
      sourceStatus: countBy(rows, (row) => row.statut),
    },
    completeness: getCompleteness(rows),
    fieldMap: FIELD_MAP,
    normalizedEntries,
    publicDisplayRecommendation: {
      show: ['displayRank', 'athlete.displayName', 'club.name', 'medal'],
      hideByDefault: ['athlete.sourceLicence', 'athlete.birthday'],
      note: '公开页建议不展示 licence 和 birthday；内部可用于去重、年龄组校验和同名消歧。',
    },
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const raw = await readFile(args.input, 'utf8');
  const payload = JSON.parse(raw);
  const report = buildReport(payload, {
    input: args.input,
    sourceUrl: args.sourceUrl,
    analyzedAt: new Date().toISOString(),
  });

  await mkdir(args.outputDir, { recursive: true });
  const eventCode = report.summary.eventCodes[0] ?? 'unknown';
  const outputPath = path.join(args.outputDir, `classmentrank-${eventCode}-analysis.json`);
  await writeFile(outputPath, stableStringify(report), 'utf8');

  console.log(stableStringify({
    ok: true,
    outputPath,
    entryCount: report.summary.entryCount,
    eventCodes: report.summary.eventCodes,
    rankRange: [report.summary.rankMin, report.summary.rankMax],
    dnsCount: report.summary.dnsCount,
    medalCount: report.summary.medalCount,
    clubTop10: Object.fromEntries(Object.entries(report.distributions.clubTop20).slice(0, 10)),
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
