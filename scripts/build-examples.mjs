// 단어 예문 데이터를 만듭니다.
//   입력: examples/src/hsk1.tsv ~ hsk6.tsv   (한자 \t 중국어 예문 \t 한국어 해석 [\t 예문 병음 직접 지정])
//   출력: examples/hsk1.json ~ hsk6.json     ({ 한자: [예문, 예문 병음, 해석] })
// 예문 병음은 pinyin-pro 로 자동 생성하고, HSK 단어 사전·얼화(儿)·문맥 규칙으로 보정합니다.
// 실행: npm run build:examples
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { pinyin, addDict, customPinyin } from 'pinyin-pro';
import CompleteDict from '@pinyin-pro/data/complete';

addDict(CompleteDict);

// HSK 단어의 정확한 병음 (一·不 이 들어간 단어는 성조 변화를 위해 pinyin-pro 에 맡김)
const hskDict = JSON.parse(readFileSync('examples/hsk-pinyin.json', 'utf8'));
const custom = {};
for (const [word, py] of Object.entries(hskDict)) {
  if (!/[一不]/.test(word)) custom[word] = py;
}
// 문맥에 따라 읽기가 달라져 자동 변환이 틀리기 쉬운 표현
Object.assign(custom, {
  长得: 'zhǎng de',
  还得: 'hái děi',
  就得: 'jiù děi',
  也得: 'yě děi',
  都得: 'dōu děi',
  得赶快: 'děi gǎn kuài',
  长大: 'zhǎng dà',
  长高: 'zhǎng gāo',
  头发长: 'tóu fa zhǎng',
  谁: 'shéi',
  教我: 'jiāo wǒ',
  教你: 'jiāo nǐ',
  教他: 'jiāo tā',
  教她: 'jiāo tā',
  教我们: 'jiāo wǒ men',
  教你们: 'jiāo nǐ men',
  教他们: 'jiāo tā men',
  教学生: 'jiāo xué sheng',
  教孩子: 'jiāo hái zi',
  教大家: 'jiāo dà jiā',
  便宜: 'pián yi',
  大夫: 'dài fu',
  重点: 'zhòng diǎn',
});
// 경험을 나타내는 동사 + 过 는 경성 guo
for (const verb of ['去', '来', '吃', '看', '听', '见', '学', '做', '用', '住', '玩', '坐', '买', '读', '说', '想', '喝', '到', '试', '写', '穿', '骑', '爬', '踢', '唱', '参观', '遇到', '听说', '学习', '见到', '经历']) {
  custom[`${verb}过`] = `${custom[verb] || pinyin(verb, { toneType: 'symbol' })} guo`;
}
customPinyin(custom);

// 儿이 독립된 음절인 단어 (그 외에는 앞 음절에 r 로 붙는 얼화)
const FULL_ER_BEFORE = new Set(['女', '婴', '幼', '孤', '宠', '健', '胎', '男', '少']);
const FULL_ER_AFTER = new Set(['子', '童', '女', '科', '歌', '戏']);

// 글자마다 병음 (자동 변환 + 보정 규칙)
function sentenceSyllables(sentence) {
  const chars = Array.from(sentence);
  const syl = pinyin(sentence, { toneType: 'symbol', type: 'array', nonZh: 'spaced' });
  if (syl.length !== chars.length) throw new Error(`병음 정렬 실패: ${sentence}`);

  // 동사·형용사 뒤의 정도보어 得 는 경성 de (자동 변환은 dé 로 읽는 경우가 많음)
  // 得到·获得처럼 단어 안의 dé, 还得처럼 '~해야 한다'의 děi 는 사전에서 이미 정해짐
  const DE_COMPOUND_NEXT = new Set(['到', '分', '意', '奖', '罪', '失', '知', '出', '病', '体', '益', '手', '胜', '以', '住', '道']);
  // 형용사·부사 뒤에서 동사를 꾸미는 구조조사 地 는 경성 de (高兴地笑了, 慢慢地走)
  const DE_ADVERBIAL_BEFORE = new Set(['兴', '慢', '真', '快', '静', '心', '力', '细', '速', '然', '悄', '渐', '断', '意', '情', '好', '默', '轻', '切', '貌', '耐', '怒', '奇', '悦', '劲', '伤', '紧', '乐', '喜', '实', '极', '暖', '利', '略', '度', '直', '静', '确', '续', '张', '诚', '真', '亲', '热', '冷', '大', '小', '深']);
  const DI_NEXT = new Set(['方', '铁', '图', '球', '区', '址', '点', '上', '下', '面', '板', '震', '理', '位', '毯', '道', '带', '势', '步', '质', '狱', '产', '盘', '域', '形', '主', '基', '名', '里', '中']);
  chars.forEach((ch, i) => {
    if (ch === '地' && syl[i] === 'dì' && DE_ADVERBIAL_BEFORE.has(chars[i - 1]) && /[\u4e00-\u9fff]/.test(chars[i + 1] || '') && !DI_NEXT.has(chars[i + 1])) {
      syl[i] = 'de';
    }
  });
  chars.forEach((ch, i) => {
    if (ch === '得' && syl[i] === 'dé' && i > 0 && /[\u4e00-\u9fff]/.test(chars[i - 1])
      && chars[i - 1] !== '不' && !DE_COMPOUND_NEXT.has(chars[i + 1])) {
      syl[i] = 'de';
    }
  });
  return syl;
}

function sentencePinyin(sentence) {
  const chars = Array.from(sentence);
  const syl = sentenceSyllables(sentence);

  const out = [];
  chars.forEach((ch, i) => {
    const isZh = /[一-鿿]/.test(ch);
    if (ch === '儿' && i > 0 && /[一-鿿]/.test(chars[i - 1])
      && !FULL_ER_BEFORE.has(chars[i - 1]) && !FULL_ER_AFTER.has(chars[i + 1])) {
      out[out.length - 1] = { ...out[out.length - 1], text: out[out.length - 1].text + 'r' };
      return;
    }
    out.push({ text: isZh ? syl[i] : ch, zh: isZh });
  });

  // 음절 사이는 띄우고, 문장부호는 앞뒤에 붙임
  let text = '';
  out.forEach((t, i) => {
    const prev = out[i - 1];
    const opensQuote = (s) => /^[“‘《（(]$/.test(s);
    if (i > 0 && t.zh && prev.zh) text += ' ';
    else if (i > 0 && t.zh && !prev.zh && !opensQuote(prev.text)) text += ' ';
    else if (i > 0 && !t.zh && opensQuote(t.text) && !/^[“‘《（(]$/.test(prev.text)) text += ' ';
    text += t.text;
  });
  text = text
    .replace(/[。]/g, '.').replace(/[，、]/g, ',').replace(/[！]/g, '!').replace(/[？]/g, '?')
    .replace(/[：]/g, ':').replace(/[；]/g, ';').replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/……/g, '…').replace(/\s+([.,!?:;…"')])/g, (m, p) => (p === '"' ? m : p))
    .trim();
  // 문장(과 이어지는 다음 문장)의 첫 글자 대문자
  return text
    .replace(/^(["'(]?)(\p{L})/u, (m, q, c) => q + c.toUpperCase())
    .replace(/([.!?…]["']?\s+["']?)(\p{L})/gu, (m, q, c) => q + c.toUpperCase());
}

// 예문 속 단어 병음이 단어 데이터의 병음과 같은지 확인 (성조 변화가 있는 一·不 는 제외)
const toneless = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const squash = (s) => s.toLowerCase().replace(/[^a-zü\u0300-\u036f\u00c0-\u024f]/g, '').normalize('NFC');
function wordPinyinInSentence(sentence, word) {
  const at = Array.from(sentence).findIndex((_, i) => Array.from(sentence).slice(i, i + Array.from(word).length).join('') === word);
  if (at < 0) return null;
  return sentenceSyllables(sentence).slice(at, at + Array.from(word).length).join('');
}

// 단어 데이터 (급수별 한자 목록)
const dataCode = ['data.js', 'data_hsk3.js', 'data_hsk4.js', 'data_hsk5.js', 'data_hsk6.js']
  .map((f) => readFileSync(f, 'utf8')).join('\n');
const wordsByLevel = vm.runInNewContext(
  `${dataCode}\n({ 1: hsk1Words, 2: hsk2Words, 3: hsk3Words, 4: hsk4Words, 5: hsk5Words, 6: hsk6Words })`
);

let problems = 0;
for (const level of [1, 2, 3, 4, 5, 6]) {
  const src = `examples/src/hsk${level}.tsv`;
  if (!existsSync(src)) continue;

  const examples = {};
  for (const [lineNo, line] of readFileSync(src, 'utf8').split('\n').entries()) {
    if (!line.trim()) continue;
    const [hanzi, zh, ko, pyOverride] = line.split('\t').map((s) => (s || '').trim());
    if (!hanzi || !zh || !ko) {
      console.warn(`⚠️ ${src}:${lineNo + 1} 칸이 비어 있음`);
      problems++;
      continue;
    }
    if (!zh.includes(hanzi)) {
      console.warn(`⚠️ ${src}:${lineNo + 1} 예문에 단어가 없음: ${hanzi} / ${zh}`);
      problems++;
    }
    const py = pyOverride || sentencePinyin(zh);
    const word = wordsByLevel[level].find((w) => w.hanzi === hanzi);
    if (!pyOverride && word && !/[一不儿]/.test(hanzi)) {
      const inSentence = wordPinyinInSentence(zh, hanzi);
      // 경성 차이(성조 표시 유무)는 허용하고, 음절 자체가 다르면 확인 요청
      if (inSentence && toneless(squash(inSentence)) !== toneless(squash(word.pinyin))) {
        console.warn(`🔤 병음 확인 ${src}:${lineNo + 1} ${hanzi}(${word.pinyin}) → 예문 속 ${inSentence} | ${zh}`);
        problems++;
      } else if (inSentence && squash(inSentence) !== squash(word.pinyin) && hanzi.length === 1) {
        console.warn(`🔤 성조 확인 ${src}:${lineNo + 1} ${hanzi}(${word.pinyin}) → 예문 속 ${inSentence} | ${zh}`);
        problems++;
      }
    }
    examples[hanzi] = [zh, py, ko];
  }

  const missing = wordsByLevel[level].map((w) => w.hanzi).filter((h) => !examples[h]);
  if (missing.length) {
    console.warn(`⚠️ HSK ${level}급 예문 없는 단어 ${missing.length}개: ${missing.slice(0, 20).join(' ')}${missing.length > 20 ? ' …' : ''}`);
    problems += missing.length;
  }
  writeFileSync(`examples/hsk${level}.json`, JSON.stringify(examples));
  console.log(`examples/hsk${level}.json  (${Object.keys(examples).length}개)`);
}
if (problems) console.warn(`\n확인이 필요한 항목 ${problems}개`);
