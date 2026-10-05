// ========================================
// 한자 학습 게임 — App Logic
// ========================================

// ========================================
// HSK 단어 데이터
// ========================================

// HSK 1~6 데이터는 외부 파일 (data.js, data_hsk3.js ~ data_hsk6.js) 에서 로드됩니다.

// ========================================
// 모든 난이도별 데이터 매핑
// ========================================
const wordsByLevel = {
  1: hsk1Words,
  2: hsk2Words,
  3: hsk3Words,
  4: hsk4Words,
  5: hsk5Words,
  6: hsk6Words,
};

// ========================================
// HSK Sentence Data (문장 작문 게임용)
// ========================================
const hsk1Sentences = [
  { korean: '나는 내일 베이징에 갑니다.', chinese: '我明天去北京。', words: ['我', '明天', '去', '北京'], traps: ['昨天', '来'] },
  { korean: '그는 내 친구입니다.', chinese: '他是我的朋友。', words: ['他', '是', '我', '的', '朋友'], traps: ['她', '老师'] },
  { korean: '이것은 누구의 책입니까?', chinese: '这是谁的书？', words: ['这', '是', '谁', '的', '书'], traps: ['那', '什么'] },
  { korean: '나는 중국어를 할 줄 압니다.', chinese: '我会说汉语。', words: ['我', '会', '说', '汉语'], traps: ['能', '写'] },
  { korean: '지금 몇 시인가요?', chinese: '现在几点？', words: ['现在', '几点'], traps: ['今天', '什么'] },
  { korean: '만나서 반갑습니다.', chinese: '很高兴认识你。', words: ['很', '高兴', '认识', '你'], traps: ['太', '看'] },
  { korean: '우리 아빠는 의사입니다.', chinese: '我爸爸是医生。', words: ['我', '爸爸', '是', '医生'], traps: ['妈妈', '在'] },
  { korean: '어제 비가 내렸습니다.', chinese: '昨天下雨了。', words: ['昨天', '下雨', '了'], traps: ['明天', '天气'] },
  { korean: '그녀는 사과 먹는 것을 좋아합니다.', chinese: '她喜欢吃苹果。', words: ['她', '喜欢', '吃', '苹果'], traps: ['他', '喝'] },
  { korean: '도서관에 사람이 매우 많습니다.', chinese: '图书馆人很多。', words: ['图书馆', '人', '很', '多'], traps: ['少', '哪儿'] }
];

const hsk2Sentences = [
  { korean: '내 여동생은 노래 부르는 것을 좋아해.', chinese: '我妹妹喜欢唱歌。', words: ['我', '妹妹', '喜欢', '唱歌'], traps: ['姐姐', '跳舞'] },
  { korean: '너는 매일 아침 몇 시에 일어나니?', chinese: '你每天早上几点起床？', words: ['你', '每天', '早上', '几点', '起床'], traps: ['睡觉', '晚上'] },
  { korean: '이 옷은 매우 싸다.', chinese: '这件衣服很便宜。', words: ['这', '件', '衣服', '很', '便宜'], traps: ['那', '贵'] },
  { korean: '나는 이미 밥을 다 먹었어.', chinese: '我已经吃完饭了。', words: ['我', '已经', '吃完', '饭', '了'], traps: ['还', '没'] },
  { korean: '문 밖에 한 사람이 서 있습니다.', chinese: '门外站着一个人。', words: ['门', '外', '站着', '一个', '人'], traps: ['里', '坐着'] },
  { korean: '너 어제 왜 안 왔어?', chinese: '你昨天为什么没来？', words: ['你', '昨天', '为什么', '没', '来'], traps: ['怎么', '不'] },
  { korean: '방 안이 너무 어두워요.', chinese: '房间里太黑了。', words: ['房间', '里', '太', '黑', '了'], traps: ['外', '白'] },
  { korean: '도와주셔서 정말 감사합니다.', chinese: '非常感谢你的帮助。', words: ['非常', '感谢', '你', '的', '帮助'], traps: ['觉得', '客气'] },
  { korean: '우리는 내일 같이 농구할 거야.', chinese: '我们明天一起打篮球。', words: ['我们', '明天', '一起', '打篮球'], traps: ['你们', '踢足球'] },
  { korean: '그는 시험을 매우 잘 봤다.', chinese: '他考试考得很好。', words: ['他', '考试', '考得', '很', '好'], traps: ['的', '错'] }
];

const hsk3Sentences = [
  { korean: '회의가 방금 끝났습니다.', chinese: '会议刚才结束了。', words: ['会议', '刚才', '结束', '了'], traps: ['终于', '开始'] },
  { korean: '이 문제는 해결하기 비교적 간단하다.', chinese: '这个问题解决起来比较简单。', words: ['这个', '问题', '解决', '起来', '比较', '简单'], traps: ['办法', '容易'] },
  { korean: '나는 내일 상하이로 출장을 가야 해.', chinese: '我明天必须去上海出差。', words: ['我', '明天', '必须', '去', '上海', '出差'], traps: ['应该', '旅游'] },
  { korean: '집안 환경을 깨끗하게 유지해야 합니다.', chinese: '要保持家里环境的干净。', words: ['要', '保持', '家里', '环境', '的', '干净'], traps: ['保护', '安静'] },
  { korean: '내 생각에 이 신발은 너에게 매우 잘 어울려.', chinese: '我觉得这双鞋对你很合适。', words: ['我', '觉得', '这', '双', '鞋', '对', '你', '很', '合适'], traps: ['看', '件'] },
  { korean: '그는 감기에 걸려서 병원에 갔습니다.', chinese: '他感冒了，所以去医院了。', words: ['他', '感冒', '了，', '所以', '去', '医院', '了'], traps: ['发烧', '因为'] },
  { korean: '봄이 오면 날씨가 따뜻해진다.', chinese: '春天来了，天气变暖和了。', words: ['春天', '来', '了，', '天气', '变', '暖和', '了'], traps: ['秋天', '冷'] },
  { korean: '그들은 이야기를 하며 웃기 시작했다.', chinese: '他们说着说着就笑了起来。', words: ['他们', '说着', '说着', '就', '笑', '了', '起来'], traps: ['哭', '才'] },
  { korean: '나는 지하철을 타고 퇴근하는 것을 선호해.', chinese: '我更愿意坐地铁下班。', words: ['我', '更', '愿意', '坐地铁', '下班'], traps: ['最', '上班'] },
  { korean: '갑자기 비가 오기 시작했다.', chinese: '突然下起雨来了。', words: ['突然', '下起', '雨', '来', '了'], traps: ['虽然', '雪'] }
];

const hsk4Sentences = [
  { korean: '실패는 성공의 어머니이다.', chinese: '失败是成功之母。', words: ['失败', '是', '成功', '之', '母'], traps: ['错误', '的'] },
  { korean: '모두가 이번 행사에 적극적으로 참여했습니다.', chinese: '大家都积极参加了这次活动。', words: ['大家', '都', '积极', '参加', '了', '这次', '活动'], traps: ['热情', '那次'] },
  { korean: '그녀는 뛰어난 피아노 연주 실력을 가지고 있다.', chinese: '她有非常出色的钢琴弹奏水平。', words: ['她', '有', '非常', '出色', '的', '钢琴', '弹奏', '水平'], traps: ['他', '吉他'] },
  { korean: '자연을 보호하는 것은 우리 모두의 책임입니다.', chinese: '保护自然是我们共同的责任。', words: ['保护', '自然', '是', '我们', '共同', '的', '责任'], traps: ['保证', '决定'] },
  { korean: '나는 이 영화가 꽤 감동적이라고 생각해.', chinese: '我认为这部电影挺感人的。', words: ['我', '认为', '这', '部', '电影', '挺', '感人', '的'], traps: ['以为', '本'] },
  { korean: '계획대로 진행하면 문제없을 거야.', chinese: '按计划进行就不会有问题。', words: ['按', '计划', '进行', '就', '不会', '有', '问题'], traps: ['照', '能'] },
  { korean: '그는 경험이 풍부한 변호사입니다.', chinese: '他是一位经验丰富的律师。', words: ['他', '是', '一位', '经验', '丰富', '的', '律师'], traps: ['经历', '大夫'] },
  { korean: '현대 사회에서 인터넷은 필수 불가결하다.', chinese: '在现代社会，网络是必不可少的。', words: ['在', '现代', '社会，', '网络', '是', '必不可少', '的'], traps: ['网球', '不得不'] },
  { korean: '오해를 풀기 위해서는 소통이 중요합니다.', chinese: '为了解除误会，沟通很重要。', words: ['为了', '解除', '误会，', '沟通', '很', '重要'], traps: ['除了', '理解'] },
  { korean: '그의 유머러스한 성격이 분위기를 띄웠다.', chinese: '他幽默的性格活跃了气氛。', words: ['他', '幽默', '的', '性格', '活跃', '了', '气氛'], traps: ['脾气', '活泼'] }
];

const hsk5Sentences = [
  { korean: '인생은 수많은 선택의 연속이다.', chinese: '人生是无数次选择的延续。', words: ['人生', '是', '无数次', '选择', '的', '延续'], traps: ['生活', '决定'] },
  { korean: '환경 오염 문제는 갈수록 심각해지고 있다.', chinese: '环境污染问题日益严重。', words: ['环境污染', '问题', '日益', '严重'], traps: ['保护', '逐渐'] },
  { korean: '기업은 혁신을 통해 경쟁력을 강화해야 한다.', chinese: '企业需要通过创新增强竞争力。', words: ['企业', '需要', '通过', '创新', '增强', '竞争力'], traps: ['创造', '公司'] },
  { korean: '그는 뛰어난 리더십으로 팀을 승리로 이끌었다.', chinese: '他凭借出色的领导力带领团队走向胜利。', words: ['他', '凭借', '出色', '的', '领导力', '带领', '团队', '走向', '胜利'], traps: ['依靠', '成功'] },
  { korean: '전통 문화를 보존하는 것은 매우 가치 있는 일이다.', chinese: '保存传统文化是一件非常有价值的事情。', words: ['保存', '传统文化', '是', '一件', '非常', '有价值', '的', '事情'], traps: ['保留', '价格'] },
  { korean: '건강한 식습관이 장수의 비결입니다.', chinese: '健康的饮食习惯是长寿的秘诀。', words: ['健康', '的', '饮食', '习惯', '是', '长寿', '的', '秘诀'], traps: ['食品', '秘密'] },
  { korean: '지나친 스트레스는 정신 건강에 해롭다.', chinese: '过度的压力对心理健康有害。', words: ['过度', '的', '压力', '对', '心理健康', '有害'], traps: ['过分', '精神'] },
  { korean: '그녀는 어떠한 어려움에도 결코 포기하지 않는다.', chinese: '无论遇到什么困难，她都决不放弃。', words: ['无论', '遇到', '什么', '困难，', '她', '都', '决不', '放弃'], traps: ['虽然', '绝望'] },
  { korean: '경제 발전과 환경 보호는 균형을 이루어야 한다.', chinese: '经济发展和环境保护必须取得平衡。', words: ['经济', '发展', '和', '环境保护', '必须', '取得', '平衡'], traps: ['条件', '得到'] },
  { korean: '이 프로젝트의 성공 여부는 협력에 달려 있다.', chinese: '这个项目的成败取决于团队合作。', words: ['这个', '项目', '的', '成败', '取决于', '团队', '合作'], traps: ['成功', '在于'] }
];

const hsk6Sentences = [
  { korean: '인공지능 기술의 비약적인 발전은 인류 사회에 혁명적인 변화를 가져왔다.', chinese: '人工智能技术的飞跃发展给人类社会带来了革命性的变化。', words: ['人工智能', '技术', '的', '飞跃', '发展', '给', '人类社会', '带来', '了', '革命性', '的', '变化'], traps: ['机器', '飞翔'] },
  { korean: '지구 온난화를 억제하기 위해서는 전 지구적인 탄소 배출 감축 노력이 시급하다.', chinese: '为了遏制全球变暖，全球范围内的减排努力迫在眉睫。', words: ['为了', '遏制', '全球', '变暖，', '全球', '范围内', '的', '减排', '努力', '迫在眉睫'], traps: ['阻止', '迫不及待'] },
  { korean: '그는 역경 속에서도 불굴의 의지로 자신의 신념을 끝까지 관철했다.', chinese: '在逆境中，他以不屈不挠的意志贯彻了自己的信念。', words: ['在', '逆境', '中，', '他', '以', '不屈不挠', '的', '意志', '贯彻', '了', '自己', '的', '信念'], traps: ['顺境', '坚定'] },
  { korean: '현대 자본주의 사회에서 부의 양극화 현상은 날로 심화되고 있다.', chinese: '在现代资本主义社会中，财富两极分化现象日益加剧。', words: ['在', '现代', '资本主义', '社会', '中，', '财富', '两极分化', '现象', '日益', '加剧'], traps: ['金钱', '增加'] },
  { korean: '문화의 다양성을 존중하는 것은 글로벌 시대의 필수적인 미덕이다.', chinese: '尊重文化多样性是全球化时代必不可少的美德。', words: ['尊重', '文化', '多样性', '是', '全球化', '时代', '必不可少', '的', '美德'], traps: ['重视', '道德'] },
  { korean: '저명한 학자들의 학술적 논쟁은 학문 발전에 새로운 영감을 부여했다.', chinese: '著名学者的学术争论为学术发展赋予了新的灵感。', words: ['著名', '学者', '的', '学术', '争论', '为', '学术', '发展', '赋予', '了', '新', '的', '灵感'], traps: ['有名', '给予'] },
  { korean: '정부는 저출산 고령화 문제에 대응하기 위한 근본적인 대책을 마련해야 한다.', chinese: '政府必须制定根本性对策以应对少子老龄化问题。', words: ['政府', '必须', '制定', '根本性', '对策', '以', '应对', '少子', '老龄化', '问题'], traps: ['应付', '规定'] },
  { korean: '예술 작품의 가치는 시대적 맥락과 감상자의 주관적 해석에 따라 달라진다.', chinese: '艺术作品的价值因时代脉络和欣赏者的主观诠释而异。', words: ['艺术作品', '的', '价值', '因', '时代', '脉络', '和', '欣赏者', '的', '主观', '诠释', '而异'], traps: ['解释', '客观'] },
  { korean: '기업의 사회적 책임은 단순한 이윤 창출을 넘어 지속 가능한 경영을 추구하는 것이다.', chinese: '企业的社会责任超越了单纯的创造利润，在于追求可持续经营。', words: ['企业', '的', '社会责任', '超越', '了', '单纯', '的', '创造', '利润，', '在于', '追求', '可持续', '经营'], traps: ['利益', '维持'] },
  { korean: '우주 탐사는 인류의 지적 호기심을 충족시키고 미래 생존 가능성을 넓힌다.', chinese: '太空探索满足了人类的智力好奇心，并拓宽了未来生存的可能性。', words: ['太空探索', '满足', '了', '人类', '的', '智力', '好奇心，', '并', '拓宽', '了', '未来', '生存', '的', '可能性'], traps: ['宇宙', '扩大'] }
];

const sentencesByLevel = {
  1: hsk1Sentences,
  2: hsk2Sentences,
  3: hsk3Sentences,
  4: hsk4Sentences,
  5: hsk5Sentences,
  6: hsk6Sentences
};

// ========================================
// Game State
// ========================================
let currentMode = 'word'; // 'word' 또는 'sentence'
let isReviewQuiz = false; // 오답 노트 복습 중인지 여부
let currentPlanDay = null; // 학습 플랜 퀴즈 중이면 일차 번호, 아니면 null
let isPlanRetryRound = false; // 학습 플랜에서 틀린 문제만 다시 푸는 중인지 여부
let currentLevel = 1;
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;
let shuffledQuiz = [];
let quizCount = 10;

// Sentence Game State
let sentenceQuestions = [];
let currentSentenceCorrectWords = [];
let selectedWords = [];

// ========================================
// DOM Elements
// ========================================
const loginScreen = document.getElementById('login-screen');
const btnLoginGuest = document.getElementById('btn-login-guest');
const welcomeMessage = document.getElementById('welcome-message');
const btnLogout = document.getElementById('btn-logout');

const startScreen = document.getElementById('start-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const countScreen = document.getElementById('count-screen');
const planScreen = document.getElementById('plan-screen');
const quizScreen = document.getElementById('quiz-screen');
const sentenceScreen = document.getElementById('sentence-screen'); // New
const btnModeWord = document.getElementById('btn-mode-word'); // New
const btnModeSentence = document.getElementById('btn-mode-sentence'); // New
const btnBackToStart = document.getElementById('btn-back-to-start');
const btnBackToDifficulty = document.getElementById('btn-back-to-difficulty');
const btnStartQuiz = document.getElementById('btn-start-quiz');
const countSlider = document.getElementById('count-slider');
const countNumber = document.getElementById('count-number');
const levelSubtitle = document.getElementById('level-subtitle');

// Sentence Game DOM Elements
const sentenceLevelSubtitle = document.getElementById('sentence-level-subtitle');
const sentenceProgressCurrent = document.getElementById('sentence-progress-current');
const sentenceProgressTotal = document.getElementById('sentence-progress-total');
const sentenceProgressFill = document.getElementById('sentence-progress-fill');
const sentenceScoreCorrect = document.getElementById('sentence-score-correct');
const sentenceScoreWrong = document.getElementById('sentence-score-wrong');
const koreanPrompt = document.getElementById('korean-prompt');
const answerArea = document.getElementById('answer-area');
const wordBank = document.getElementById('word-bank');
const btnHint = document.getElementById('btn-hint');
const btnSkip = document.getElementById('btn-skip');
const btnSentenceNext = document.getElementById('btn-sentence-next');
const sentenceFeedbackArea = document.getElementById('sentence-feedback-area');
const sentenceCard = document.getElementById('sentence-card');

// In-Game Home Buttons
const btnQuizHome = document.getElementById('btn-quiz-home');
const btnSentenceHome = document.getElementById('btn-sentence-home');

const hanziChar = document.getElementById('hanzi-char');
const hanziPinyin = document.getElementById('hanzi-pinyin');
const btnSpeak = document.getElementById('btn-speak');
const choicesContainer = document.getElementById('choices');
const feedbackArea = document.getElementById('feedback-area');
const btnNext = document.getElementById('btn-next');
const progressCurrent = document.getElementById('progress-current');
const progressTotal = document.getElementById('progress-total');
const progressFill = document.getElementById('progress-fill');
const scoreCorrect = document.getElementById('score-correct');
const scoreWrong = document.getElementById('score-wrong');
const quizCard = document.getElementById('quiz-card');
const resultScreen = document.getElementById('result-screen');
const progressWrapper = document.getElementById('progress-wrapper');
const finalCorrect = document.getElementById('final-correct');
const finalWrong = document.getElementById('final-wrong');
const finalPercent = document.getElementById('final-percent');
const btnRestart = document.getElementById('btn-restart');
const btnHome = document.getElementById('btn-home');
const btnLike = document.getElementById('btn-like');
const btnDislike = document.getElementById('btn-dislike');
const feedbackInput = document.getElementById('feedback-input');
const btnSend = document.getElementById('btn-send');
const feedbackToast = document.getElementById('feedback-toast');
const feedbackSection = document.getElementById('feedback-section');

// ========================================
// Screen Navigation
// ========================================
function showScreen(screenName) {
  loginScreen.style.display = 'none';
  startScreen.style.display = 'none';
  difficultyScreen.style.display = 'none';
  countScreen.style.display = 'none';
  planScreen.style.display = 'none';
  quizScreen.style.display = 'none';
  sentenceScreen.style.display = 'none';
  resultScreen.style.display = 'none';

  if (screenName === 'login') {
    loginScreen.style.display = '';
    feedbackSection.style.display = 'none';
  } else if (screenName === 'start') {
    startScreen.style.display = '';
    feedbackSection.style.display = '';
    renderRecordSummary();
  } else if (screenName === 'difficulty') {
    difficultyScreen.style.display = '';
    renderLevelProgress();
    feedbackSection.style.display = '';
  } else if (screenName === 'count') {
    countScreen.style.display = '';
    feedbackSection.style.display = '';
  } else if (screenName === 'plan') {
    planScreen.style.display = '';
    feedbackSection.style.display = '';
  } else if (screenName === 'quiz') {
    quizScreen.style.display = '';
    feedbackSection.style.display = '';
  } else if (screenName === 'sentence') {
    sentenceScreen.style.display = '';
    feedbackSection.style.display = '';
  }
}

// ========================================
// Utility: shuffle array (Fisher-Yates)
// ========================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ========================================
// Utility: Find Pinyin for Sentence Word
// ========================================
function getPinyinForWord(wordText) {
  const cleanWord = wordText.replace(/[，。？！、]/g, '');
  
  for (let l = 1; l <= 6; l++) {
    if (!wordsByLevel[l]) continue;
    const found = wordsByLevel[l].find(w => w.hanzi === cleanWord);
    if (found) return found.pinyin;
  }
  
  const common = {
    // 기본 허사/조사
    '的': 'de', '了': 'le', '是': 'shì', '我': 'wǒ', '你': 'nǐ', '他': 'tā', '她': 'tā',
    '在': 'zài', '有': 'yǒu', '和': 'hé', '就': 'jiù', '不': 'bù', '人': 'rén', '都': 'dōu',
    '一': 'yī', '一个': 'yí ge', '很': 'hěn', '之': 'zhī', '也': 'yě', '还': 'hái', '没': 'méi',
    '要': 'yào', '对': 'duì', '这': 'zhè', '那': 'nà', '去': 'qù', '来': 'lái', '给': 'gěi',
    '为': 'wèi', '以': 'yǐ', '更': 'gèng', '最': 'zuì', '太': 'tài', '多': 'duō', '好': 'hǎo',
    '会': 'huì', '能': 'néng', '说': 'shuō', '看': 'kàn', '吃': 'chī', '笑': 'xiào',
    // HSK1 문장 단어
    '明天': 'míng tiān', '北京': 'Běi jīng', '朋友': 'péng you', '谁': 'shéi', '书': 'shū',
    '汉语': 'hàn yǔ', '现在': 'xiàn zài', '几点': 'jǐ diǎn', '高兴': 'gāo xìng',
    '认识': 'rèn shi', '爸爸': 'bà ba', '医生': 'yī shēng', '昨天': 'zuó tiān',
    '下雨': 'xià yǔ', '喜欢': 'xǐ huan', '苹果': 'píng guǒ', '图书馆': 'tú shū guǎn',
    // HSK2 문장 단어
    '妹妹': 'mèi mei', '唱歌': 'chàng gē', '每天': 'měi tiān', '早上': 'zǎo shang',
    '起床': 'qǐ chuáng', '件': 'jiàn', '衣服': 'yī fu', '便宜': 'pián yi',
    '已经': 'yǐ jīng', '吃完': 'chī wán', '饭': 'fàn', '门': 'mén', '外': 'wài',
    '站着': 'zhàn zhe', '为什么': 'wèi shén me', '房间': 'fáng jiān', '里': 'lǐ',
    '黑': 'hēi', '非常': 'fēi cháng', '感谢': 'gǎn xiè', '帮助': 'bāng zhù',
    '我们': 'wǒ men', '一起': 'yì qǐ', '打篮球': 'dǎ lán qiú', '考试': 'kǎo shì',
    '考得': 'kǎo de',
    // HSK3 문장 단어
    '会议': 'huì yì', '刚才': 'gāng cái', '结束': 'jié shù', '这个': 'zhè ge',
    '问题': 'wèn tí', '解决': 'jiě jué', '起来': 'qǐ lái', '比较': 'bǐ jiào',
    '简单': 'jiǎn dān', '必须': 'bì xū', '上海': 'Shàng hǎi', '出差': 'chū chāi',
    '保持': 'bǎo chí', '家里': 'jiā lǐ', '环境': 'huán jìng', '干净': 'gān jìng',
    '觉得': 'jué de', '双': 'shuāng', '鞋': 'xié', '合适': 'hé shì',
    '感冒': 'gǎn mào', '了，': 'le,', '所以': 'suǒ yǐ', '医院': 'yī yuàn',
    '春天': 'chūn tiān', '天气': 'tiān qì', '变': 'biàn', '暖和': 'nuǎn huo',
    '他们': 'tā men', '说着': 'shuō zhe', '坐地铁': 'zuò dì tiě', '下班': 'xià bān',
    '愿意': 'yuàn yì', '突然': 'tū rán', '下起': 'xià qǐ', '雨': 'yǔ',
    // HSK4 문장 단어
    '失败': 'shī bài', '成功': 'chéng gōng', '母': 'mǔ', '大家': 'dà jiā',
    '积极': 'jī jí', '参加': 'cān jiā', '这次': 'zhè cì', '活动': 'huó dòng',
    '出色': 'chū sè', '钢琴': 'gāng qín', '弹奏': 'tán zòu', '水平': 'shuǐ píng',
    '保护': 'bǎo hù', '自然': 'zì rán', '共同': 'gòng tóng', '责任': 'zé rèn',
    '认为': 'rèn wéi', '部': 'bù', '电影': 'diàn yǐng', '挺': 'tǐng', '感人': 'gǎn rén',
    '按': 'àn', '计划': 'jì huà', '进行': 'jìn xíng', '不会': 'bú huì',
    '一位': 'yí wèi', '经验': 'jīng yàn', '丰富': 'fēng fù', '律师': 'lǜ shī',
    '现代': 'xiàn dài', '社会，': 'shè huì,', '网络': 'wǎng luò', '必不可少': 'bì bù kě shǎo',
    '为了': 'wèi le', '解除': 'jiě chú', '误会，': 'wù huì,', '沟通': 'gōu tōng',
    '重要': 'zhòng yào', '幽默': 'yōu mò', '性格': 'xìng gé', '活跃': 'huó yuè',
    '气氛': 'qì fēn',
    // HSK5 문장 단어
    '人生': 'rén shēng', '无数次': 'wú shù cì', '选择': 'xuǎn zé', '延续': 'yán xù',
    '环境污染': 'huán jìng wū rǎn', '日益': 'rì yì', '严重': 'yán zhòng',
    '企业': 'qǐ yè', '需要': 'xū yào', '通过': 'tōng guò', '创新': 'chuàng xīn',
    '增强': 'zēng qiáng', '竞争力': 'jìng zhēng lì', '凭借': 'píng jiè',
    '领导力': 'lǐng dǎo lì', '带领': 'dài lǐng', '团队': 'tuán duì',
    '走向': 'zǒu xiàng', '胜利': 'shèng lì', '保存': 'bǎo cún',
    '传统文化': 'chuán tǒng wén huà', '一件': 'yí jiàn', '有价值': 'yǒu jià zhí',
    '事情': 'shì qing', '健康': 'jiàn kāng', '饮食': 'yǐn shí', '习惯': 'xí guàn',
    '长寿': 'cháng shòu', '秘诀': 'mì jué', '过度': 'guò dù', '压力': 'yā lì',
    '心理健康': 'xīn lǐ jiàn kāng', '有害': 'yǒu hài', '无论': 'wú lùn',
    '遇到': 'yù dào', '什么': 'shén me', '困难，': 'kùn nan,', '决不': 'jué bù',
    '放弃': 'fàng qì', '经济': 'jīng jì', '发展': 'fā zhǎn', '环境保护': 'huán jìng bǎo hù',
    '取得': 'qǔ dé', '平衡': 'píng héng', '项目': 'xiàng mù', '成败': 'chéng bài',
    '取决于': 'qǔ jué yú', '合作': 'hé zuò',
    // HSK6 문장 단어
    '人工智能': 'rén gōng zhì néng', '技术': 'jì shù', '飞跃': 'fēi yuè',
    '人类社会': 'rén lèi shè huì', '带来': 'dài lái', '革命性': 'gé mìng xìng',
    '变化': 'biàn huà', '遏制': 'è zhì', '全球': 'quán qiú', '变暖，': 'biàn nuǎn,',
    '范围内': 'fàn wéi nèi', '减排': 'jiǎn pái', '努力': 'nǔ lì',
    '迫在眉睫': 'pò zài méi jié', '逆境': 'nì jìng', '中，': 'zhōng,',
    '不屈不挠': 'bù qū bù náo', '意志': 'yì zhì', '贯彻': 'guàn chè',
    '自己': 'zì jǐ', '信念': 'xìn niàn', '资本主义': 'zī běn zhǔ yì',
    '社会': 'shè huì', '财富': 'cái fù', '两极分化': 'liǎng jí fēn huà',
    '现象': 'xiàn xiàng', '加剧': 'jiā jù', '尊重': 'zūn zhòng',
    '文化': 'wén huà', '多样性': 'duō yàng xìng', '全球化': 'quán qiú huà',
    '时代': 'shí dài', '美德': 'měi dé', '著名': 'zhù míng', '学者': 'xué zhě',
    '学术': 'xué shù', '争论': 'zhēng lùn', '赋予': 'fù yǔ', '新': 'xīn',
    '灵感': 'líng gǎn', '政府': 'zhèng fǔ', '制定': 'zhì dìng',
    '根本性': 'gēn běn xìng', '对策': 'duì cè', '应对': 'yìng duì',
    '少子': 'shǎo zǐ', '老龄化': 'lǎo líng huà', '艺术作品': 'yì shù zuò pǐn',
    '价值': 'jià zhí', '因': 'yīn', '脉络': 'mài luò', '欣赏者': 'xīn shǎng zhě',
    '主观': 'zhǔ guān', '诠释': 'quán shì', '而异': 'ér yì',
    '社会责任': 'shè huì zé rèn', '超越': 'chāo yuè', '单纯': 'dān chún',
    '创造': 'chuàng zào', '利润，': 'lì rùn,', '在于': 'zài yú',
    '追求': 'zhuī qiú', '可持续': 'kě chí xù', '经营': 'jīng yíng',
    '太空探索': 'tài kōng tàn suǒ', '满足': 'mǎn zú', '人类': 'rén lèi',
    '智力': 'zhì lì', '好奇心，': 'hào qí xīn,', '并': 'bìng',
    '拓宽': 'tuò kuān', '未来': 'wèi lái', '生存': 'shēng cún',
    '可能性': 'kě néng xìng'
  };
  return common[wordText] || common[cleanWord] || '';
}

function createSentenceWordSpan(wordText) {
  const span = document.createElement('span');
  span.className = 'word-piece';
  span.dataset.word = wordText;
  
  const charDiv = document.createElement('div');
  charDiv.className = 'word-char';
  charDiv.textContent = wordText;
  span.appendChild(charDiv);
  
  const pinyin = getPinyinForWord(wordText);
  if (pinyin) {
    const pinyinDiv = document.createElement('div');
    pinyinDiv.className = 'word-pinyin';
    pinyinDiv.textContent = pinyin;
    span.appendChild(pinyinDiv);
  }
  return span;
}

// ========================================
// Text-to-Speech (TTS) Logic
// ========================================
function speakHanzi(text) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN'; // Chinese (Simplified)
  
  // 글자 수에 따라 발음 속도를 동적으로 조절
  if (text.length === 1) {
    utterance.rate = 0.75; // 1글자는 덜 늘어지도록 조금 빠르게
  } else if (text.length === 2) {
    utterance.rate = 0.65; // 2글자는 중간 속도
  } else {
    utterance.rate = 0.6; // 3글자 이상은 천천히 또렷하게
  }
  
  utterance.pitch = 0.95; // 톤을 살짝 낮춰서 좀 더 자연스럽게 
  
  // Try to find a high-quality Chinese voice
  const voices = window.speechSynthesis.getVoices();
  
  // 구글 네트워크 음성이나 애플 프리미엄 음성을 우선적으로 찾습니다.
  const premiumKeywords = ['Google', 'Tingting', 'Lili', 'Yaqi', 'Meijia'];
  let selectedVoice = null;
  
  for (const keyword of premiumKeywords) {
    selectedVoice = voices.find(v => (v.lang.includes('zh') || v.lang.includes('zh-CN')) && v.name.includes(keyword));
    if (selectedVoice) break;
  }
  
  // 프리미엄 음성이 없으면 일반 중국어 음성 선택
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.includes('zh-CN') || v.lang.includes('zh_CN') || v.lang.includes('zh'));
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

// Ensure voices are loaded (some browsers load them asynchronously)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

if (btnSpeak) {
  btnSpeak.addEventListener('click', () => {
    if (hanziChar.textContent) {
      speakHanzi(hanziChar.textContent);
    }
  });
}


// ========================================
// Generate quiz data with choices
// ========================================
function generateQuiz(level, count) {
  const words = wordsByLevel[level];
  const selected = shuffle(words).slice(0, count);

  return selected.map((word) => generateQuestion(word, level));
}

function generateQuestion(word, level) {
  // Get 3 wrong answers from the same level, different from the correct one
  const otherMeanings = wordsByLevel[level]
    .filter((w) => w.meaning !== word.meaning)
    .map((w) => w.meaning);
  const wrongChoices = shuffle(otherMeanings).slice(0, 3);
  const choices = shuffle([word.meaning, ...wrongChoices]);

  return {
    level: level,
    hanzi: word.hanzi,
    pinyin: word.pinyin,
    answer: word.meaning,
    choices: choices,
  };
}

// ========================================
// Start Screen → Difficulty Screen
// ========================================
btnModeWord.addEventListener('click', () => {
  currentMode = 'word';
  isReviewQuiz = false;
  currentPlanDay = null;
  showScreen('difficulty');
});

btnModeSentence.addEventListener('click', () => {
  currentMode = 'sentence';
  isReviewQuiz = false;
  currentPlanDay = null;
  showScreen('difficulty');
});

// ========================================
// Back to Start
// ========================================
btnBackToStart.addEventListener('click', () => {
  showScreen('start');
});

if (btnQuizHome) {
  btnQuizHome.addEventListener('click', () => {
    showScreen('start');
  });
}

if (btnSentenceHome) {
  btnSentenceHome.addEventListener('click', () => {
    showScreen('start');
  });
}

// ========================================
// Difficulty Selection → Count Screen
// ========================================
document.querySelectorAll('.difficulty-card').forEach((card) => {
  card.addEventListener('click', () => {
    currentLevel = parseInt(card.dataset.level);
    // HSK 1~4급 단어 학습은 일차별 학습 플랜으로 진행
    if (currentMode === 'word' && PLAN_DAYS[currentLevel]) {
      openPlan(currentLevel);
      return;
    }
    // Reset slider to 10
    countSlider.value = 10;
    countNumber.textContent = 10;
    quizCount = 10;
    updatePresetButtons(10);
    showScreen('count');
  });
});

// ========================================
// Count Screen: Slider
// ========================================
countSlider.addEventListener('input', () => {
  const val = parseInt(countSlider.value);
  countNumber.textContent = val;
  quizCount = val;
  updatePresetButtons(val);
});

// ========================================
// Count Screen: Preset Buttons
// ========================================
function updatePresetButtons(activeCount) {
  document.querySelectorAll('.count-preset-btn').forEach((btn) => {
    if (parseInt(btn.dataset.count) === activeCount) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

document.querySelectorAll('.count-preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const val = parseInt(btn.dataset.count);
    countSlider.value = val;
    countNumber.textContent = val;
    quizCount = val;
    updatePresetButtons(val);
  });
});

// ========================================
// Back to Difficulty
// ========================================
btnBackToDifficulty.addEventListener('click', () => {
  showScreen('difficulty');
});

// ========================================
// Start Quiz Button (from count screen)
// ========================================
btnStartQuiz.addEventListener('click', () => {
  currentPlanDay = null;
  startQuiz(currentLevel);
});

// ========================================
// Start Quiz
// ========================================
function startQuiz(level) {
  if (currentMode === 'word') {
    startWordQuiz(level);
  } else {
    startSentenceQuiz(level);
  }
}

let wrongQuestions = [];
let wrongSentenceQuestions = [];

function startWordQuiz(level, retryQuestions) {
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  answered = false;
  wrongQuestions = [];

  // Update subtitle
  if (isReviewQuiz) {
    levelSubtitle.textContent = '오답 노트 복습';
  } else if (currentPlanDay !== null) {
    levelSubtitle.textContent = `HSK ${level}급 · ${currentPlanDay}일차`;
  } else {
    levelSubtitle.textContent = `HSK ${level}급 한자 퀴즈`;
  }

  // Generate quiz or use retry questions
  if (retryQuestions && retryQuestions.length > 0) {
    shuffledQuiz = retryQuestions;
  } else {
    shuffledQuiz = generateQuiz(level, quizCount);
  }
  progressTotal.textContent = shuffledQuiz.length;

  // Show quiz screen
  showScreen('quiz');
  quizCard.style.display = '';
  progressWrapper.style.display = '';
  resultScreen.style.display = 'none';

  updateScore();
  showQuestion();
}

// ========================================
// Show current question
// ========================================
function showQuestion() {
  answered = false;
  const q = shuffledQuiz[currentIndex];

  // Update progress
  progressCurrent.textContent = currentIndex + 1;
  const pct = (currentIndex / shuffledQuiz.length) * 100;
  progressFill.style.width = pct + '%';

  // Display hanzi
  hanziChar.textContent = q.hanzi;
  hanziPinyin.textContent = q.pinyin;

  // Shuffle choices for this question
  const shuffledChoices = shuffle(q.choices);

  // Create choice buttons
  choicesContainer.innerHTML = '';
  shuffledChoices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice;
    btn.addEventListener('click', () => handleAnswer(btn, choice, q.answer));
    choicesContainer.appendChild(btn);
  });

  // Clear feedback & hide next button
  feedbackArea.innerHTML = '';
  btnNext.style.display = 'none';

  // Animate card in
  quizCard.classList.remove('slide-out');
  quizCard.classList.add('slide-in');
  setTimeout(() => quizCard.classList.remove('slide-in'), 400);
}

// ========================================
// Handle answer selection
// ========================================
function handleAnswer(selectedBtn, selected, answer) {
  if (answered) return;
  answered = true;

  const isCorrect = selected === answer;
  const q = shuffledQuiz[currentIndex];
  recordAnswer('words', q.level, q.hanzi, isCorrect);

  // Update score
  if (isCorrect) {
    correctCount++;
  } else {
    wrongCount++;
    wrongQuestions.push(shuffledQuiz[currentIndex]);
  }
  updateScore();

  // Highlight buttons
  const allBtns = choicesContainer.querySelectorAll('.choice-btn');
  allBtns.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === answer) {
      btn.classList.add('correct');
    } else if (btn === selectedBtn && !isCorrect) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('dimmed');
    }
  });

  // Show feedback message
  const msg = document.createElement('span');
  msg.className = `feedback-msg ${isCorrect ? 'correct' : 'wrong'}`;
  msg.textContent = isCorrect ? '정답이에요! 🎉' : `아쉬워요! 정답: ${answer}`;
  feedbackArea.innerHTML = '';
  feedbackArea.appendChild(msg);

  // Show next button (or finish)
  btnNext.style.display = 'inline-block';
  if (currentIndex === shuffledQuiz.length - 1) {
    btnNext.textContent = '결과 보기 🏆';
  } else {
    btnNext.textContent = '다음 문제 →';
  }
}

// ========================================
// Update displayed score
// ========================================
function updateScore() {
  scoreCorrect.textContent = `✓ ${correctCount}`;
  scoreWrong.textContent = `✗ ${wrongCount}`;
}

// ========================================
// Next button handler (Word Quiz)
// ========================================
btnNext.addEventListener('click', () => {
  if (currentIndex < shuffledQuiz.length - 1) {
    // Slide out current card
    quizCard.classList.add('slide-out');
    setTimeout(() => {
      currentIndex++;
      showQuestion();
    }, 250);
  } else {
    showResult();
  }
});

// ========================================
// Sentence Game Logic
// ========================================
function startSentenceQuiz(level, retryQuestions) {
  currentSentenceIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  answered = false;
  wrongSentenceQuestions = [];

  sentenceLevelSubtitle.textContent = `HSK ${level}급 작문`;

  // Get sentences for this level or use retry questions
  if (retryQuestions && retryQuestions.length > 0) {
    sentenceQuestions = retryQuestions;
  } else {
    const sentences = sentencesByLevel[level] || [];
    sentenceQuestions = shuffle(sentences).slice(0, quizCount);
  }
  sentenceProgressTotal.textContent = sentenceQuestions.length;

  showScreen('sentence');
  sentenceCard.style.display = '';
  document.getElementById('sentence-progress-wrapper').style.display = '';
  resultScreen.style.display = 'none';

  updateSentenceScore();
  showSentenceQuestion();
}

function updateSentenceScore() {
  sentenceScoreCorrect.textContent = `✓ ${correctCount}`;
  sentenceScoreWrong.textContent = `✗ ${wrongCount}`;
}

function showSentenceQuestion() {
  answered = false;
  selectedWords = [];
  
  const q = sentenceQuestions[currentSentenceIndex];
  sentenceProgressCurrent.textContent = currentSentenceIndex + 1;
  
  const pct = (currentSentenceIndex / sentenceQuestions.length) * 100;
  sentenceProgressFill.style.width = pct + '%';

  koreanPrompt.textContent = q.korean;
  currentSentenceCorrectWords = q.words;

  // Render drop zone (empty initially)
  answerArea.innerHTML = '';
  answerArea.className = 'answer-area'; // reset animations

  // Render word bank (정답 단어만, 함정 단어 제외)
  wordBank.innerHTML = '';
  const allCards = shuffle([...q.words]);
  
  allCards.forEach((word) => {
    const span = createSentenceWordSpan(word);
    
    span.addEventListener('click', () => handleWordBankClick(span));
    wordBank.appendChild(span);
  });

  sentenceFeedbackArea.innerHTML = '';
  btnSentenceNext.style.display = 'none';
  btnHint.disabled = false;
  btnSkip.disabled = false;
}

function handleWordBankClick(span) {
  if (answered || span.classList.contains('used')) return;
  
  // Mark as used in word bank
  span.classList.add('used');

  // Add to answer area
  const answerSpan = createSentenceWordSpan(span.dataset.word);
  answerSpan.className = 'word-piece in-answer';
  answerSpan.dataset.originalId = Array.from(wordBank.children).indexOf(span);
  
  // Drag-and-drop support
  answerSpan.draggable = true;
  answerSpan.addEventListener('dragstart', handleDragStart);
  answerSpan.addEventListener('dragover', handleDragOver);
  answerSpan.addEventListener('drop', handleDrop);
  answerSpan.addEventListener('dragend', handleDragEnd);
  
  // Touch drag support
  answerSpan.addEventListener('touchstart', handleTouchStart, { passive: false });
  answerSpan.addEventListener('touchmove', handleTouchMove, { passive: false });
  answerSpan.addEventListener('touchend', handleTouchEnd);
  
  // Click in answer area to return it to word bank
  answerSpan.addEventListener('click', (e) => {
    if (answered || answerSpan._dragged) return;
    answerArea.removeChild(answerSpan);
    span.classList.remove('used');
    selectedWords = Array.from(answerArea.children).map(child => child.dataset.word);
  });

  answerArea.appendChild(answerSpan);
  selectedWords = Array.from(answerArea.children).map(child => child.dataset.word);

  checkSentenceAnswer();
}

// ========================================
// Drag & Drop for Answer Area
// ========================================
let draggedEl = null;

function handleDragStart(e) {
  if (answered) return;
  draggedEl = this;
  this.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.style.borderColor = 'var(--accent)';
}

function handleDrop(e) {
  e.preventDefault();
  this.style.borderColor = '';
  if (draggedEl === this || answered) return;
  
  const allItems = Array.from(answerArea.children);
  const fromIdx = allItems.indexOf(draggedEl);
  const toIdx = allItems.indexOf(this);
  
  if (fromIdx < toIdx) {
    answerArea.insertBefore(draggedEl, this.nextSibling);
  } else {
    answerArea.insertBefore(draggedEl, this);
  }
  
  selectedWords = Array.from(answerArea.children).map(child => child.dataset.word);
  checkSentenceAnswer();
}

function handleDragEnd() {
  this.style.opacity = '1';
  Array.from(answerArea.children).forEach(el => el.style.borderColor = '');
  draggedEl = null;
}

// ========================================
// Touch Drag for Mobile
// ========================================
let touchDragEl = null;
let touchClone = null;
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  if (answered) return;
  this._dragged = false;
  touchDragEl = this;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  if (!touchDragEl || answered) return;
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (dx > 5 || dy > 5) {
    e.preventDefault();
    touchDragEl._dragged = true;
    
    if (!touchClone) {
      touchClone = touchDragEl.cloneNode(true);
      touchClone.style.position = 'fixed';
      touchClone.style.pointerEvents = 'none';
      touchClone.style.opacity = '0.7';
      touchClone.style.zIndex = '1000';
      touchClone.style.transform = 'scale(1.1)';
      document.body.appendChild(touchClone);
      touchDragEl.style.opacity = '0.3';
    }
    touchClone.style.left = (e.touches[0].clientX - touchClone.offsetWidth / 2) + 'px';
    touchClone.style.top = (e.touches[0].clientY - touchClone.offsetHeight / 2) + 'px';
  }
}

function handleTouchEnd(e) {
  if (!touchDragEl) return;
  
  if (touchClone) {
    document.body.removeChild(touchClone);
    touchClone = null;
    touchDragEl.style.opacity = '1';
    
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetPiece = dropTarget?.closest('.in-answer');
    
    if (targetPiece && targetPiece !== touchDragEl && answerArea.contains(targetPiece)) {
      const allItems = Array.from(answerArea.children);
      const fromIdx = allItems.indexOf(touchDragEl);
      const toIdx = allItems.indexOf(targetPiece);
      if (fromIdx < toIdx) {
        answerArea.insertBefore(touchDragEl, targetPiece.nextSibling);
      } else {
        answerArea.insertBefore(touchDragEl, targetPiece);
      }
      selectedWords = Array.from(answerArea.children).map(child => child.dataset.word);
      checkSentenceAnswer();
    }
  }
  touchDragEl = null;
}

function checkSentenceAnswer() {
  if (selectedWords.length === currentSentenceCorrectWords.length) {
    const isCorrect = selectedWords.join('') === currentSentenceCorrectWords.join('');
    
    if (isCorrect) {
      answered = true;
      correctCount++;
      recordAnswer('sentences', currentLevel, sentenceQuestions[currentSentenceIndex].chinese, true);
      updateSentenceScore();
      
      answerArea.classList.add('correct-anim');
      showSentenceFeedback('정답입니다! 완벽해요 🎉', 'correct');
      btnHint.disabled = true;
      btnSkip.disabled = true;
      
      // Show next button for manual advance
      btnSentenceNext.style.display = 'inline-block';
      if (currentSentenceIndex === sentenceQuestions.length - 1) {
        btnSentenceNext.textContent = '결과 보기 🏆';
      } else {
        btnSentenceNext.textContent = '다음 문제 →';
      }
    } else {
      // Wrong sequence
      answerArea.classList.remove('wrong-anim');
      void answerArea.offsetWidth; // trigger reflow
      answerArea.classList.add('wrong-anim');
      showSentenceFeedback('순서가 맞지 않거나 잘못된 단어가 있습니다.', 'wrong');
    }
  } else {
    // Hide feedback if they are still building
    sentenceFeedbackArea.innerHTML = '';
  }
}

function showSentenceFeedback(message, type) {
  const msg = document.createElement('span');
  msg.className = `feedback-msg ${type}`;
  msg.textContent = message;
  sentenceFeedbackArea.innerHTML = '';
  sentenceFeedbackArea.appendChild(msg);
}

function nextSentenceQuestion() {
  currentSentenceIndex++;
  if (currentSentenceIndex < sentenceQuestions.length) {
    showSentenceQuestion();
  } else {
    showSentenceResult();
  }
}

btnSentenceNext.addEventListener('click', nextSentenceQuestion);

// Hint logic
btnHint.addEventListener('click', () => {
  if (answered) return;
  
  // 1. Find the first incorrect or missing word index
  let firstWrongIdx = -1;
  for (let i = 0; i < currentSentenceCorrectWords.length; i++) {
    if (i >= selectedWords.length || selectedWords[i] !== currentSentenceCorrectWords[i]) {
      firstWrongIdx = i;
      break;
    }
  }

  if (firstWrongIdx === -1) return; // already correct but maybe extra words

  // 2. Remove all words in the answer area from firstWrongIdx onwards
  const answerChildren = Array.from(answerArea.children);
  for (let i = firstWrongIdx; i < answerChildren.length; i++) {
    const child = answerChildren[i];
    // Return to bank
    const origIdx = child.dataset.originalId;
    if (origIdx !== undefined && wordBank.children[origIdx]) {
      wordBank.children[origIdx].classList.remove('used');
    }
    answerArea.removeChild(child);
  }

  // 3. Find the correct word in the word bank and simulate a click
  const correctWord = currentSentenceCorrectWords[firstWrongIdx];
  const bankChildren = Array.from(wordBank.children);
  const targetSpan = bankChildren.find(span => !span.classList.contains('used') && span.dataset.word === correctWord);
  
  if (targetSpan) {
    targetSpan.click();
    showSentenceFeedback('힌트를 사용했습니다 💡', '');
  }
});

// Skip logic
btnSkip.addEventListener('click', () => {
  if (answered) return;
  answered = true;
  wrongCount++;
  wrongSentenceQuestions.push(sentenceQuestions[currentSentenceIndex]);
  updateSentenceScore();

  const q = sentenceQuestions[currentSentenceIndex];
  recordAnswer('sentences', currentLevel, q.chinese, false);
  
  // Auto-fill correctly
  answerArea.innerHTML = '';
  q.words.forEach(word => {
    const span = createSentenceWordSpan(word);
    span.className = 'word-piece in-answer';
    answerArea.appendChild(span);
  });

  answerArea.classList.add('wrong-anim');
  showSentenceFeedback(`정답은: ${q.chinese}`, 'wrong');
  
  btnHint.disabled = true;
  btnSkip.disabled = true;
  
  // Show next button for manual advance
  btnSentenceNext.style.display = 'inline-block';
  if (currentSentenceIndex === sentenceQuestions.length - 1) {
    btnSentenceNext.textContent = '결과 보기 🏆';
  } else {
    btnSentenceNext.textContent = '다음 문제 →';
  }
});

function showSentenceResult() {
  hidePlanResult();
  flushRecordSave();
  sentenceProgressFill.style.width = '100%';
  sentenceCard.style.display = 'none';
  document.getElementById('sentence-progress-wrapper').style.display = 'none';
  resultScreen.style.display = '';

  const total = sentenceQuestions.length;
  const pct = Math.round((correctCount / total) * 100);

  finalCorrect.textContent = correctCount;
  finalWrong.textContent = wrongCount;
  finalPercent.textContent = pct + '%';

  const icon = resultScreen.querySelector('.result-icon');
  if (pct === 100) icon.textContent = '🏆';
  else if (pct >= 70) icon.textContent = '🎉';
  else if (pct >= 40) icon.textContent = '💪';
  else icon.textContent = '📖';

  // Show/hide retry prompt
  const retryPrompt = document.getElementById('retry-prompt');
  const resultButtonsWrap = document.getElementById('result-buttons-wrap');
  if (wrongSentenceQuestions.length > 0) {
    retryPrompt.style.display = '';
    resultButtonsWrap.style.display = 'none';
  } else {
    retryPrompt.style.display = 'none';
    resultButtonsWrap.style.display = '';
  }
}

// ========================================
// Show result screen
// ========================================
function showResult() {
  const total = shuffledQuiz.length;
  const pct = Math.round((correctCount / total) * 100);
  updatePlanResult(pct);
  flushRecordSave();

  // Fill progress bar to 100%
  progressFill.style.width = '100%';

  quizCard.style.display = 'none';
  progressWrapper.style.display = 'none';
  resultScreen.style.display = '';

  finalCorrect.textContent = correctCount;
  finalWrong.textContent = wrongCount;
  finalPercent.textContent = pct + '%';

  // Update result icon based on score
  const icon = resultScreen.querySelector('.result-icon');
  if (pct === 100) {
    icon.textContent = '🏆';
  } else if (pct >= 70) {
    icon.textContent = '🎉';
  } else if (pct >= 40) {
    icon.textContent = '💪';
  } else {
    icon.textContent = '📖';
  }

  // Show/hide retry prompt
  const retryPrompt = document.getElementById('retry-prompt');
  const resultButtonsWrap = document.getElementById('result-buttons-wrap');
  if (wrongQuestions.length > 0) {
    retryPrompt.style.display = '';
    resultButtonsWrap.style.display = 'none';
  } else {
    retryPrompt.style.display = 'none';
    resultButtonsWrap.style.display = '';
  }
}

// ========================================
// Restart (same level)
// ========================================
btnRestart.addEventListener('click', () => {
  if (currentPlanDay !== null) {
    startPlanQuiz(currentPlanDay);
  } else if (isReviewQuiz) {
    startReviewQuiz();
  } else {
    startQuiz(currentLevel);
  }
});

// ========================================
// Home (back to start)
// ========================================
btnHome.addEventListener('click', () => {
  showScreen('start');
});

// ========================================
// Retry Wrong Questions
// ========================================
document.getElementById('btn-retry-yes').addEventListener('click', () => {
  if (currentMode === 'word') {
    if (currentPlanDay !== null) isPlanRetryRound = true;
    const retryList = [...wrongQuestions];
    startWordQuiz(currentLevel, retryList);
  } else {
    const retryList = [...wrongSentenceQuestions];
    startSentenceQuiz(currentLevel, retryList);
  }
});

document.getElementById('btn-retry-no').addEventListener('click', () => {
  // Hide retry prompt, show normal result buttons
  document.getElementById('retry-prompt').style.display = 'none';
  document.getElementById('result-buttons-wrap').style.display = '';
});

// ========================================
// Feedback Section Logic
// ========================================
let selectedFeedback = null;

btnLike.addEventListener('click', () => {
  selectedFeedback = 'like';
  btnLike.classList.add('selected');
  btnDislike.classList.remove('selected');
  showToast('👍 감사합니다!');
});

btnDislike.addEventListener('click', () => {
  selectedFeedback = 'dislike';
  btnDislike.classList.add('selected');
  btnLike.classList.remove('selected');
  showToast('의견을 반영하겠습니다!');
});

btnSend.addEventListener('click', () => {
  const text = feedbackInput.value.trim();
  if (!text) {
    showToast('의견을 입력해주세요 ✏️');
    feedbackInput.focus();
    return;
  }
  console.log('User feedback:', { rating: selectedFeedback, comment: text });
  feedbackInput.value = '';
  showToast('소중한 의견 감사합니다! 🙏');
});

feedbackInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    btnSend.click();
  }
});

function showToast(message) {
  feedbackToast.textContent = message;
  feedbackToast.classList.add('show');
  setTimeout(() => feedbackToast.classList.remove('show'), 2200);
}

// ========================================
// 학습 기록 (사용자별 저장)
// ========================================
// 기록 구조: { words: { "급수|한자": 항목 }, sentences: { "급수|중국어 문장": 항목 }, updatedAt }
// 항목: { c: 맞힌 횟수, w: 틀린 횟수, s: 연속으로 맞힌 횟수, t: 마지막으로 푼 시각(ms) }
// 구글 로그인 사용자는 Firestore(users/{uid})에, 게스트는 이 브라우저(localStorage)에 저장합니다.
const GUEST_FLAG_KEY = 'hanzi_guest';
const GUEST_RECORD_KEY = 'hanzi_guest_record';
const REVIEW_GRADUATE_STREAK = 2; // 연속으로 이만큼 맞히면 오답 노트에서 빠짐
const REVIEW_MAX_QUESTIONS = 20;
const RECORD_SAVE_DELAY = 2000;

let userRecord = normalizeRecord(null);
let recordOwner = null; // { type: 'guest' } 또는 { type: 'google', uid, name }
let recordSaveBlocked = false; // 저장된 기록을 불러오지 못했을 때 덮어쓰지 않도록 저장을 막음
let recordSaveTimer = null;

const btnReview = document.getElementById('btn-review');
const reviewCount = document.getElementById('review-count');
const recordSummary = document.getElementById('record-summary');

function normalizeRecord(data) {
  return {
    words: (data && data.words) || {},
    sentences: (data && data.sentences) || {},
    plans: (data && data.plans) || {}, // { 급수: { 일차: { score: 최고 정답률, t: 완료 시각 } } }
    updatedAt: (data && data.updatedAt) || 0,
  };
}

function recordAnswer(kind, level, id, isCorrect) {
  if (!recordOwner) return;
  const key = `${level}|${id}`;
  const entry = userRecord[kind][key] || { c: 0, w: 0, s: 0, t: 0 };
  if (isCorrect) {
    entry.c++;
    entry.s++;
  } else {
    entry.w++;
    entry.s = 0;
  }
  entry.t = Date.now();
  userRecord[kind][key] = entry;
  scheduleRecordSave();
}

function scheduleRecordSave() {
  clearTimeout(recordSaveTimer);
  recordSaveTimer = setTimeout(saveRecordNow, RECORD_SAVE_DELAY);
}

// 예약된 저장이 있으면 바로 저장
function flushRecordSave() {
  if (!recordSaveTimer) return Promise.resolve();
  clearTimeout(recordSaveTimer);
  return saveRecordNow();
}

async function saveRecordNow() {
  recordSaveTimer = null;
  if (!recordOwner) return;
  userRecord.updatedAt = Date.now();

  if (recordOwner.type === 'guest') {
    try {
      localStorage.setItem(GUEST_RECORD_KEY, JSON.stringify(userRecord));
    } catch (error) {
      console.error('게스트 기록 저장 실패:', error);
    }
    return;
  }

  if (recordSaveBlocked || !window.hanziFirebase) return;
  try {
    await window.hanziFirebase.saveRecord(recordOwner.uid, { ...userRecord, name: recordOwner.name });
  } catch (error) {
    console.error('학습 기록 저장 실패:', error);
    showToast('학습 기록을 저장하지 못했습니다 😢');
  }
}

// 탭을 닫거나 다른 앱으로 넘어갈 때 저장
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushRecordSave();
});

function readGuestRecord() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_RECORD_KEY));
  } catch (error) {
    return null;
  }
}

function getLevelStats(kind, level) {
  const prefix = `${level}|`;
  let learned = 0;
  let correct = 0;
  let wrong = 0;
  Object.entries(userRecord[kind]).forEach(([key, entry]) => {
    if (!key.startsWith(prefix)) return;
    learned++;
    correct += entry.c;
    wrong += entry.w;
  });
  const source = kind === 'words' ? wordsByLevel : sentencesByLevel;
  return {
    learned: learned,
    total: (source[level] || []).length,
    accuracy: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null,
  };
}

// 오답 노트: 틀린 적이 있고 아직 연속으로 충분히 맞히지 못한 단어
function getReviewItems() {
  return Object.entries(userRecord.words)
    .filter(([, entry]) => entry.w > 0 && entry.s < REVIEW_GRADUATE_STREAK)
    .map(([key, entry]) => {
      const sep = key.indexOf('|');
      const level = Number(key.slice(0, sep));
      const hanzi = key.slice(sep + 1);
      const word = (wordsByLevel[level] || []).find((w) => w.hanzi === hanzi);
      return word ? { level: level, word: word, entry: entry } : null;
    })
    .filter(Boolean);
}

function renderRecordSummary() {
  let correct = 0;
  let wrong = 0;
  [userRecord.words, userRecord.sentences].forEach((group) => {
    Object.values(group).forEach((entry) => {
      correct += entry.c;
      wrong += entry.w;
    });
  });
  const solved = correct + wrong;
  recordSummary.textContent = solved > 0
    ? `지금까지 ${solved}문제를 풀었어요 · 정답률 ${Math.round((correct / solved) * 100)}%`
    : '첫 학습을 시작해 보세요!';

  const reviewTotal = getReviewItems().length;
  reviewCount.textContent = reviewTotal;
  btnReview.disabled = reviewTotal === 0;
  btnReview.title = reviewTotal === 0 ? '틀린 단어가 생기면 여기서 복습할 수 있어요' : '';
}

function renderLevelProgress() {
  const kind = currentMode === 'sentence' ? 'sentences' : 'words';
  document.querySelectorAll('.difficulty-card').forEach((card) => {
    let progress = card.querySelector('.difficulty-progress');
    if (!progress) {
      progress = document.createElement('span');
      progress.className = 'difficulty-progress';
      card.appendChild(progress);
    }
    const level = parseInt(card.dataset.level);
    const stats = getLevelStats(kind, level);
    if (kind === 'words' && PLAN_DAYS[level]) {
      const done = getPlanCompletedCount(level);
      progress.textContent = `📅 ${PLAN_LABELS[level]} 플랜 · ${done}/${PLAN_DAYS[level]}일 완료`;
      progress.classList.toggle('has-record', done > 0);
      return;
    }
    progress.textContent = stats.learned === 0
      ? '아직 학습 기록 없음'
      : `학습 ${Math.min(stats.learned, stats.total)}/${stats.total} · 정답률 ${stats.accuracy}%`;
    progress.classList.toggle('has-record', stats.learned > 0);
  });
}

function startReviewQuiz() {
  // 많이 틀린 단어부터 골라서 섞어 출제
  const items = getReviewItems()
    .sort((a, b) => b.entry.w - a.entry.w || a.entry.t - b.entry.t)
    .slice(0, REVIEW_MAX_QUESTIONS);
  if (items.length === 0) {
    showToast('복습할 단어가 없어요! 🎉');
    showScreen('start');
    return;
  }
  currentMode = 'word';
  isReviewQuiz = true;
  currentPlanDay = null;
  startWordQuiz(items[0].level, shuffle(items).map((item) => generateQuestion(item.word, item.level)));
}

btnReview.addEventListener('click', startReviewQuiz);

// ========================================
// 단어 학습 플랜 (HSK 1~4급)
// ========================================
// 각 급수의 단어를 일차별로 고르게 나눠서 하루씩 학습합니다.
// 그날 퀴즈에서 PLAN_PASS_PERCENT% 이상 맞히면 완료되고, 이전 일차를 완료해야 다음 일차로 넘어갈 수 있습니다.
const PLAN_DAYS = { 1: 14, 2: 14, 3: 30, 4: 60 };
const PLAN_LABELS = { 1: '2주', 2: '2주', 3: '한 달', 4: '두 달' };
const PLAN_PASS_PERCENT = 80;

const planTitle = document.getElementById('plan-title');
const planSubtitle = document.getElementById('plan-subtitle');
const planProgressFill = document.getElementById('plan-progress-fill');
const planDayCard = document.getElementById('plan-day-card');
const planDayTitle = document.getElementById('plan-day-title');
const planDayStatus = document.getElementById('plan-day-status');
const planWordList = document.getElementById('plan-word-list');
const btnPlanPrev = document.getElementById('btn-plan-prev');
const btnPlanNext = document.getElementById('btn-plan-next');
const btnPlanStart = document.getElementById('btn-plan-start');
const btnPlanBack = document.getElementById('btn-plan-back');
const btnToPlan = document.getElementById('btn-to-plan');
const resultPlanMessage = document.getElementById('result-plan-message');

let planViewDay = 1; // 플랜 화면에서 보고 있는 일차

function getPlanDayWords(level, day) {
  const words = wordsByLevel[level];
  const days = PLAN_DAYS[level];
  const start = Math.floor(((day - 1) * words.length) / days);
  const end = Math.floor((day * words.length) / days);
  return words.slice(start, end);
}

function getPlanDayRecord(level, day) {
  const plan = userRecord.plans[level];
  return plan ? plan[day] : undefined;
}

function isPlanDayCompleted(level, day) {
  return Boolean(getPlanDayRecord(level, day));
}

function isPlanDayUnlocked(level, day) {
  return day === 1 || isPlanDayCompleted(level, day - 1);
}

function getPlanCompletedCount(level) {
  let count = 0;
  for (let day = 1; day <= PLAN_DAYS[level]; day++) {
    if (isPlanDayCompleted(level, day)) count++;
  }
  return count;
}

// 아직 완료하지 않은 첫 일차 (모두 완료했으면 마지막 일차)
function getCurrentPlanDay(level) {
  for (let day = 1; day <= PLAN_DAYS[level]; day++) {
    if (!isPlanDayCompleted(level, day)) return day;
  }
  return PLAN_DAYS[level];
}

function completePlanDay(level, day, pct) {
  if (!userRecord.plans[level]) userRecord.plans[level] = {};
  const prev = userRecord.plans[level][day];
  userRecord.plans[level][day] = { score: Math.max(pct, prev ? prev.score : 0), t: Date.now() };
  scheduleRecordSave();
}

function openPlan(level) {
  currentLevel = level;
  planViewDay = getCurrentPlanDay(level);
  renderPlan();
  showScreen('plan');
}

function renderPlan() {
  const level = currentLevel;
  const days = PLAN_DAYS[level];
  const day = planViewDay;
  const done = getPlanCompletedCount(level);
  const dayRecord = getPlanDayRecord(level, day);

  planTitle.textContent = `HSK ${level}급 학습 플랜`;
  planSubtitle.textContent = `${PLAN_LABELS[level]} 플랜 · ${done}/${days}일 완료`;
  planProgressFill.style.width = `${(done / days) * 100}%`;

  planDayTitle.textContent = `${day}일차`;
  planDayStatus.textContent = dayRecord ? `완료 ✅ 최고 ${dayRecord.score}%` : '학습할 차례 📖';
  planDayStatus.classList.toggle('done', Boolean(dayRecord));

  planWordList.innerHTML = '';
  getPlanDayWords(level, day).forEach((word) => {
    const li = document.createElement('li');
    li.className = 'plan-word';
    li.title = '발음 듣기';

    const hanzi = document.createElement('span');
    hanzi.className = 'plan-word-hanzi';
    hanzi.textContent = word.hanzi;
    const pinyin = document.createElement('span');
    pinyin.className = 'plan-word-pinyin';
    pinyin.textContent = word.pinyin;
    const meaning = document.createElement('span');
    meaning.className = 'plan-word-meaning';
    meaning.textContent = word.meaning;

    li.append(hanzi, pinyin, meaning);
    li.addEventListener('click', () => speakHanzi(word.hanzi));
    planWordList.appendChild(li);
  });

  btnPlanStart.textContent = dayRecord ? '복습 퀴즈 다시 풀기 🔄' : '오늘의 퀴즈 시작 🚀';

  btnPlanPrev.disabled = day === 1;
  btnPlanNext.disabled = day === days;
  // 다음 일차가 잠겨 있으면 자물쇠 모양으로 표시 (누르면 안내 메시지)
  btnPlanNext.classList.toggle('locked', day < days && !isPlanDayUnlocked(level, day + 1));
  btnPlanNext.textContent = btnPlanNext.classList.contains('locked') ? '🔒' : '›';
}

function movePlanDay(delta) {
  const target = planViewDay + delta;
  if (target < 1 || target > PLAN_DAYS[currentLevel]) return;
  if (!isPlanDayUnlocked(currentLevel, target)) {
    showToast(`${planViewDay}일차를 완료해야 다음 일차로 넘어갈 수 있어요 🔒`);
    planDayCard.classList.remove('shake');
    void planDayCard.offsetWidth; // trigger reflow
    planDayCard.classList.add('shake');
    return;
  }
  planViewDay = target;
  renderPlan();
}

function startPlanQuiz(day) {
  currentMode = 'word';
  isReviewQuiz = false;
  isPlanRetryRound = false;
  currentPlanDay = day;
  const questions = shuffle(getPlanDayWords(currentLevel, day)).map((word) => generateQuestion(word, currentLevel));
  startWordQuiz(currentLevel, questions);
}

function hidePlanResult() {
  resultPlanMessage.style.display = 'none';
  btnToPlan.style.display = 'none';
}

function updatePlanResult(pct) {
  if (currentPlanDay === null) {
    hidePlanResult();
    return;
  }
  const level = currentLevel;
  const day = currentPlanDay;
  let message;
  let passed = false;

  if (isPlanRetryRound) {
    // 틀린 문제만 다시 푼 경우는 일차 완료 판정에 넣지 않음
    message = isPlanDayCompleted(level, day)
      ? `${day}일차는 이미 완료했어요 ✅`
      : `틀린 문제 복습을 마쳤어요. ${day}일차 퀴즈에서 ${PLAN_PASS_PERCENT}% 이상 맞히면 완료돼요.`;
    passed = isPlanDayCompleted(level, day);
  } else if (pct >= PLAN_PASS_PERCENT) {
    completePlanDay(level, day, pct);
    passed = true;
    message = day < PLAN_DAYS[level]
      ? `🎉 ${day}일차 완료! ${day + 1}일차가 열렸어요.`
      : `🏆 HSK ${level}급 ${PLAN_LABELS[level]} 학습 플랜을 모두 마쳤어요!`;
  } else {
    message = `${PLAN_PASS_PERCENT}% 이상 맞혀야 ${day}일차가 완료돼요. 다시 도전해 보세요!`;
  }

  resultPlanMessage.textContent = message;
  resultPlanMessage.classList.toggle('passed', passed);
  resultPlanMessage.style.display = '';
  btnToPlan.style.display = '';
}

btnPlanPrev.addEventListener('click', () => movePlanDay(-1));
btnPlanNext.addEventListener('click', () => movePlanDay(1));
btnPlanStart.addEventListener('click', () => startPlanQuiz(planViewDay));
btnPlanBack.addEventListener('click', () => showScreen('difficulty'));
btnToPlan.addEventListener('click', () => openPlan(currentLevel));

// 키보드 ← → 로 일차 이동
document.addEventListener('keydown', (e) => {
  if (planScreen.style.display === 'none') return;
  if (e.key === 'ArrowLeft') movePlanDay(-1);
  if (e.key === 'ArrowRight') movePlanDay(1);
});

// ========================================
// Login & Initial state
// ========================================
const btnLoginGoogle = document.getElementById('btn-login-google');
const loginStatus = document.getElementById('login-status');
let firebaseSettled = false;

function setLoginStatus(message) {
  loginStatus.textContent = message;
}

function enterStartScreen(name) {
  welcomeMessage.textContent = `환영합니다 ${name}님!`;
  showScreen('start');
}

function enterAsGuest() {
  flushRecordSave();
  recordOwner = { type: 'guest' };
  recordSaveBlocked = false;
  userRecord = normalizeRecord(readGuestRecord());
  enterStartScreen('게스트');
}

async function enterAsGoogleUser(user) {
  flushRecordSave();
  recordOwner = { type: 'google', uid: user.uid, name: user.name };
  userRecord = normalizeRecord(null);
  recordSaveBlocked = true;
  setLoginStatus('학습 기록을 불러오는 중...');

  let loadFailed = false;
  try {
    userRecord = normalizeRecord(await window.hanziFirebase.loadRecord(user.uid));
    recordSaveBlocked = false;
  } catch (error) {
    console.error('학습 기록 불러오기 실패:', error);
    loadFailed = true;
  }

  // 불러오는 사이에 로그아웃했다면 화면을 바꾸지 않음
  if (!recordOwner || recordOwner.uid !== user.uid) return;
  setLoginStatus('');
  enterStartScreen(user.name);
  if (loadFailed) showToast('학습 기록을 불러오지 못해서 이번 학습은 저장되지 않아요.');
}

function markGoogleLoginUnavailable(message) {
  firebaseSettled = true;
  btnLoginGoogle.disabled = true;
  btnLoginGoogle.textContent = 'Google 로그인 사용 불가';
  setLoginStatus(message);
}

// firebase.js 에서 호출: 로그인 상태가 바뀔 때 (페이지 처음 열 때도 한 번 호출됨)
window.onHanziAuthChanged = function (user) {
  firebaseSettled = true;
  btnLoginGoogle.disabled = false;
  btnLoginGoogle.textContent = 'Google 계정으로 로그인';

  if (user) {
    if (recordOwner && recordOwner.type === 'google' && recordOwner.uid === user.uid) return;
    localStorage.removeItem(GUEST_FLAG_KEY);
    enterAsGoogleUser(user);
  } else if (recordOwner && recordOwner.type === 'google') {
    // 다른 탭에서 로그아웃한 경우
    recordOwner = null;
    userRecord = normalizeRecord(null);
    showScreen('login');
  }
};

// firebase.js 에서 호출: 설정 누락, 네트워크 오류 등으로 Firebase 를 쓸 수 없을 때
window.onHanziFirebaseUnavailable = function () {
  markGoogleLoginUnavailable('구글 로그인을 불러오지 못했습니다. 게스트로 시작해 주세요.');
};

btnLoginGoogle.addEventListener('click', async () => {
  if (!window.hanziFirebase) return;
  btnLoginGoogle.disabled = true;
  setLoginStatus('');
  try {
    // 성공하면 onHanziAuthChanged 가 화면을 전환함
    await window.hanziFirebase.signIn();
  } catch (error) {
    if (error.code === 'auth/unauthorized-domain') {
      setLoginStatus(`이 주소(${location.hostname})가 Firebase 승인된 도메인에 등록되어 있지 않습니다.`);
    } else if (error.code === 'auth/popup-blocked') {
      setLoginStatus('팝업이 차단되었습니다. 팝업을 허용한 뒤 다시 시도해 주세요.');
    } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
      console.error('로그인 실패:', error);
      setLoginStatus('로그인에 실패했습니다. 다시 시도해 주세요.');
    }
  } finally {
    btnLoginGoogle.disabled = false;
  }
});

btnLoginGuest.addEventListener('click', () => {
  localStorage.setItem(GUEST_FLAG_KEY, 'true');
  enterAsGuest();
});

btnLogout.addEventListener('click', async () => {
  await flushRecordSave();
  const wasGoogleUser = recordOwner && recordOwner.type === 'google';
  recordOwner = null;
  userRecord = normalizeRecord(null);
  localStorage.removeItem(GUEST_FLAG_KEY);
  welcomeMessage.textContent = '';
  setLoginStatus('');
  showScreen('login');

  if (wasGoogleUser && window.hanziFirebase) {
    try {
      await window.hanziFirebase.signOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  }
});

// 시작 시 로그인 체크
localStorage.removeItem('hanzi_username'); // 이전 버전(GIS 로그인)에서 남은 값 정리
if (localStorage.getItem(GUEST_FLAG_KEY)) {
  enterAsGuest();
} else {
  showScreen('login');
}

if (location.protocol === 'file:') {
  // file:// 에서는 모듈 스크립트(firebase.js)를 불러올 수 없음
  markGoogleLoginUnavailable('구글 로그인은 로컬 서버(http://)나 배포된 주소에서만 사용할 수 있습니다.');
} else {
  setTimeout(() => {
    if (!firebaseSettled) {
      markGoogleLoginUnavailable('구글 로그인을 불러오지 못했습니다. 게스트로 시작해 주세요.');
    }
  }, 15000);
}

// ========================================
// Background Music Logic
// ========================================
const bgm = document.getElementById('bgm');
bgm.volume = 0.5; // 배경음악이 너무 크지 않도록 기본 50% 볼륨 설정

function playBgm() {
  if (bgm.paused) {
    bgm.play().catch(error => {
      console.log('브라우저 정책으로 인해 자동 재생이 차단되었습니다. 사용자 상호작용 후 재생됩니다.', error);
    });
  }
}

// 1) 시도: 브라우저 환경에 따라 바로 재생될 수 있음
playBgm();

// 2) 사용자 첫 상호작용 시 무조건 재생 (클릭 등)
document.addEventListener('click', () => {
  playBgm();
}, { once: true });

// ========================================
// Volume Control Logic
// ========================================
const volumeSlider = document.getElementById('volume-slider');
const btnVolume = document.getElementById('btn-volume');

volumeSlider.addEventListener('input', (e) => {
  const vol = parseFloat(e.target.value);
  bgm.volume = vol;
  if (vol === 0) {
    btnVolume.textContent = '🔇';
  } else if (vol < 0.5) {
    btnVolume.textContent = '🔉';
  } else {
    btnVolume.textContent = '🔊';
  }
});

let isMuted = false;
let previousVolume = 0.5;

btnVolume.addEventListener('click', () => {
  if (isMuted) {
    bgm.volume = previousVolume;
    volumeSlider.value = previousVolume;
    isMuted = false;
    btnVolume.textContent = previousVolume < 0.5 ? '🔉' : '🔊';
  } else {
    previousVolume = bgm.volume || 0.5;
    bgm.volume = 0;
    volumeSlider.value = 0;
    isMuted = true;
    btnVolume.textContent = '🔇';
  }
});
