// ========================================
// 문장 문제 해설 (grammar.js) — 문장 조립을 틀렸을 때 '왜 틀렸는지'와 관련 문법을 알려 줍니다.
// ========================================
// 일반 스크립트로 stage-game.js 보다 먼저 불러옵니다. 외부 서비스 없이 규칙으로만 분석해요.
//
//   explainSentence(answerTiles, userTiles, timedOut)
//     → { marks: [{ tile, ok }], reasons: [문장], points: [{ title, formula, desc, tokens }] }
//
// 1) 어디가 틀렸나: 내 답과 정답을 비교해 '순서가 틀린 카드 · 빠진 카드 · 필요 없는 카드'를 찾고,
//    틀린 카드가 원래 어디에 와야 하는지 + 그 카드 종류의 어순 규칙(부사는 동사 앞 등)을 설명
// 2) 관련 문법: 정답 문장에 들어 있는 문법 패턴(把·被·比·了·过·在+장소·因为…所以 …)을 찾아 용법 노트로 보여 줌

const GrammarNotes = (() => {
  // ---------- 카드(단어) 종류 ----------
  const TIME_WORDS = new Set(['今天', '明天', '昨天', '后天', '前天', '现在', '刚才', '早上', '上午', '中午', '下午', '晚上', '今年', '明年', '去年', '每天', '每年', '每周', '每个', '周末', '下周', '上周', '这周', '下个月', '上个月', '以前', '以后', '最近', '将来', '平时', '当时', '那时', '马上', '今晚', '明早', '夜里', '星期天', '星期六', '事后', '小时候', '有时候', '有时', '一会儿']);
  const ADVERBS = new Set(['也', '都', '还', '就', '才', '再', '又', '已经', '常常', '经常', '总是', '一直', '一定', '马上', '正在', '正', '刚', '刚刚', '先', '然后', '一起', '只', '只是', '真', '最', '更', '比较', '特别', '非常', '很', '太', '挺', '有点儿', '有点', '终于', '突然', '其实', '可能', '大概', '也许', '好像', '必须', '一共', '互相', '亲自', '仍然', '依然', '始终', '果然', '竟然', '居然', '几乎', '差点儿', '到底', '究竟', '赶紧', '赶快', '尽量', '几乎', '往往', '渐渐', '逐渐', '偷偷', '顺便', '千万', '根本', '从来', '难道', '也许', '确实']);
  const NEGATIONS = new Set(['不', '没', '没有', '别', '不要', '不用', '甭']);
  const PREPOSITIONS = new Set(['在', '从', '跟', '和', '给', '对', '向', '往', '离', '为', '为了', '把', '被', '比', '让', '叫', '用', '关于', '对于', '按照', '根据', '通过', '除了', '朝', '替', '由', '自从', '沿着', '随着', '当']);
  const ASPECT = new Set(['了', '过', '着']);
  const FINAL_PARTICLES = new Set(['吗', '吧', '呢', '啊', '呀', '啦', '嘛', '哦']);
  const MODALS = new Set(['想', '要', '会', '能', '可以', '应该', '应当', '得', '需要', '愿意', '敢', '肯', '可能', '必须', '打算', '准备']);
  const QUESTION_WORDS = new Set(['什么', '谁', '哪', '哪里', '哪儿', '怎么', '怎么样', '为什么', '几', '多少', '多', '多久', '多长']);
  const COMPLEMENTS = new Set(['起来', '下来', '上来', '出来', '进来', '回来', '过来', '下去', '上去', '出去', '进去', '回去', '过去', '完', '到', '见', '好', '懂', '清楚', '干净', '错', '对', '住', '走', '掉', '开', '着']);
  const LOCALIZERS = new Set(['上', '里', '下', '中', '外', '前', '后', '旁边', '里面', '外面', '上面', '下面', '中间', '对面', '附近']);
  const CONJUNCTIONS = new Set(['因为', '所以', '虽然', '但是', '可是', '但', '如果', '要是', '就', '而且', '不但', '然后', '或者', '还是', '只要', '只有', '即使', '无论', '不管', '既然', '尽管', '于是', '否则', '不然', '而', '则', '并且', '因此', '那么', '至于']);
  const MEASURE_LIKE = /^(这|那|一|两|几|每|哪|[二三四五六七八九十])?(个|本|件|张|条|只|位|家|杯|瓶|次|遍|种|块|双|辆|台|部|岁|口|把|支|节|场|封|篇|首|片|座|所|间|层|份|套|位|顿|趟|句|门)$/;

  const isTime = (t) => TIME_WORDS.has(t) || /^[\d一二三四五六七八九十两]+(点|分|号|日|月|年)$/.test(t) || /^(星期|周)./.test(t);

  // 이 카드가 어떤 종류이고, 어순 규칙이 무엇인지
  function tileRule(t) {
    if (t === '把') return '把는 목적어 바로 앞에 와서 목적어를 동사 앞으로 끌어와요: 「주어 + 把 + 목적어 + 동사 + 了/보어」';
    if (t === '被') return '被는 동작을 받는 쪽(주어) 뒤, 하는 쪽 앞에 와요: 「받는 쪽 + 被 + 하는 쪽 + 동사」';
    if (t === '比') return '比는 비교하는 두 대상 사이에 오고, 형용사는 맨 뒤에 와요: 「A + 比 + B + 형용사」';
    if (t === '是') return '是는 주어와 설명하는 말 사이에 와요: 「A + 是 + B」';
    if (FINAL_PARTICLES.has(t)) return '어기조사(吗·吧·呢…)는 문장 맨 끝에 와요.';
    if (ASPECT.has(t)) return t === '了'
      ? '了는 동사 바로 뒤(완료) 또는 문장 끝(상황 변화)에 와요.'
      : `${t}는 동사 바로 뒤에 붙어요. (${t === '过' ? '경험: ~해 본 적 있다' : '지속: ~하고 있다/~한 채로'})`;
    if (t === '的') return '的는 꾸미는 말과 명사 사이에 와요: 「我的书」 「很贵的衣服」';
    if (t === '得') return '得는 동사·형용사 뒤에서 정도·결과를 설명해요: 「说得很好」';
    if (t === '地') return '地는 꾸미는 말 뒤, 동사 앞에 와요: 「认真地学习」';
    if (isTime(t)) return '시간 표현은 주어 앞이나 주어 바로 뒤, 동사보다 앞에 와요. 「我明天去」 「明天我去」';
    if (NEGATIONS.has(t)) return '부정어(不·没·别)는 부정하려는 동사·형용사 앞에 와요. 조동사나 개사구가 있으면 그 앞에 둬요: 「我不想去」 「他没在家吃饭」';
    if (PREPOSITIONS.has(t)) return '개사(在·从·给·跟·对…)는 뒤에 장소·사람을 데리고 동사 앞에 와요: 「주어 + 개사 + 명사 + 동사」 → 「我在图书馆看书」';
    if (MODALS.has(t)) return '조동사(想·要·会·能·可以…)는 동사 앞에 와요: 「我想喝水」';
    if (ADVERBS.has(t) || /^(很|太|非常|特别|最|更|都|也|还|不)/.test(t) && t.length > 1 && !QUESTION_WORDS.has(t)) {
      return '부사(也·都·还·已经·很…)는 주어 뒤, 동사·형용사 바로 앞에 와요: 「我们都很忙」';
    }
    if (QUESTION_WORDS.has(t)) return '중국어 의문사는 자리를 옮기지 않고, 대답이 들어갈 자리에 그대로 둬요: 「你去哪儿？」 ← 「我去学校。」';
    if (CONJUNCTIONS.has(t)) return '접속사는 보통 각 절의 맨 앞(주어 앞)에, 就·才·也 같은 짝은 뒤 절의 주어 뒤에 와요.';
    if (COMPLEMENTS.has(t)) return '결과·방향 보어(完·到·起来·下来…)는 동사 바로 뒤에 붙어요: 「看完」 「站起来」';
    if (LOCALIZERS.has(t)) return '방위사(上·里·下…)는 장소가 되는 명사 바로 뒤에 붙어요: 「桌子上」 「房间里」';
    if (MEASURE_LIKE.test(t) || /^(这|那)/.test(t) && t.length === 2) return '수사·지시사 + 양사는 명사 앞에 와요: 「一本书」 「这件衣服」';
    return null;
  }

  // ---------- 문법 패턴 (정답 문장에서 찾음) ----------
  // test(ctx): ctx = { tiles, zh, has(t), hasAny([...]), inc(str) }
  const POINTS = [
    { id: 'ba', title: '把자문 (처치문)', formula: '주어 + 把 + 목적어 + 동사 + 기타 성분',
      desc: '목적어를 어떻게 "처리"했는지 강조할 때 써요. 목적어를 把 뒤로 당겨 동사 앞에 두고, 동사 뒤에는 了·보어(完·好·下来…) 같은 성분이 꼭 붙어요.',
      tokens: ['把'], test: (c) => c.has('把') },
    { id: 'bei', title: '被자문 (피동문)', formula: '받는 쪽 + 被 (+ 하는 쪽) + 동사 + 기타 성분',
      desc: '"~에게 ~당하다". 동작을 받는 대상이 주어가 돼요. 동사 뒤에는 보통 了·보어가 붙어요: 「我的手机被偷了」',
      tokens: ['被'], test: (c) => c.has('被') },
    { id: 'bi', title: '比 비교문', formula: 'A + 比 + B + 형용사 (+ 차이)',
      desc: '"A가 B보다 ~하다". 형용사 앞에 很·非常은 쓰지 않고, 정도는 형용사 뒤에 一点儿·得多로 나타내요: 「今天比昨天冷一点儿」',
      tokens: ['比'], test: (c) => c.has('比') },
    { id: 'shide', title: '是…的 강조 구문', formula: '주어 + 是 + [시간·장소·방법] + 동사 + 的',
      desc: '이미 일어난 일의 "언제·어디서·어떻게"를 강조해요. 강조할 부분을 是와 的 사이에 넣어요: 「我是坐飞机来的」',
      tokens: ['是', '的'], test: (c) => c.has('是') && /的[。！？!?]?$/.test(c.zh) },
    { id: 'guo', title: '경험의 过', formula: '동사 + 过 (+ 목적어)',
      desc: '"~해 본 적 있다". 过는 동사 바로 뒤에 붙고, 부정은 没(有) + 동사 + 过: 「我没去过中国」',
      tokens: ['过'], test: (c) => c.has('过') },
    { id: 'zhe', title: '지속의 着', formula: '동사 + 着',
      desc: '동작이나 상태가 이어지는 것("~하고 있다/~한 채로"). 「门开着」 「他笑着说」처럼 동사 바로 뒤에 붙어요.',
      tokens: ['着'], test: (c) => c.has('着') },
    { id: 'zhengzai', title: '진행의 正在', formula: '주어 + 正在 + 동사 (+ 呢)',
      desc: '"지금 ~하고 있는 중". 正在·在는 동사 앞에, 문장 끝에 呢를 붙이기도 해요.',
      tokens: ['正在', '正', '呢'], test: (c) => c.hasAny(['正在', '正']) },
    { id: 'zaiprog', title: '진행의 在 (+ 동사)', formula: '주어 + 在 + 동사 (+ 呢)',
      desc: '在 바로 뒤에 장소가 아니라 동사가 오면 "~하고 있다"는 진행을 나타내요: 「他在哭」 「我在吃饭呢」',
      tokens: ['在', '呢'], test: (c) => { const i = c.tiles.indexOf('在'); const rest = c.tiles.slice(i + 1).filter((t) => !/^[了呢吗吧。！？!?]$/.test(t)); return i >= 0 && rest.length === 1; } },
    { id: 'yijingle', title: '已经…了', formula: '주어 + 已经 + 동사/형용사 + 了',
      desc: '"이미 ~했다/~되었다". 已经은 동사 앞, 了는 동사 뒤나 문장 끝에 와요.',
      tokens: ['已经', '了'], test: (c) => c.has('已经') },
    { id: 'kuaile', title: '곧 ~할 것이다 (快/要…了)', formula: '(快 / 快要 / 就要) + 동사 + 了',
      desc: '곧 일어날 일을 나타내요. 문장 끝의 了와 짝을 이뤄요: 「快下雨了」',
      tokens: ['快', '要', '快要', '就要', '了'], test: (c) => c.hasAny(['快', '快要', '就要']) && /了[。！？!?]?$/.test(c.zh) },
    { id: 'tailo', title: '太…了', formula: '太 + 형용사 + 了',
      desc: '"너무 ~하다". 감탄이나 지나침을 나타내고, 了가 문장 끝에 와요: 「太好了！」',
      tokens: ['太', '了'], test: (c) => c.tiles.some((t) => t.startsWith('太')) && /了[。！？!?]?$/.test(c.zh) },
    { id: 'le', title: '了의 두 가지 쓰임', formula: '동사 + 了 (완료) / 문장 + 了 (변화)',
      desc: '동사 바로 뒤의 了는 동작의 완료(「我买了一本书」), 문장 끝의 了는 새로운 상황·변화(「下雨了」)를 나타내요. 목적어에 수량이 있으면 了는 동사 바로 뒤에 둬요.',
      tokens: ['了'], test: (c) => c.has('了') },
    { id: 'de3', title: '정도보어 得', formula: '동사 + 得 + 정도 (很好·很快…)',
      desc: '동작을 "얼마나 잘/빨리" 했는지 평가해요. 목적어가 있으면 동사를 한 번 더 써요: 「他(说)汉语说得很好」',
      tokens: ['得'], test: (c) => c.has('得') },
    { id: 'de2', title: '부사어 표지 地', formula: '꾸미는 말 + 地 + 동사',
      desc: '동작을 "어떻게" 하는지 꾸며 줘요. 地는 꾸미는 말 뒤, 동사 바로 앞에 와요: 「慢慢地走」',
      tokens: ['地'], test: (c) => c.has('地') },
    { id: 'zai', title: '在 + 장소 + 동사', formula: '주어 + 在 + 장소 + 동사 (+ 목적어)',
      desc: '"~에서 ~하다". 한국어와 달리 장소(在…)가 동사보다 먼저 와요. 동사 뒤로 보내지 않게 주의!',
      tokens: ['在'], test: (c) => c.has('在') && c.tiles.indexOf('在') < c.tiles.length - 2 },
    { id: 'cong', title: '从 (출발점)', formula: '从 + 장소/시간 (+ 到 + 장소/시간) + 동사',
      desc: '"~에서(부터)". 출발점·시작 시간을 나타내고, 동사 앞에 와요: 「我从韩国来」 「从九点到五点工作」',
      tokens: ['从', '到'], test: (c) => c.has('从') },
    { id: 'gei', title: '给 + 사람 + 동사', formula: '주어 + 给 + 사람 + 동사 (+ 목적어)',
      desc: '"~에게 (~해 주다)". 받는 사람을 给 뒤에 두고 동사 앞에 와요: 「我给妈妈打电话」',
      tokens: ['给'], test: (c) => c.has('给') && c.tiles.indexOf('给') < c.tiles.length - 2 },
    { id: 'gen', title: '跟/和 … 一起', formula: '주어 + 跟/和 + 사람 + (一起) + 동사',
      desc: '"~와 함께 ~하다". 함께하는 사람 + 一起를 동사 앞에 둬요: 「我跟朋友一起吃饭」',
      tokens: ['跟', '和', '一起'], test: (c) => c.hasAny(['跟', '一起']) || (c.has('和') && c.has('一起')) },
    { id: 'dui', title: '对 / 向 (대상)', formula: '주어 + 对/向 + 대상 + 동사·형용사',
      desc: '"~에게/~에 대해". 대상을 나타내는 개사구는 동사·형용사 앞에 와요: 「他对我很好」 「向老师道歉」',
      tokens: ['对', '向'], test: (c) => c.hasAny(['对', '向']) && !c.inc('对不起') },
    { id: 'li', title: '离 (거리)', formula: 'A + 离 + B + 远/近',
      desc: '"A는 B에서 멀다/가깝다". 기준점을 离 뒤에 둬요: 「我家离学校很近」',
      tokens: ['离'], test: (c) => c.has('离') },
    { id: 'rang', title: '사역 让/叫', formula: '주어 + 让/叫 + 사람 + 동사',
      desc: '"(누구에게) ~하게 하다/시키다". 시키는 대상이 让 바로 뒤에 와요: 「妈妈让我早点儿睡」',
      tokens: ['让', '叫'], test: (c) => c.has('让') || (c.has('叫') && c.tiles.indexOf('叫') < c.tiles.length - 2) },
    { id: 'yinwei', title: '因为…所以…', formula: '因为 + 원인, 所以 + 결과',
      desc: '원인 → 결과 순서예요. 둘 중 하나만 써도 돼요.',
      tokens: ['因为', '所以'], test: (c) => c.hasAny(['因为', '所以']) },
    { id: 'suiran', title: '虽然…但是…', formula: '虽然 + A, 但是/可是 + B',
      desc: '"비록 A지만 B". 앞 절에 虽然, 뒤 절 맨 앞에 但是·可是를 써요.',
      tokens: ['虽然', '但是', '可是', '但'], test: (c) => c.hasAny(['虽然', '但是', '可是', '尽管']) },
    { id: 'ruguo', title: '如果/要是…就…', formula: '如果 + 조건, (주어) + 就 + 결과',
      desc: '"만약 ~라면 ~하다". 就는 뒤 절의 주어 뒤, 동사 앞에 와요.',
      tokens: ['如果', '要是', '就'], test: (c) => c.hasAny(['如果', '要是', '假如']) },
    { id: 'yijiu', title: '一…就…', formula: '一 + 동작A, 就 + 동작B',
      desc: '"~하자마자 ~하다". 一와 就 모두 동사 앞에 와요: 「我一到家就睡觉」',
      tokens: ['一', '就'], test: (c) => c.has('一') && c.has('就') },
    { id: 'yue', title: '越…越… / 越来越', formula: '越 + A + 越 + B / 越来越 + 형용사',
      desc: '"~할수록 더 ~하다" / "점점 더 ~하다". 越来越 뒤에는 很·非常을 쓰지 않아요.',
      tokens: ['越', '越来越'], test: (c) => c.inc('越') },
    { id: 'zhiyou', title: '只要…就 / 只有…才', formula: '只要 + 조건, 就… / 只有 + 조건, 才…',
      desc: '只要…就는 "~하기만 하면(충분조건)", 只有…才는 "~해야만(유일한 조건)". 就·才는 뒤 절의 동사 앞에 와요.',
      tokens: ['只要', '只有', '就', '才'], test: (c) => c.hasAny(['只要', '只有']) },
    { id: 'buguan', title: '不管/无论…都…', formula: '不管/无论 + 의문사·선택, (주어) + 都 + …',
      desc: '"~에 관계없이 모두 ~하다". 앞 절에는 의문사나 A还是B가 오고, 뒤 절에 都(也)가 와요.',
      tokens: ['不管', '无论', '都', '也'], test: (c) => c.hasAny(['不管', '无论']) },
    { id: 'jishi', title: '即使…也…', formula: '即使 + 가정, (주어) + 也 + …',
      desc: '"설령 ~하더라도 ~하다". 也는 뒤 절의 동사 앞에 와요.',
      tokens: ['即使', '也'], test: (c) => c.hasAny(['即使', '哪怕', '就是']) && c.has('也') },
    { id: 'jiran', title: '既然…就…', formula: '既然 + 이미 그런 사실, 就 + 결론',
      desc: '"기왕 ~했으니 ~하자". 이미 정해진 사실을 근거로 결론을 말해요.',
      tokens: ['既然', '就'], test: (c) => c.has('既然') },
    { id: 'chule', title: '除了…以外', formula: '除了 + A (+ 以外), 还/也/都 …',
      desc: '还·也와 쓰면 "A 말고도 또", 都와 쓰면 "A를 빼고 모두"라는 뜻이에요.',
      tokens: ['除了', '以外', '还', '也', '都'], test: (c) => c.has('除了') },
    { id: 'budan', title: '不但…而且…', formula: '不但 + A, 而且 + B',
      desc: '"A일 뿐만 아니라 B도". 뒤 절에 还·也를 함께 쓰기도 해요.',
      tokens: ['不但', '而且', '还', '也'], test: (c) => c.hasAny(['不但', '不仅', '而且']) },
    { id: 'youyou', title: '又…又…', formula: '又 + 형용사A + 又 + 형용사B',
      desc: '"~하기도 하고 ~하기도 하다". 두 성질을 나란히 말해요: 「又便宜又好吃」',
      tokens: ['又'], test: (c) => c.tiles.filter((t) => t === '又').length >= 2 || c.inc('又') && (c.zh.match(/又/g) || []).length >= 2 },
    { id: 'lian', title: '连…都/也…', formula: '连 + 극단적인 예 + 都/也 + …',
      desc: '"~조차도". 都·也가 꼭 짝으로 와요: 「他连饭都没吃」',
      tokens: ['连', '都', '也'], test: (c) => c.has('连') },
    { id: 'bie', title: '금지 别/不要', formula: '别 / 不要 + 동사 (+ 了)',
      desc: '"~하지 마". 동사 앞에 와요. 문장 끝 了를 붙이면 "이제 그만 ~해"라는 느낌이에요.',
      tokens: ['别', '不要'], test: (c) => c.hasAny(['别', '不要']) },
    { id: 'qing', title: '请 + 동사 (공손한 부탁)', formula: '请 + (사람) + 동사',
      desc: '"~해 주세요". 문장 맨 앞에 请을 두고 바로 동사를 써요: 「请坐」 「请你帮我一下」',
      tokens: ['请'], test: (c) => c.tiles[0] === '请' },
    { id: 'yixia', title: '동사 + 一下', formula: '동사 + 一下 (+ 목적어)',
      desc: '"좀 ~해 보다". 동작을 가볍게 짧게 할 때 동사 바로 뒤에 붙여요: 「你看一下」',
      tokens: ['一下'], test: (c) => c.has('一下') },
    { id: 'youdianr', title: '有点儿 vs 一点儿', formula: '有点儿 + 형용사 / 형용사 + 一点儿',
      desc: '有点儿은 형용사 앞에서 "좀 (불만스럽게) ~하다", 一点儿은 형용사·동사 뒤에서 "조금 더 ~": 「有点儿贵」 「便宜一点儿」',
      tokens: ['有点儿', '一点儿'], test: (c) => c.hasAny(['有点儿', '有点', '一点儿']) },
    { id: 'modal', title: '조동사 (능력·바람·허가)', formula: '주어 + 조동사 + 동사',
      desc: '会(배워서 할 줄 알다)·能(능력·조건상 가능)·可以(허락)·想/要(바람). 조동사는 동사 앞, 부정은 不 + 조동사: 「我不会游泳」',
      tokens: ['会', '能', '可以', '想', '要', '应该', '得'], test: (c) => c.hasAny(['会', '能', '可以', '想', '应该']) || c.tiles.some((t) => /^(不|很)?(想|会|能|可以|应该)$/.test(t)) },
    { id: 'complement', title: '결과·방향 보어', formula: '동사 + 보어 (完·到·好·起来·下来…)',
      desc: '동작의 결과나 방향을 동사 바로 뒤에 붙여 말해요: 「做完」 「找到」 「站起来」. 부정은 没 + 동사 + 보어.',
      tokens: ['完', '到', '见', '好', '起来', '下来', '出来', '回来', '下去'], test: (c) => c.hasAny(['完', '见', '起来', '下来', '出来', '回来', '下去', '上来']) },
    { id: 'de1', title: '구조조사 的', formula: '꾸미는 말 + 的 + 명사',
      desc: '소유·성질을 나타내요. 꾸미는 말은 항상 명사 앞에 와요: 「我的朋友」 「昨天买的书」',
      tokens: ['的'], test: (c) => c.has('的') },
    { id: 'measure', title: '양사', formula: '수사/这·那 + 양사 + 명사',
      desc: '명사를 셀 때는 숫자나 这·那 뒤에 양사를 꼭 붙이고, 그다음에 명사를 써요: 「一本书」 「这件衣服」',
      tokens: [], test: (c) => c.tiles.some((t) => MEASURE_LIKE.test(t) || /^(这|那|一|每)(个|本|件|张|条|只|位|家|杯|种|次|辆|双|块)$/.test(t)) },
    { id: 'qword', title: '의문사 의문문', formula: '대답이 들어갈 자리에 의문사',
      desc: '중국어는 의문사를 문장 앞으로 옮기지 않아요. 평서문에서 모르는 부분만 의문사로 바꾸고, 吗는 붙이지 않아요.',
      tokens: ['什么', '谁', '哪', '哪里', '哪儿', '怎么', '怎么样', '为什么', '几', '多少'], test: (c) => c.tiles.some((t) => QUESTION_WORDS.has(t)) },
    { id: 'ma', title: '吗/吧/呢 의문·제안', formula: '평서문 + 吗？ / 문장 + 吧 / 문장 + 呢？',
      desc: '吗는 예/아니오 질문, 吧는 제안·추측("~하자/~이지?"), 呢는 "~는요?" 되묻기·진행. 모두 문장 맨 끝에 와요.',
      tokens: ['吗', '吧', '呢'], test: (c) => c.hasAny(['吗', '吧', '呢']) },
    { id: 'adverb', title: '부사의 자리', formula: '주어 + 부사 + 동사/형용사',
      desc: '也·都·还·就·已经·很 같은 부사는 주어 뒤, 동사·형용사 바로 앞에 와요. 부사가 여러 개면 「也都」「都不」처럼 이어서 써요.',
      tokens: [...ADVERBS], test: (c) => c.tiles.some((t) => ADVERBS.has(t)) },
    { id: 'time', title: '시간 표현의 자리', formula: '(시간) + 주어 + (시간) + 동사',
      desc: '"언제"는 동사보다 앞에 와요. 주어 앞이나 바로 뒤 둘 다 괜찮지만, 동사 뒤로는 가지 않아요.',
      tokens: [...TIME_WORDS], test: (c) => c.tiles.some(isTime) },
    { id: 'svo', title: '기본 어순', formula: '주어 + (시간·부사·개사구) + 동사 + 목적어',
      desc: '중국어는 한국어와 달리 목적어가 동사 뒤에 와요. 「나는 밥을 먹는다」 → 「我吃饭」. 꾸미는 말(시간·장소·부사)은 동사 앞에 모아 둬요.',
      tokens: [], test: () => true },
  ];

  // 최장 공통 부분 수열: 정답 순서와 맞게 놓인 카드 표시
  function lcsMatch(a, b) {
    const n = a.length;
    const m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const okA = new Array(n).fill(false);
    const okB = new Array(m).fill(false);
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { okA[i] = true; okB[j] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return { okA, okB };
  }

  const q = (t) => `‘${t}’`;

  function placeHint(answer, idx) {
    const before = answer[idx - 1];
    const after = answer[idx + 1];
    const me = `${q(answer[idx])} 카드는`;
    if (before && after) return `${me} ${q(before)} 뒤, ${q(after)} 앞에 와야 해요.`;
    if (after) return `${me} 문장 맨 앞(${q(after)} 앞)에 와야 해요.`;
    if (before) return `${me} 문장 맨 끝(${q(before)} 뒤)에 와야 해요.`;
    return '';
  }

  function explainSentence(answer, user, timedOut) {
    const reasons = [];
    const { okA, okB } = lcsMatch(answer, user);
    const marks = user.map((tile, i) => ({ tile, ok: okB[i] }));

    // 1) 필요 없는 카드 (정답에 없는 함정 카드)
    const remaining = [...answer];
    const extras = [];
    user.forEach((t) => {
      const k = remaining.indexOf(t);
      if (k >= 0) remaining.splice(k, 1);
      else extras.push(t);
    });
    extras.forEach((t) => reasons.push(`${q(t)} 카드는 이 문장에 필요 없는 함정 카드예요. 뜻이 비슷해 보여도 정답 문장에는 들어가지 않아요.`));

    // 2) 빠진 카드
    if (remaining.length && user.length) {
      reasons.push(`빠진 카드: ${remaining.map(q).join(' ')}`);
    }

    // 3) 자리가 틀린 카드 (내 답에는 있지만 순서가 맞지 않음)
    const misplaced = [];
    answer.forEach((t, i) => {
      if (!okA[i] && user.includes(t) && !misplaced.some((m) => m.tile === t)) misplaced.push({ tile: t, idx: i });
    });
    const ruleShown = new Set();
    misplaced.slice(0, 3).forEach(({ tile, idx }) => {
      let text = placeHint(answer, idx);
      const rule = tileRule(tile);
      if (rule && !ruleShown.has(rule)) {
        ruleShown.add(rule);
        text += ` ${rule}`;
      }
      reasons.push(text);
    });

    if (!user.length) {
      reasons.push(timedOut
        ? '시간 안에 카드를 놓지 못했어요. 먼저 주어와 동사를 찾고, 그 앞에 올 말(시간·부사·장소)과 뒤에 올 말(목적어)을 나눠 보세요.'
        : '카드를 놓지 않았어요.');
    } else if (timedOut && !reasons.length) {
      reasons.push('지금까지 놓은 순서는 맞았어요. 시간이 조금 부족했어요!');
    } else if (!reasons.length) {
      reasons.push('순서를 다시 확인해 보세요.');
    }

    // 4) 관련 문법: 틀린 카드와 관련된 패턴을 먼저, 그다음 문장에 있는 패턴
    const ctx = {
      tiles: answer,
      zh: answer.join(''),
      has: (t) => answer.includes(t),
      hasAny: (ts) => ts.some((t) => answer.includes(t)),
      inc: (s) => answer.join('').includes(s),
    };
    const found = POINTS.filter((p) => {
      try { return p.test(ctx); } catch (e) { return false; }
    });
    const wrongTiles = new Set([...misplaced.map((m) => m.tile), ...remaining, ...extras]);
    const related = found.filter((p) => p.tokens.some((t) => wrongTiles.has(t)));
    const others = found.filter((p) => !related.includes(p));
    let points = [...related, ...others];
    // 일반 규칙(기본 어순·부사·시간)은 더 구체적인 패턴이 없을 때만
    const generic = new Set(['svo', 'adverb', 'time', 'de1', 'le']);
    const specific = points.filter((p) => !generic.has(p.id));
    const relatedGeneric = related.filter((p) => generic.has(p.id));
    points = [...relatedGeneric.filter((p) => p.id !== 'svo'), ...specific];
    if (points.length < 2) points.push(...found.filter((p) => generic.has(p.id) && !points.includes(p)));
    points = points.slice(0, 2);

    // 예문에서 강조할 카드: 패턴 단어 + (양사·시간 표현처럼 모양으로 찾는 것)
    const shapeTokens = {
      measure: answer.filter((t) => MEASURE_LIKE.test(t)),
      time: answer.filter(isTime),
      qword: answer.filter((t) => QUESTION_WORDS.has(t)),
    };
    return {
      marks,
      reasons,
      points: points.map(({ id, title, formula, desc, tokens }) => ({
        title, formula, desc, tokens: [...tokens.filter((t) => answer.includes(t)), ...(shapeTokens[id] || [])],
      })),
    };
  }

  return { explainSentence, tileRule };
})();
