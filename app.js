// ========================================
// 한자 학습 게임 — App Logic
// ========================================

// ========================================
// HSK 단어 데이터 (각 급별 ~100개)
// ========================================

const hsk1Words = [
  { hanzi: '爱', pinyin: 'ài', meaning: '사랑하다' },
  { hanzi: '八', pinyin: 'bā', meaning: '팔, 8' },
  { hanzi: '爸爸', pinyin: 'bàba', meaning: '아빠' },
  { hanzi: '杯子', pinyin: 'bēizi', meaning: '컵' },
  { hanzi: '北京', pinyin: 'Běijīng', meaning: '베이징' },
  { hanzi: '本', pinyin: 'běn', meaning: '권 (양사)' },
  { hanzi: '不客气', pinyin: 'bú kèqi', meaning: '천만에요' },
  { hanzi: '不', pinyin: 'bù', meaning: '~아니다' },
  { hanzi: '菜', pinyin: 'cài', meaning: '요리, 채소' },
  { hanzi: '茶', pinyin: 'chá', meaning: '차' },
  { hanzi: '吃', pinyin: 'chī', meaning: '먹다' },
  { hanzi: '出租车', pinyin: 'chūzūchē', meaning: '택시' },
  { hanzi: '打电话', pinyin: 'dǎ diànhuà', meaning: '전화하다' },
  { hanzi: '大', pinyin: 'dà', meaning: '크다' },
  { hanzi: '的', pinyin: 'de', meaning: '~의' },
  { hanzi: '点', pinyin: 'diǎn', meaning: '시 (시각)' },
  { hanzi: '电脑', pinyin: 'diànnǎo', meaning: '컴퓨터' },
  { hanzi: '电视', pinyin: 'diànshì', meaning: '텔레비전' },
  { hanzi: '电影', pinyin: 'diànyǐng', meaning: '영화' },
  { hanzi: '东西', pinyin: 'dōngxi', meaning: '물건' },
  { hanzi: '都', pinyin: 'dōu', meaning: '모두' },
  { hanzi: '读', pinyin: 'dú', meaning: '읽다' },
  { hanzi: '对不起', pinyin: 'duìbuqǐ', meaning: '미안합니다' },
  { hanzi: '多', pinyin: 'duō', meaning: '많다' },
  { hanzi: '多少', pinyin: 'duōshao', meaning: '얼마' },
  { hanzi: '儿子', pinyin: 'érzi', meaning: '아들' },
  { hanzi: '二', pinyin: 'èr', meaning: '이, 2' },
  { hanzi: '饭店', pinyin: 'fàndiàn', meaning: '식당, 호텔' },
  { hanzi: '飞机', pinyin: 'fēijī', meaning: '비행기' },
  { hanzi: '分钟', pinyin: 'fēnzhōng', meaning: '분 (시간)' },
  { hanzi: '高兴', pinyin: 'gāoxìng', meaning: '기쁘다' },
  { hanzi: '个', pinyin: 'gè', meaning: '개 (양사)' },
  { hanzi: '工作', pinyin: 'gōngzuò', meaning: '일하다' },
  { hanzi: '狗', pinyin: 'gǒu', meaning: '개 (동물)' },
  { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: '중국어' },
  { hanzi: '好', pinyin: 'hǎo', meaning: '좋다' },
  { hanzi: '喝', pinyin: 'hē', meaning: '마시다' },
  { hanzi: '和', pinyin: 'hé', meaning: '~와/과' },
  { hanzi: '很', pinyin: 'hěn', meaning: '매우' },
  { hanzi: '后面', pinyin: 'hòumiàn', meaning: '뒤' },
  { hanzi: '回', pinyin: 'huí', meaning: '돌아가다' },
  { hanzi: '会', pinyin: 'huì', meaning: '~할 수 있다' },
  { hanzi: '火车站', pinyin: 'huǒchēzhàn', meaning: '기차역' },
  { hanzi: '几', pinyin: 'jǐ', meaning: '몇' },
  { hanzi: '家', pinyin: 'jiā', meaning: '집, 가정' },
  { hanzi: '叫', pinyin: 'jiào', meaning: '부르다, ~라고 하다' },
  { hanzi: '今天', pinyin: 'jīntiān', meaning: '오늘' },
  { hanzi: '九', pinyin: 'jiǔ', meaning: '구, 9' },
  { hanzi: '开', pinyin: 'kāi', meaning: '열다, 운전하다' },
  { hanzi: '看', pinyin: 'kàn', meaning: '보다' },
  { hanzi: '看见', pinyin: 'kànjiàn', meaning: '보이다' },
  { hanzi: '块', pinyin: 'kuài', meaning: '위안 (돈 단위)' },
  { hanzi: '来', pinyin: 'lái', meaning: '오다' },
  { hanzi: '老师', pinyin: 'lǎoshī', meaning: '선생님' },
  { hanzi: '了', pinyin: 'le', meaning: '~했다 (완료)' },
  { hanzi: '冷', pinyin: 'lěng', meaning: '춥다' },
  { hanzi: '里', pinyin: 'lǐ', meaning: '안' },
  { hanzi: '六', pinyin: 'liù', meaning: '육, 6' },
  { hanzi: '妈妈', pinyin: 'māma', meaning: '엄마' },
  { hanzi: '吗', pinyin: 'ma', meaning: '~인가요?' },
  { hanzi: '买', pinyin: 'mǎi', meaning: '사다' },
  { hanzi: '猫', pinyin: 'māo', meaning: '고양이' },
  { hanzi: '没关系', pinyin: 'méi guānxi', meaning: '괜찮습니다' },
  { hanzi: '没有', pinyin: 'méiyǒu', meaning: '없다' },
  { hanzi: '米饭', pinyin: 'mǐfàn', meaning: '밥' },
  { hanzi: '明天', pinyin: 'míngtiān', meaning: '내일' },
  { hanzi: '名字', pinyin: 'míngzi', meaning: '이름' },
  { hanzi: '哪', pinyin: 'nǎ', meaning: '어느' },
  { hanzi: '那', pinyin: 'nà', meaning: '그, 저' },
  { hanzi: '呢', pinyin: 'ne', meaning: '~은/는?' },
  { hanzi: '能', pinyin: 'néng', meaning: '~할 수 있다' },
  { hanzi: '你', pinyin: 'nǐ', meaning: '너' },
  { hanzi: '年', pinyin: 'nián', meaning: '년, 해' },
  { hanzi: '女儿', pinyin: 'nǚ\'ér', meaning: '딸' },
  { hanzi: '朋友', pinyin: 'péngyou', meaning: '친구' },
  { hanzi: '漂亮', pinyin: 'piàoliang', meaning: '예쁘다' },
  { hanzi: '苹果', pinyin: 'píngguǒ', meaning: '사과' },
  { hanzi: '七', pinyin: 'qī', meaning: '칠, 7' },
  { hanzi: '前面', pinyin: 'qiánmiàn', meaning: '앞' },
  { hanzi: '钱', pinyin: 'qián', meaning: '돈' },
  { hanzi: '请', pinyin: 'qǐng', meaning: '~해 주세요' },
  { hanzi: '去', pinyin: 'qù', meaning: '가다' },
  { hanzi: '热', pinyin: 'rè', meaning: '덥다' },
  { hanzi: '人', pinyin: 'rén', meaning: '사람' },
  { hanzi: '认识', pinyin: 'rènshi', meaning: '알다, 인식하다' },
  { hanzi: '日', pinyin: 'rì', meaning: '일, 날' },
  { hanzi: '三', pinyin: 'sān', meaning: '삼, 3' },
  { hanzi: '商店', pinyin: 'shāngdiàn', meaning: '상점' },
  { hanzi: '上', pinyin: 'shàng', meaning: '위' },
  { hanzi: '上午', pinyin: 'shàngwǔ', meaning: '오전' },
  { hanzi: '少', pinyin: 'shǎo', meaning: '적다' },
  { hanzi: '谁', pinyin: 'shéi', meaning: '누구' },
  { hanzi: '什么', pinyin: 'shénme', meaning: '무엇' },
  { hanzi: '十', pinyin: 'shí', meaning: '십, 10' },
  { hanzi: '时候', pinyin: 'shíhou', meaning: '때, 시간' },
  { hanzi: '是', pinyin: 'shì', meaning: '~이다' },
  { hanzi: '书', pinyin: 'shū', meaning: '책' },
  { hanzi: '水', pinyin: 'shuǐ', meaning: '물' },
  { hanzi: '水果', pinyin: 'shuǐguǒ', meaning: '과일' },
  { hanzi: '睡觉', pinyin: 'shuìjiào', meaning: '자다' },
];

const hsk2Words = [
  { hanzi: '吧', pinyin: 'ba', meaning: '~하자 (어기조사)' },
  { hanzi: '白', pinyin: 'bái', meaning: '하얗다' },
  { hanzi: '百', pinyin: 'bǎi', meaning: '백, 100' },
  { hanzi: '帮助', pinyin: 'bāngzhù', meaning: '돕다' },
  { hanzi: '报纸', pinyin: 'bàozhǐ', meaning: '신문' },
  { hanzi: '比', pinyin: 'bǐ', meaning: '~보다' },
  { hanzi: '别', pinyin: 'bié', meaning: '~하지 마라' },
  { hanzi: '宾馆', pinyin: 'bīnguǎn', meaning: '호텔' },
  { hanzi: '长', pinyin: 'cháng', meaning: '길다' },
  { hanzi: '唱歌', pinyin: 'chàng gē', meaning: '노래하다' },
  { hanzi: '出', pinyin: 'chū', meaning: '나가다' },
  { hanzi: '穿', pinyin: 'chuān', meaning: '입다' },
  { hanzi: '船', pinyin: 'chuán', meaning: '배 (선박)' },
  { hanzi: '从', pinyin: 'cóng', meaning: '~에서' },
  { hanzi: '错', pinyin: 'cuò', meaning: '틀리다' },
  { hanzi: '打篮球', pinyin: 'dǎ lánqiú', meaning: '농구하다' },
  { hanzi: '大家', pinyin: 'dàjiā', meaning: '모두, 여러분' },
  { hanzi: '到', pinyin: 'dào', meaning: '도착하다' },
  { hanzi: '得', pinyin: 'de', meaning: '~하게 (정도보어)' },
  { hanzi: '等', pinyin: 'děng', meaning: '기다리다' },
  { hanzi: '弟弟', pinyin: 'dìdi', meaning: '남동생' },
  { hanzi: '第一', pinyin: 'dì yī', meaning: '첫 번째' },
  { hanzi: '懂', pinyin: 'dǒng', meaning: '이해하다' },
  { hanzi: '对', pinyin: 'duì', meaning: '맞다' },
  { hanzi: '房间', pinyin: 'fángjiān', meaning: '방' },
  { hanzi: '非常', pinyin: 'fēicháng', meaning: '매우, 아주' },
  { hanzi: '服务员', pinyin: 'fúwùyuán', meaning: '종업원' },
  { hanzi: '高', pinyin: 'gāo', meaning: '높다' },
  { hanzi: '告诉', pinyin: 'gàosu', meaning: '알리다' },
  { hanzi: '哥哥', pinyin: 'gēge', meaning: '형, 오빠' },
  { hanzi: '给', pinyin: 'gěi', meaning: '주다' },
  { hanzi: '公共汽车', pinyin: 'gōnggòng qìchē', meaning: '버스' },
  { hanzi: '公司', pinyin: 'gōngsī', meaning: '회사' },
  { hanzi: '贵', pinyin: 'guì', meaning: '비싸다' },
  { hanzi: '过', pinyin: 'guò', meaning: '~한 적 있다' },
  { hanzi: '还', pinyin: 'hái', meaning: '아직, 또' },
  { hanzi: '孩子', pinyin: 'háizi', meaning: '아이' },
  { hanzi: '好吃', pinyin: 'hǎochī', meaning: '맛있다' },
  { hanzi: '黑', pinyin: 'hēi', meaning: '검다' },
  { hanzi: '红', pinyin: 'hóng', meaning: '빨갛다' },
  { hanzi: '花', pinyin: 'huā', meaning: '꽃' },
  { hanzi: '欢迎', pinyin: 'huānyíng', meaning: '환영하다' },
  { hanzi: '回答', pinyin: 'huídá', meaning: '대답하다' },
  { hanzi: '机场', pinyin: 'jīchǎng', meaning: '공항' },
  { hanzi: '鸡蛋', pinyin: 'jīdàn', meaning: '달걀' },
  { hanzi: '件', pinyin: 'jiàn', meaning: '벌, 건 (양사)' },
  { hanzi: '教室', pinyin: 'jiàoshì', meaning: '교실' },
  { hanzi: '姐姐', pinyin: 'jiějie', meaning: '언니, 누나' },
  { hanzi: '介绍', pinyin: 'jièshào', meaning: '소개하다' },
  { hanzi: '进', pinyin: 'jìn', meaning: '들어가다' },
  { hanzi: '近', pinyin: 'jìn', meaning: '가깝다' },
  { hanzi: '就', pinyin: 'jiù', meaning: '바로, 곧' },
  { hanzi: '觉得', pinyin: 'juéde', meaning: '~라고 생각하다' },
  { hanzi: '咖啡', pinyin: 'kāfēi', meaning: '커피' },
  { hanzi: '开始', pinyin: 'kāishǐ', meaning: '시작하다' },
  { hanzi: '考试', pinyin: 'kǎoshì', meaning: '시험' },
  { hanzi: '可能', pinyin: 'kěnéng', meaning: '아마, 가능하다' },
  { hanzi: '可以', pinyin: 'kěyǐ', meaning: '~해도 된다' },
  { hanzi: '课', pinyin: 'kè', meaning: '수업' },
  { hanzi: '快', pinyin: 'kuài', meaning: '빠르다' },
  { hanzi: '快乐', pinyin: 'kuàilè', meaning: '즐겁다' },
  { hanzi: '累', pinyin: 'lèi', meaning: '피곤하다' },
  { hanzi: '离', pinyin: 'lí', meaning: '~에서 (거리)' },
  { hanzi: '两', pinyin: 'liǎng', meaning: '둘' },
  { hanzi: '零', pinyin: 'líng', meaning: '영, 0' },
  { hanzi: '路', pinyin: 'lù', meaning: '길' },
  { hanzi: '旅游', pinyin: 'lǚyóu', meaning: '여행하다' },
  { hanzi: '卖', pinyin: 'mài', meaning: '팔다' },
  { hanzi: '慢', pinyin: 'màn', meaning: '느리다' },
  { hanzi: '忙', pinyin: 'máng', meaning: '바쁘다' },
  { hanzi: '每', pinyin: 'měi', meaning: '매, 각' },
  { hanzi: '妹妹', pinyin: 'mèimei', meaning: '여동생' },
  { hanzi: '门', pinyin: 'mén', meaning: '문' },
  { hanzi: '面条', pinyin: 'miàntiáo', meaning: '국수' },
  { hanzi: '男人', pinyin: 'nánrén', meaning: '남자' },
  { hanzi: '您', pinyin: 'nín', meaning: '당신 (존칭)' },
  { hanzi: '牛奶', pinyin: 'niúnǎi', meaning: '우유' },
  { hanzi: '女人', pinyin: 'nǚrén', meaning: '여자' },
  { hanzi: '旁边', pinyin: 'pángbiān', meaning: '옆' },
  { hanzi: '跑步', pinyin: 'pǎobù', meaning: '달리기하다' },
  { hanzi: '便宜', pinyin: 'piányi', meaning: '싸다' },
  { hanzi: '票', pinyin: 'piào', meaning: '표' },
  { hanzi: '妻子', pinyin: 'qīzi', meaning: '아내' },
  { hanzi: '起床', pinyin: 'qǐchuáng', meaning: '일어나다' },
  { hanzi: '千', pinyin: 'qiān', meaning: '천, 1000' },
  { hanzi: '晴', pinyin: 'qíng', meaning: '맑다 (날씨)' },
  { hanzi: '去年', pinyin: 'qùnián', meaning: '작년' },
  { hanzi: '让', pinyin: 'ràng', meaning: '~하게 하다' },
  { hanzi: '上班', pinyin: 'shàngbān', meaning: '출근하다' },
  { hanzi: '身体', pinyin: 'shēntǐ', meaning: '몸, 신체' },
  { hanzi: '生病', pinyin: 'shēngbìng', meaning: '병에 걸리다' },
  { hanzi: '生日', pinyin: 'shēngrì', meaning: '생일' },
  { hanzi: '时间', pinyin: 'shíjiān', meaning: '시간' },
  { hanzi: '事情', pinyin: 'shìqing', meaning: '일, 사건' },
  { hanzi: '手表', pinyin: 'shǒubiǎo', meaning: '손목시계' },
  { hanzi: '手机', pinyin: 'shǒujī', meaning: '휴대폰' },
  { hanzi: '说话', pinyin: 'shuō huà', meaning: '말하다' },
  { hanzi: '送', pinyin: 'sòng', meaning: '보내다, 선물하다' },
  { hanzi: '虽然', pinyin: 'suīrán', meaning: '비록 ~이지만' },
  { hanzi: '它', pinyin: 'tā', meaning: '그것' },
];

const hsk3Words = [
  { hanzi: '阿姨', pinyin: 'āyí', meaning: '아줌마' },
  { hanzi: '矮', pinyin: 'ǎi', meaning: '키가 작다' },
  { hanzi: '安静', pinyin: 'ānjìng', meaning: '조용하다' },
  { hanzi: '把', pinyin: 'bǎ', meaning: '~을/를 (전치사)' },
  { hanzi: '搬', pinyin: 'bān', meaning: '옮기다' },
  { hanzi: '办法', pinyin: 'bànfǎ', meaning: '방법' },
  { hanzi: '办公室', pinyin: 'bàngōngshì', meaning: '사무실' },
  { hanzi: '半', pinyin: 'bàn', meaning: '반' },
  { hanzi: '包', pinyin: 'bāo', meaning: '가방' },
  { hanzi: '饱', pinyin: 'bǎo', meaning: '배부르다' },
  { hanzi: '北方', pinyin: 'běifāng', meaning: '북쪽' },
  { hanzi: '被', pinyin: 'bèi', meaning: '~에 의해' },
  { hanzi: '鼻子', pinyin: 'bízi', meaning: '코' },
  { hanzi: '比较', pinyin: 'bǐjiào', meaning: '비교적' },
  { hanzi: '比赛', pinyin: 'bǐsài', meaning: '시합, 경기' },
  { hanzi: '笔记本', pinyin: 'bǐjìběn', meaning: '노트' },
  { hanzi: '必须', pinyin: 'bìxū', meaning: '반드시' },
  { hanzi: '变化', pinyin: 'biànhuà', meaning: '변화' },
  { hanzi: '别人', pinyin: 'biéren', meaning: '다른 사람' },
  { hanzi: '冰箱', pinyin: 'bīngxiāng', meaning: '냉장고' },
  { hanzi: '不但', pinyin: 'búdàn', meaning: '~뿐만 아니라' },
  { hanzi: '才', pinyin: 'cái', meaning: '겨우, 비로소' },
  { hanzi: '菜单', pinyin: 'càidān', meaning: '메뉴' },
  { hanzi: '参加', pinyin: 'cānjiā', meaning: '참가하다' },
  { hanzi: '草', pinyin: 'cǎo', meaning: '풀' },
  { hanzi: '层', pinyin: 'céng', meaning: '층' },
  { hanzi: '差', pinyin: 'chà', meaning: '부족하다, 나쁘다' },
  { hanzi: '超市', pinyin: 'chāoshì', meaning: '슈퍼마켓' },
  { hanzi: '衬衫', pinyin: 'chènshān', meaning: '셔츠' },
  { hanzi: '成绩', pinyin: 'chéngjì', meaning: '성적' },
  { hanzi: '城市', pinyin: 'chéngshì', meaning: '도시' },
  { hanzi: '迟到', pinyin: 'chídào', meaning: '지각하다' },
  { hanzi: '除了', pinyin: 'chúle', meaning: '~외에' },
  { hanzi: '厨房', pinyin: 'chúfáng', meaning: '부엌' },
  { hanzi: '春', pinyin: 'chūn', meaning: '봄' },
  { hanzi: '词典', pinyin: 'cídiǎn', meaning: '사전' },
  { hanzi: '聪明', pinyin: 'cōngming', meaning: '똑똑하다' },
  { hanzi: '打扫', pinyin: 'dǎsǎo', meaning: '청소하다' },
  { hanzi: '打算', pinyin: 'dǎsuàn', meaning: '~할 계획이다' },
  { hanzi: '带', pinyin: 'dài', meaning: '가져가다, 데려가다' },
  { hanzi: '担心', pinyin: 'dānxīn', meaning: '걱정하다' },
  { hanzi: '蛋糕', pinyin: 'dàngāo', meaning: '케이크' },
  { hanzi: '当然', pinyin: 'dāngrán', meaning: '당연히' },
  { hanzi: '地', pinyin: 'de', meaning: '~하게 (부사어)' },
  { hanzi: '灯', pinyin: 'dēng', meaning: '등, 램프' },
  { hanzi: '地方', pinyin: 'dìfang', meaning: '장소' },
  { hanzi: '地铁', pinyin: 'dìtiě', meaning: '지하철' },
  { hanzi: '地图', pinyin: 'dìtú', meaning: '지도' },
  { hanzi: '电梯', pinyin: 'diàntī', meaning: '엘리베이터' },
  { hanzi: '电子邮件', pinyin: 'diànzǐ yóujiàn', meaning: '이메일' },
  { hanzi: '东', pinyin: 'dōng', meaning: '동쪽' },
  { hanzi: '冬', pinyin: 'dōng', meaning: '겨울' },
  { hanzi: '动物', pinyin: 'dòngwù', meaning: '동물' },
  { hanzi: '短', pinyin: 'duǎn', meaning: '짧다' },
  { hanzi: '段', pinyin: 'duàn', meaning: '단락, 구간' },
  { hanzi: '锻炼', pinyin: 'duànliàn', meaning: '운동하다' },
  { hanzi: '多么', pinyin: 'duōme', meaning: '얼마나' },
  { hanzi: '饿', pinyin: 'è', meaning: '배고프다' },
  { hanzi: '耳朵', pinyin: 'ěrduo', meaning: '귀' },
  { hanzi: '发', pinyin: 'fā', meaning: '보내다' },
  { hanzi: '发现', pinyin: 'fāxiàn', meaning: '발견하다' },
  { hanzi: '方便', pinyin: 'fāngbiàn', meaning: '편리하다' },
  { hanzi: '放', pinyin: 'fàng', meaning: '놓다' },
  { hanzi: '放心', pinyin: 'fàngxīn', meaning: '안심하다' },
  { hanzi: '分', pinyin: 'fēn', meaning: '나누다, 점수' },
  { hanzi: '附近', pinyin: 'fùjìn', meaning: '부근' },
  { hanzi: '复习', pinyin: 'fùxí', meaning: '복습하다' },
  { hanzi: '干净', pinyin: 'gānjìng', meaning: '깨끗하다' },
  { hanzi: '感冒', pinyin: 'gǎnmào', meaning: '감기' },
  { hanzi: '刚才', pinyin: 'gāngcái', meaning: '방금' },
  { hanzi: '根据', pinyin: 'gēnjù', meaning: '~에 의하면' },
  { hanzi: '跟', pinyin: 'gēn', meaning: '~와/과 함께' },
  { hanzi: '更', pinyin: 'gèng', meaning: '더, 더욱' },
  { hanzi: '公园', pinyin: 'gōngyuán', meaning: '공원' },
  { hanzi: '故事', pinyin: 'gùshi', meaning: '이야기' },
  { hanzi: '刮风', pinyin: 'guā fēng', meaning: '바람이 불다' },
  { hanzi: '关', pinyin: 'guān', meaning: '닫다' },
  { hanzi: '关系', pinyin: 'guānxi', meaning: '관계' },
  { hanzi: '关心', pinyin: 'guānxīn', meaning: '관심을 갖다' },
  { hanzi: '国家', pinyin: 'guójiā', meaning: '국가' },
  { hanzi: '果汁', pinyin: 'guǒzhī', meaning: '과일주스' },
  { hanzi: '过去', pinyin: 'guòqù', meaning: '과거' },
  { hanzi: '还是', pinyin: 'háishi', meaning: '아니면, 역시' },
  { hanzi: '害怕', pinyin: 'hàipà', meaning: '두려워하다' },
  { hanzi: '河', pinyin: 'hé', meaning: '강' },
  { hanzi: '黑板', pinyin: 'hēibǎn', meaning: '칠판' },
  { hanzi: '护照', pinyin: 'hùzhào', meaning: '여권' },
  { hanzi: '花园', pinyin: 'huāyuán', meaning: '정원' },
  { hanzi: '画', pinyin: 'huà', meaning: '그리다, 그림' },
  { hanzi: '坏', pinyin: 'huài', meaning: '나쁘다, 고장나다' },
  { hanzi: '环境', pinyin: 'huánjìng', meaning: '환경' },
  { hanzi: '换', pinyin: 'huàn', meaning: '바꾸다' },
  { hanzi: '黄', pinyin: 'huáng', meaning: '노랗다' },
  { hanzi: '回忆', pinyin: 'huíyì', meaning: '회상하다' },
  { hanzi: '会议', pinyin: 'huìyì', meaning: '회의' },
  { hanzi: '或者', pinyin: 'huòzhě', meaning: '혹은' },
  { hanzi: '几乎', pinyin: 'jīhū', meaning: '거의' },
  { hanzi: '季节', pinyin: 'jìjié', meaning: '계절' },
  { hanzi: '检查', pinyin: 'jiǎnchá', meaning: '검사하다' },
  { hanzi: '简单', pinyin: 'jiǎndān', meaning: '간단하다' },
  { hanzi: '健康', pinyin: 'jiànkāng', meaning: '건강' },
];

const hsk4Words = [
  { hanzi: '爱情', pinyin: 'àiqíng', meaning: '사랑' },
  { hanzi: '安排', pinyin: 'ānpái', meaning: '배치하다, 안배하다' },
  { hanzi: '安全', pinyin: 'ānquán', meaning: '안전하다' },
  { hanzi: '按时', pinyin: 'ànshí', meaning: '제때에' },
  { hanzi: '按照', pinyin: 'ànzhào', meaning: '~에 따라' },
  { hanzi: '百分之', pinyin: 'bǎifēnzhī', meaning: '퍼센트' },
  { hanzi: '棒', pinyin: 'bàng', meaning: '훌륭하다, 막대기' },
  { hanzi: '包子', pinyin: 'bāozi', meaning: '만두' },
  { hanzi: '保护', pinyin: 'bǎohù', meaning: '보호하다' },
  { hanzi: '保证', pinyin: 'bǎozhèng', meaning: '보증하다' },
  { hanzi: '报名', pinyin: 'bàomíng', meaning: '신청하다' },
  { hanzi: '抱', pinyin: 'bào', meaning: '안다, 포옹하다' },
  { hanzi: '抱歉', pinyin: 'bàoqiàn', meaning: '미안하게 생각하다' },
  { hanzi: '倍', pinyin: 'bèi', meaning: '배 (배수)' },
  { hanzi: '本来', pinyin: 'běnlái', meaning: '본래, 원래' },
  { hanzi: '笨', pinyin: 'bèn', meaning: '멍청하다, 어리석다' },
  { hanzi: '比如', pinyin: 'bǐrú', meaning: '예를 들면' },
  { hanzi: '毕业', pinyin: 'bìyè', meaning: '졸업하다' },
  { hanzi: '遍', pinyin: 'biàn', meaning: '번 (횟수)' },
  { hanzi: '标准', pinyin: 'biāozhǔn', meaning: '표준, 기준' },
  { hanzi: '表格', pinyin: 'biǎogé', meaning: '양식, 표' },
  { hanzi: '表示', pinyin: 'biǎoshì', meaning: '표시하다, 나타내다' },
  { hanzi: '表演', pinyin: 'biǎoyǎn', meaning: '공연하다' },
  { hanzi: '表扬', pinyin: 'biǎoyáng', meaning: '칭찬하다' },
  { hanzi: '饼干', pinyin: 'bǐnggān', meaning: '비스킷, 쿠키' },
  { hanzi: '并且', pinyin: 'bìngqiě', meaning: '게다가, 그리고' },
  { hanzi: '博士', pinyin: 'bóshì', meaning: '박사' },
  { hanzi: '不过', pinyin: 'búguò', meaning: '그렇지만, 그러나' },
  { hanzi: '不得不', pinyin: 'bùdébù', meaning: '어쩔 수 없이' },
  { hanzi: '不管', pinyin: 'bùguǎn', meaning: '~에 관계없이' },
  { hanzi: '不仅', pinyin: 'bùjǐn', meaning: '~일 뿐만 아니라' },
  { hanzi: '部分', pinyin: 'bùfen', meaning: '부분' },
  { hanzi: '擦', pinyin: 'cā', meaning: '닦다' },
  { hanzi: '猜', pinyin: 'cāi', meaning: '추측하다' },
  { hanzi: '材料', pinyin: 'cáiliào', meaning: '재료, 자료' },
  { hanzi: '参观', pinyin: 'cānguān', meaning: '참관하다' },
  { hanzi: '餐厅', pinyin: 'cāntīng', meaning: '식당' },
  { hanzi: '厕所', pinyin: 'cèsuǒ', meaning: '화장실' },
  { hanzi: '差不多', pinyin: 'chàbuduō', meaning: '거의 비슷하다' },
  { hanzi: '长城', pinyin: 'Chángchéng', meaning: '만리장성' },
  { hanzi: '长江', pinyin: 'Chángjiāng', meaning: '창장 (양쯔강)' },
  { hanzi: '尝', pinyin: 'cháng', meaning: '맛보다' },
  { hanzi: '场', pinyin: 'chǎng', meaning: '장, 마당 (양사)' },
  { hanzi: '超过', pinyin: 'chāoguò', meaning: '초과하다' },
  { hanzi: '吵', pinyin: 'chǎo', meaning: '시끄럽다, 다투다' },
  { hanzi: '成功', pinyin: 'chénggōng', meaning: '성공하다' },
  { hanzi: '成为', pinyin: 'chéngwéi', meaning: '~이 되다' },
  { hanzi: '诚实', pinyin: 'chéngshí', meaning: '정직하다' },
  { hanzi: '乘坐', pinyin: 'chéngzuò', meaning: '탑승하다' },
  { hanzi: '吃惊', pinyin: 'chījīng', meaning: '놀라다' },
  { hanzi: '重新', pinyin: 'chóngxīn', meaning: '다시, 새로' },
  { hanzi: '抽烟', pinyin: 'chōuyān', meaning: '담배를 피우다' },
  { hanzi: '出差', pinyin: 'chūchāi', meaning: '출장가다' },
  { hanzi: '出发', pinyin: 'chūfā', meaning: '출발하다' },
  { hanzi: '出生', pinyin: 'chūshēng', meaning: '태어나다' },
  { hanzi: '出现', pinyin: 'chūxiàn', meaning: '나타나다' },
  { hanzi: '厨房', pinyin: 'chúfáng', meaning: '부엌' },
  { hanzi: '传真', pinyin: 'chuánzhēn', meaning: '팩스' },
  { hanzi: '窗户', pinyin: 'chuānghu', meaning: '창문' },
  { hanzi: '词语', pinyin: 'cíyǔ', meaning: '단어' },
  { hanzi: '从来', pinyin: 'cónglái', meaning: '여태껏' },
  { hanzi: '粗心', pinyin: 'cūxīn', meaning: '조심성이 없다' },
  { hanzi: '存', pinyin: 'cún', meaning: '저축하다, 보관하다' },
  { hanzi: '错误', pinyin: 'cuòwù', meaning: '잘못, 오류' },
  { hanzi: '答案', pinyin: 'dá\'àn', meaning: '정답' },
  { hanzi: '打扮', pinyin: 'dǎban', meaning: '꾸미다, 단장하다' },
  { hanzi: '打扰', pinyin: 'dǎrǎo', meaning: '방해하다' },
  { hanzi: '打印', pinyin: 'dǎyìn', meaning: '인쇄하다' },
  { hanzi: '打招呼', pinyin: 'dǎ zhāohu', meaning: '인사하다' },
  { hanzi: '打折', pinyin: 'dǎzhé', meaning: '할인하다' },
  { hanzi: '打针', pinyin: 'dǎzhēn', meaning: '주사를 맞다' },
  { hanzi: '大概', pinyin: 'dàgài', meaning: '대개, 대략' },
  { hanzi: '大使馆', pinyin: 'dàshǐguǎn', meaning: '대사관' },
  { hanzi: '大约', pinyin: 'dàyuē', meaning: '대략, 대강' },
  { hanzi: '大夫', pinyin: 'dàifu', meaning: '의사' },
  { hanzi: '戴', pinyin: 'dài', meaning: '착용하다 (모자, 안경)' },
  { hanzi: '当时', pinyin: 'dāngshí', meaning: '당시' },
  { hanzi: '刀', pinyin: 'dāo', meaning: '칼' },
  { hanzi: '导游', pinyin: 'dǎoyóu', meaning: '가이드' },
  { hanzi: '倒', pinyin: 'dǎo', meaning: '넘어지다' },
  { hanzi: '到处', pinyin: 'dàochù', meaning: '도처에, 곳곳에' },
  { hanzi: '到底', pinyin: 'dàodǐ', meaning: '도대체, 마침내' },
  { hanzi: '道歉', pinyin: 'dàoqiàn', meaning: '사과하다' },
  { hanzi: '得意', pinyin: 'déyì', meaning: '득의양양하다' },
  { hanzi: '得', pinyin: 'děi', meaning: '~해야 한다' },
  { hanzi: '登机牌', pinyin: 'dēngjīpái', meaning: '탑승권' },
  { hanzi: '等', pinyin: 'děng', meaning: '~등' },
  { hanzi: '低', pinyin: 'dī', meaning: '낮다' },
  { hanzi: '底', pinyin: 'dǐ', meaning: '끝, 밑' },
  { hanzi: '地点', pinyin: 'dìdiǎn', meaning: '지점, 장소' },
  { hanzi: '地球', pinyin: 'dìqiú', meaning: '지구' },
  { hanzi: '地址', pinyin: 'dìzhǐ', meaning: '주소' },
  { hanzi: '调查', pinyin: 'diàochá', meaning: '조사하다' },
  { hanzi: '掉', pinyin: 'diào', meaning: '떨어지다' },
  { hanzi: '丢', pinyin: 'diū', meaning: '잃어버리다' },
  { hanzi: '动作', pinyin: 'dòngzuò', meaning: '동작' },
  { hanzi: '堵车', pinyin: 'dǔchē', meaning: '차가 막히다' },
  { hanzi: '肚子', pinyin: 'dùzi', meaning: '배 (신체)' },
  { hanzi: '断', pinyin: 'duàn', meaning: '끊어지다' },
  { hanzi: '对话', pinyin: 'duìhuà', meaning: '대화' },
];

const hsk5Words = [
  { hanzi: '哎', pinyin: 'āi', meaning: '어머나 (감탄사)' },
  { hanzi: '爱护', pinyin: 'àihù', meaning: '아끼고 보호하다' },
  { hanzi: '爱惜', pinyin: 'àixī', meaning: '소중히 여기다' },
  { hanzi: '爱心', pinyin: 'àixīn', meaning: '사랑하는 마음' },
  { hanzi: '安慰', pinyin: 'ānwèi', meaning: '위로하다' },
  { hanzi: '安装', pinyin: 'ānzhuāng', meaning: '설치하다' },
  { hanzi: '岸', pinyin: 'àn', meaning: '기슭, 언덕' },
  { hanzi: '暗', pinyin: 'àn', meaning: '어둡다' },
  { hanzi: '熬夜', pinyin: 'áoyè', meaning: '밤을 새우다' },
  { hanzi: '把握', pinyin: 'bǎwò', meaning: '잡다, 파악하다' },
  { hanzi: '摆', pinyin: 'bǎi', meaning: '배열하다, 놓다' },
  { hanzi: '办理', pinyin: 'bànlǐ', meaning: '처리하다' },
  { hanzi: '傍晚', pinyin: 'bàngwǎn', meaning: '저녁 무렵' },
  { hanzi: '包裹', pinyin: 'bāoguǒ', meaning: '소포' },
  { hanzi: '包含', pinyin: 'bāohán', meaning: '포함하다' },
  { hanzi: '包括', pinyin: 'bāokuò', meaning: '포함하다' },
  { hanzi: '薄', pinyin: 'báo', meaning: '얇다' },
  { hanzi: '宝贝', pinyin: 'bǎobèi', meaning: '보배, 귀염둥이' },
  { hanzi: '宝贵', pinyin: 'bǎoguì', meaning: '귀중하다' },
  { hanzi: '保持', pinyin: 'bǎochí', meaning: '유지하다' },
  { hanzi: '保存', pinyin: 'bǎocún', meaning: '보존하다' },
  { hanzi: '保留', pinyin: 'bǎoliú', meaning: '보류하다' },
  { hanzi: '保险', pinyin: 'bǎoxiǎn', meaning: '보험' },
  { hanzi: '报到', pinyin: 'bàodào', meaning: '도착을 알리다, 등록하다' },
  { hanzi: '报道', pinyin: 'bàodào', meaning: '보도하다' },
  { hanzi: '报告', pinyin: 'bàogào', meaning: '보고하다' },
  { hanzi: '报社', pinyin: 'bàoshè', meaning: '신문사' },
  { hanzi: '抱怨', pinyin: 'bàoyuàn', meaning: '원망하다, 불평하다' },
  { hanzi: '悲观', pinyin: 'bēiguān', meaning: '비관적이다' },
  { hanzi: '背', pinyin: 'bèi', meaning: '등, 업다' },
  { hanzi: '背景', pinyin: 'běijǐng', meaning: '배경' },
  { hanzi: '被子', pinyin: 'bèizi', meaning: '이불' },
  { hanzi: '本科', pinyin: 'běnkē', meaning: '학부 (대학)' },
  { hanzi: '本领', pinyin: 'běnlǐng', meaning: '능력, 솜씨' },
  { hanzi: '本质', pinyin: 'běnzhì', meaning: '본질' },
  { hanzi: '比例', pinyin: 'bǐlì', meaning: '비례, 비율' },
  { hanzi: '彼此', pinyin: 'bǐcǐ', meaning: '피차, 서로' },
  { hanzi: '必然', pinyin: 'bìrán', meaning: '필연적이다' },
  { hanzi: '必要', pinyin: 'bìyào', meaning: '필요하다' },
  { hanzi: '毕竟', pinyin: 'bìjìng', meaning: '어쨌든, 결국' },
  { hanzi: '避免', pinyin: 'bìmiǎn', meaning: '피하다' },
  { hanzi: '编辑', pinyin: 'biānjí', meaning: '편집하다' },
  { hanzi: '鞭炮', pinyin: 'biānpào', meaning: '폭죽' },
  { hanzi: '便', pinyin: 'biàn', meaning: '곧, 편하다' },
  { hanzi: '辩论', pinyin: 'biànlùn', meaning: '변론하다' },
  { hanzi: '标点', pinyin: 'biāodiǎn', meaning: '구두점' },
  { hanzi: '标志', pinyin: 'biāozhì', meaning: '상징, 표지' },
  { hanzi: '表达', pinyin: 'biǎodá', meaning: '표현하다' },
  { hanzi: '表面', pinyin: 'biǎomiàn', meaning: '표면' },
  { hanzi: '表明', pinyin: 'biǎomíng', meaning: '분명하게 나타내다' },
  { hanzi: '表情', pinyin: 'biǎoqíng', meaning: '표정' },
  { hanzi: '表现', pinyin: 'biǎoxiàn', meaning: '표현하다, 태도' },
  { hanzi: '冰激凌', pinyin: 'bīngjīlíng', meaning: '아이스크림' },
  { hanzi: '病毒', pinyin: 'bìngdú', meaning: '바이러스' },
  { hanzi: '玻璃', pinyin: 'bōli', meaning: '유리' },
  { hanzi: '播放', pinyin: 'bōfàng', meaning: '방송하다' },
  { hanzi: '脖子', pinyin: 'bózi', meaning: '목' },
  { hanzi: '博物馆', pinyin: 'bówùguǎn', meaning: '박물관' },
  { hanzi: '补充', pinyin: 'bǔchōng', meaning: '보충하다' },
  { hanzi: '不安', pinyin: 'bù\'ān', meaning: '불안하다' },
  { hanzi: '不得了', pinyin: 'bùdéliǎo', meaning: '큰일 났다' },
  { hanzi: '不断', pinyin: 'búduàn', meaning: '끊임없이' },
  { hanzi: '不见得', pinyin: 'bújiànde', meaning: '반드시 ~한 것은 아니다' },
  { hanzi: '不耐烦', pinyin: 'búnàifán', meaning: '귀찮다, 성가시다' },
  { hanzi: '不要紧', pinyin: 'búyàojǐn', meaning: '괜찮다, 문제없다' },
  { hanzi: '布', pinyin: 'bù', meaning: '천, 직물' },
  { hanzi: '步骤', pinyin: 'bùzhòu', meaning: '절차, 단계' },
  { hanzi: '部门', pinyin: 'bùmén', meaning: '부서, 부문' },
  { hanzi: '财产', pinyin: 'cáichǎn', meaning: '재산' },
  { hanzi: '采访', pinyin: 'cǎifǎng', meaning: '취재하다' },
  { hanzi: '采取', pinyin: 'cǎiqǔ', meaning: '채택하다' },
  { hanzi: '彩虹', pinyin: 'cǎihóng', meaning: '무지개' },
  { hanzi: '踩', pinyin: 'cǎi', meaning: '밟다' },
  { hanzi: '参考', pinyin: 'cānkǎo', meaning: '참고하다' },
  { hanzi: '参与', pinyin: 'cānyù', meaning: '참여하다' },
  { hanzi: '惭愧', pinyin: 'cánkuì', meaning: '부끄럽다' },
  { hanzi: '操场', pinyin: 'cāochǎng', meaning: '운동장' },
  { hanzi: '操心', pinyin: 'cāoxīn', meaning: '애태우다, 신경 쓰다' },
];

const hsk6Words = [
  { hanzi: '哎哟', pinyin: 'āiyō', meaning: '아이고 (감탄사)' },
  { hanzi: '挨', pinyin: 'ái', meaning: '견디다, 당하다' },
  { hanzi: '癌症', pinyin: 'áizhèng', meaning: '암 (질병)' },
  { hanzi: '爱不释手', pinyin: 'àibúshìshǒu', meaning: '너무 좋아서 손에서 놓지 못하다' },
  { hanzi: '爱戴', pinyin: 'àidài', meaning: '추앙하다, 존경하고 사랑하다' },
  { hanzi: '暧昧', pinyin: 'àimèi', meaning: '애매하다, 모호하다' },
  { hanzi: '安宁', pinyin: 'ānníng', meaning: '안녕, 평온하다' },
  { hanzi: '安详', pinyin: 'ānxiáng', meaning: '차분하다, 평온하다' },
  { hanzi: '安置', pinyin: 'ānzhì', meaning: '안치하다, 배치하다' },
  { hanzi: '按摩', pinyin: 'ànmó', meaning: '안마하다' },
  { hanzi: '案件', pinyin: 'ànjiàn', meaning: '안건, 사건' },
  { hanzi: '案例', pinyin: 'ànlì', meaning: '사례, 판례' },
  { hanzi: '暗示', pinyin: 'ànshì', meaning: '암시하다' },
  { hanzi: '昂贵', pinyin: 'ángguì', meaning: '비싸다, 값비싸다' },
  { hanzi: '凹凸', pinyin: 'āotū', meaning: '요철, 울퉁불퉁하다' },
  { hanzi: '熬', pinyin: 'áo', meaning: '오래 끓이다, 참고 견디다' },
  { hanzi: '奥秘', pinyin: 'àomì', meaning: '오비, 비밀' },
  { hanzi: '巴不得', pinyin: 'bābùdé', meaning: '간절히 바라다' },
  { hanzi: '巴结', pinyin: 'bājié', meaning: '아첨하다, 비위를 맞추다' },
  { hanzi: '扒', pinyin: 'bā', meaning: '긁다, 파헤치다' },
  { hanzi: '疤', pinyin: 'bā', meaning: '흉터' },
  { hanzi: '拔苗助长', pinyin: 'bámiáozhùzhǎng', meaning: '조급하게 굴어 오히려 일을 망치다 (발묘조장)' },
  { hanzi: '把关', pinyin: 'bǎguān', meaning: '관문을 지키다, 심사하다' },
  { hanzi: '把手', pinyin: 'bǎshou', meaning: '손잡이' },
  { hanzi: '霸道', pinyin: 'bàdào', meaning: '패도, 횡포하다' },
  { hanzi: '罢工', pinyin: 'bàgōng', meaning: '파업하다' },
  { hanzi: '掰', pinyin: 'bāi', meaning: '쪼개다, 꺾어 떼다' },
  { hanzi: '百分点', pinyin: 'bǎifēndiǎn', meaning: '퍼센트 포인트' },
  { hanzi: '摆脱', pinyin: 'bǎituō', meaning: '벗어나다, 빠져나오다' },
  { hanzi: '拜访', pinyin: 'bàifǎng', meaning: '방문하다' },
  { hanzi: '拜年', pinyin: 'bàinián', meaning: '새해 인사를 하다' },
  { hanzi: '拜托', pinyin: 'bàituō', meaning: '부탁하다' },
  { hanzi: '败坏', pinyin: 'bàihuài', meaning: '망치다, 훼손하다' },
  { hanzi: '颁布', pinyin: 'bānbù', meaning: '반포하다, 공포하다' },
  { hanzi: '颁发', pinyin: 'bānfā', meaning: '수여하다, 발급하다' },
  { hanzi: '斑', pinyin: 'bān', meaning: '반점, 얼룩' },
  { hanzi: '版本', pinyin: 'bǎnběn', meaning: '판본, 버전' },
  { hanzi: '半途而废', pinyin: 'bàntú\'érfèi', meaning: '중도에 그만두다 (반도이폐)' },
  { hanzi: '扮演', pinyin: 'bànyǎn', meaning: '역할을 맡다' },
  { hanzi: '伴随', pinyin: 'bànsuí', meaning: '수반하다, 동반하다' },
  { hanzi: '伴侣', pinyin: 'bànlǚ', meaning: '반려자' },
  { hanzi: '绑架', pinyin: 'bǎngjià', meaning: '납치하다' },
  { hanzi: '榜样', pinyin: 'bǎngyàng', meaning: '모범, 본보기' },
  { hanzi: '磅', pinyin: 'bàng', meaning: '파운드 (무게 단위)' },
  { hanzi: '包庇', pinyin: 'bāobì', meaning: '감싸다, 비호하다' },
  { hanzi: '包袱', pinyin: 'bāofu', meaning: '보따리, 마음의 짐' },
  { hanzi: '包围', pinyin: 'bāowéi', meaning: '포위하다' },
  { hanzi: '包装', pinyin: 'bāozhuāng', meaning: '포장하다' },
  { hanzi: '饱和', pinyin: 'bǎohé', meaning: '포화 상태' },
  { hanzi: '饱经沧桑', pinyin: 'bǎojīngcāngsāng', meaning: '세상 풍파를 다 겪다' },
  { hanzi: '保管', pinyin: 'bǎoguǎn', meaning: '보관하다' },
  { hanzi: '保密', pinyin: 'bǎomì', meaning: '비밀을 유지하다' },
  { hanzi: '保姆', pinyin: 'bǎomǔ', meaning: '보모' },
  { hanzi: '保守', pinyin: 'bǎoshǒu', meaning: '보수적이다' },
  { hanzi: '保卫', pinyin: 'bǎowèi', meaning: '보위하다, 지키다' },
  { hanzi: '保养', pinyin: 'bǎoyǎng', meaning: '보양하다, 관리하다' },
  { hanzi: '保障', pinyin: 'bǎozhàng', meaning: '보장하다' },
  { hanzi: '保重', pinyin: 'bǎozhòng', meaning: '몸조심하다' },
  { hanzi: '抱负', pinyin: 'bàofù', meaning: '포부' },
  { hanzi: '抱怨', pinyin: 'bàoyuàn', meaning: '불평하다, 원망하다' },
  { hanzi: '暴发', pinyin: 'bàofā', meaning: '갑자기 일어나다, 폭발하다' },
  { hanzi: '暴力', pinyin: 'bàolì', meaning: '폭력' },
  { hanzi: '暴露', pinyin: 'bàolù', meaning: '폭로하다, 드러나다' },
  { hanzi: '曝光', pinyin: 'bàoguāng', meaning: '노출되다, 폭로되다' },
  { hanzi: '爆发', pinyin: 'bàofā', meaning: '폭발하다 (화산, 감정)' },
  { hanzi: '爆炸', pinyin: 'bàozhà', meaning: '폭발하다' },
  { hanzi: '悲哀', pinyin: 'bēi\'āi', meaning: '비애, 슬프다' },
  { hanzi: '悲惨', pinyin: 'bēicǎn', meaning: '비참하다' },
  { hanzi: '卑鄙', pinyin: 'bēibǐ', meaning: '비열하다' },
  { hanzi: '北极', pinyin: 'běijí', meaning: '북극' },
  { hanzi: '贝壳', pinyin: 'bèiké', meaning: '조개껍데기' },
  { hanzi: '备份', pinyin: 'bèifèn', meaning: '백업하다' },
  { hanzi: '备忘录', pinyin: 'bèiwànglù', meaning: '비망록, 메모' },
  { hanzi: '背叛', pinyin: 'bèipàn', meaning: '배반하다' },
  { hanzi: '背诵', pinyin: 'bèisòng', meaning: '암송하다' },
  { hanzi: '被动', pinyin: 'bèidòng', meaning: '수동적이다' },
  { hanzi: '被告', pinyin: 'bèigào', meaning: '피고' },
  { hanzi: '奔波', pinyin: 'bēnbō', meaning: '분주히 돌아다니다' },
  { hanzi: '奔驰', pinyin: 'bēnchí', meaning: '질주하다' },
  { hanzi: '本能', pinyin: 'běnnéng', meaning: '본능' },
];

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
// Game State
// ========================================
let currentLevel = 1;
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;
let shuffledQuiz = [];
let quizCount = 10;

// ========================================
// DOM Elements
// ========================================
const startScreen = document.getElementById('start-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const countScreen = document.getElementById('count-screen');
const quizScreen = document.getElementById('quiz-screen');
const btnStart = document.getElementById('btn-start');
const btnBackToStart = document.getElementById('btn-back-to-start');
const btnBackToDifficulty = document.getElementById('btn-back-to-difficulty');
const btnStartQuiz = document.getElementById('btn-start-quiz');
const countSlider = document.getElementById('count-slider');
const countNumber = document.getElementById('count-number');
const levelSubtitle = document.getElementById('level-subtitle');

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
  startScreen.style.display = 'none';
  difficultyScreen.style.display = 'none';
  countScreen.style.display = 'none';
  quizScreen.style.display = 'none';

  if (screenName === 'start') {
    startScreen.style.display = '';
    feedbackSection.style.display = '';
  } else if (screenName === 'difficulty') {
    difficultyScreen.style.display = '';
    feedbackSection.style.display = '';
  } else if (screenName === 'count') {
    countScreen.style.display = '';
    feedbackSection.style.display = '';
  } else if (screenName === 'quiz') {
    quizScreen.style.display = '';
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

  return selected.map((word) => {
    // Get 3 wrong answers from the same level, different from the correct one
    const otherMeanings = words
      .filter((w) => w.meaning !== word.meaning)
      .map((w) => w.meaning);
    const wrongChoices = shuffle(otherMeanings).slice(0, 3);
    const choices = shuffle([word.meaning, ...wrongChoices]);

    return {
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      answer: word.meaning,
      choices: choices,
    };
  });
}

// ========================================
// Start Screen → Difficulty Screen
// ========================================
btnStart.addEventListener('click', () => {
  showScreen('difficulty');
});

// ========================================
// Back to Start
// ========================================
btnBackToStart.addEventListener('click', () => {
  showScreen('start');
});

// ========================================
// Difficulty Selection → Count Screen
// ========================================
document.querySelectorAll('.difficulty-card').forEach((card) => {
  card.addEventListener('click', () => {
    currentLevel = parseInt(card.dataset.level);
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
  startQuiz(currentLevel);
});

// ========================================
// Start Quiz
// ========================================
function startQuiz(level) {
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  answered = false;

  // Update subtitle
  levelSubtitle.textContent = `HSK ${level}급 한자 퀴즈`;

  // Generate quiz
  shuffledQuiz = generateQuiz(level, quizCount);
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

  // Update score
  if (isCorrect) {
    correctCount++;
  } else {
    wrongCount++;
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
// Next button handler
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
// Show result screen
// ========================================
function showResult() {
  // Fill progress bar to 100%
  progressFill.style.width = '100%';

  quizCard.style.display = 'none';
  progressWrapper.style.display = 'none';
  resultScreen.style.display = '';

  const total = shuffledQuiz.length;
  const pct = Math.round((correctCount / total) * 100);

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
}

// ========================================
// Restart (same level)
// ========================================
btnRestart.addEventListener('click', () => {
  startQuiz(currentLevel);
});

// ========================================
// Home (back to start)
// ========================================
btnHome.addEventListener('click', () => {
  showScreen('start');
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
// Initial state: show start screen
// ========================================
showScreen('start');
