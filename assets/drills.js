/**
 * 关卡数据（对齐 daziya.com 标准指法 / 拼音练习课程的关卡编排）
 *
 * 课程结构（共 135 关，编号与站内一致）：
 *   1-18   基准键
 *   19-43  上排字母
 *   44-64  下排字母
 *   65-76  特殊符号
 *   77-94  手指旅行
 *   95-106 左右手练习
 *   107-135 拼音练习（声母 / 韵母 / 整体认读 / 拼音组合 a-z）
 *
 * 说明：原文站的 136 关之后是《登鹳雀楼》等诗词、课文、百科、成语等成段中文内容，
 * 需要中文输入法才能练习，会破坏指法节奏，因此这里不做收录。
 *
 * 每个关卡：{ n, name, kind, section, tokens, note }
 *   tokens 为逐一比对的输入单元；普通字符逐字拆分，Tab / Shift 关卡为多字符单元。
 */
(function () {
  'use strict';

  /* ---------------- 文本生成 ---------------- */

  // 固定种子的伪随机，保证每次打开同一关卡内容一致
  function rng(seed) {
    var s = seed || 1;
    return function () {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 从键位集合里按节奏取字符，每 group 个字符插入一个空格
  function spread(keys, count, seed, group) {
    var r = rng(seed);
    var out = [];
    var g = 0;
    var size = group || 6;
    for (var i = 0; i < count; i++) {
      out.push(keys[Math.floor(r() * keys.length)]);
      g += 1;
      if (g >= size) {
        out.push(' ');
        g = 0;
      }
    }
    return out.join('');
  }

  // 学习关：先同键重复几拍，再交替练习
  function learn(keys, seed) {
    var r = rng(seed);
    var out = [];
    keys.forEach(function (k) {
      var n = 3 + Math.floor(r() * 3);
      for (var i = 0; i < n; i++) out.push(k);
      out.push(' ');
    });
    for (var j = 0; j < 10; j++) out.push(keys[Math.floor(r() * keys.length)]);
    return out.join('');
  }

  // 重复一组音节，直到够长
  function cycle(list, minLen) {
    var text = list;
    while (text.length < (minLen || 60)) text += ' ' + list;
    return text;
  }

  var SECTIONS = [
    { id: 'home', title: '基准键', from: 1, to: 18, hint: '八个手指各就各位，先建立回家的感觉' },
    { id: 'top', title: '上排字母', from: 19, to: 43, hint: '手指向上伸展，打完立刻回到基准键' },
    { id: 'bottom', title: '下排字母', from: 44, to: 64, hint: '下排幅度较大，注意小指与无名指分工' },
    { id: 'symbol', title: '特殊符号', from: 65, to: 76, hint: '配合 Shift 打出符号，小指按住 Shift 不放' },
    { id: 'travel', title: '手指旅行', from: 77, to: 94, hint: '放开基准键，让每根手指去找自己的地盘' },
    { id: 'hand', title: '左右手练习', from: 95, to: 106, hint: '左右手分开熟练，再从拼音词组过渡到英文单词' },
    { id: 'pinyin', title: '拼音练习', from: 107, to: 135, hint: '拼音全部用小写字母输入，ü 用 v 代替' }
  ];

  function sectionOf(n) {
    for (var i = 0; i < SECTIONS.length; i++) {
      if (n >= SECTIONS[i].from && n <= SECTIONS[i].to) return SECTIONS[i].id;
    }
    return 'home';
  }

  var NOTES = {
    learn: '先慢一点，看着指法提示把每个键按准。',
    practice: '按节奏一组一组打，慢而准比快更重要。',
    review: '回顾已经学过的键，注意手指是否回位。',
    game: '放松一点，把这组键当成小游戏来打。',
    special: 'Shift 用离得远的那只小指按住，再按符号键。',
    travel: '手指伸出去按完要立刻回到基准键。',
    pinyin: '拼音全部用小写字母输入，ü 用 v 代替。'
  };

  /* ---------------- 关卡表 ---------------- */

  var LIST = [];

  function add(n, name, kind, tokens) {
    LIST.push({
      n: n,
      name: name,
      kind: kind,
      section: sectionOf(n),
      tokens: tokens,
      note: NOTES[kind] || ''
    });
  }

  function chars(text) {
    return text.split('');
  }

  function multiTokens(list, count, seed) {
    var r = rng(seed);
    var out = [];
    for (var i = 0; i < count; i++) out.push(list[Math.floor(r() * list.length)]);
    return out;
  }

  // —— 基准键 1-18 ——
  add(1, '学习：f 和 j', 'learn', chars(learn(['f', 'j'], 1)));
  add(2, '练习：f 和 j', 'practice', chars(spread(['f', 'j'], 62, 2)));
  add(3, '学习：d 和 k', 'learn', chars(learn(['d', 'k'], 3)));
  add(4, '练习：d 和 k', 'practice', chars(spread(['d', 'k', 'f', 'j'], 62, 4)));
  add(5, '练习：fjdk', 'practice', chars(spread(['f', 'j', 'd', 'k'], 64, 5, 5)));
  add(6, '游戏：fjdk', 'game', chars(spread(['f', 'j', 'd', 'k'], 74, 6, 4)));
  add(7, '学习：s 和 l', 'learn', chars(learn(['s', 'l'], 7)));
  add(8, '练习：s 和 l', 'practice', chars(spread(['s', 'l', 'd', 'k', 'f', 'j'], 62, 8)));
  add(9, '练习：fjdksl', 'practice', chars(spread(['f', 'j', 'd', 'k', 's', 'l'], 66, 9, 5)));
  add(10, '学习：a 和 ;', 'learn', chars(learn(['a', ';'], 10)));
  add(11, '练习：a 和 ;', 'practice', chars(spread(['a', ';', 's', 'l', 'd', 'k', 'f', 'j'], 64, 11)));
  add(12, '练习：8 个基准键', 'practice', chars(spread('asdfjkl;'.split(''), 66, 12, 4)));
  add(13, '游戏：8 个基准键', 'game', chars(spread('asdfjkl;'.split(''), 76, 13, 4)));
  add(14, '学习：g 和 h', 'learn', chars(learn(['g', 'h'], 14)));
  add(15, '练习：g 和 h', 'practice', chars(spread(['g', 'h', 'f', 'j', 'd', 'k'], 62, 15)));
  add(16, '练习：asdfghjkl;', 'practice', chars(spread('asdfghjkl;'.split(''), 70, 16, 5)));
  add(17, '练习：基准键', 'practice', chars(spread('asdfghjkl;'.split(''), 72, 17, 5)));
  add(18, '游戏：基准键', 'game', chars(spread('asdfghjkl;'.split(''), 78, 18, 4)));

  // —— 上排字母 19-43 ——
  var topAll = 'qwertyuiop'.split('');
  var homePlus = 'asdfghjkl;'.split('');
  add(19, '学习：r 和 u', 'learn', chars(learn(['r', 'u'], 19)));
  add(20, '练习：r 和 u', 'practice', chars(spread(['r', 'u', 'f', 'j'], 62, 20)));
  add(21, 'ru回顾：r 和 u', 'review', chars(spread(['r', 'u', 'f', 'j', 'd', 'k'], 64, 21, 5)));
  add(22, '学习：e 和 i', 'learn', chars(learn(['e', 'i'], 22)));
  add(23, '练习：e 和 i', 'practice', chars(spread(['e', 'i', 'r', 'u'], 64, 23)));
  add(24, 'ei回顾：e 和 i', 'review', chars(spread(['e', 'i', 'r', 'u', 'f', 'j'], 66, 24, 5)));
  add(25, '左手上排字母', 'practice', chars(spread('qwert'.split(''), 62, 25, 5)));
  add(26, '右手上排字母', 'practice', chars(spread('yuiop'.split(''), 62, 26, 5)));
  add(27, '游戏：ruei', 'game', chars(spread(['r', 'u', 'e', 'i'], 72, 27, 4)));
  add(28, '学习：w 和 o', 'learn', chars(learn(['w', 'o'], 28)));
  add(29, '练习：w 和 o', 'practice', chars(spread(['w', 'o', 'e', 'i', 'r', 'u'], 64, 29, 5)));
  add(30, 'wo回顾：w 和 o', 'review', chars(spread(['w', 'o', 'e', 'i', 'r', 'u'], 66, 30, 5)));
  add(31, '游戏：上排字母', 'game', chars(spread(topAll, 76, 31, 4)));
  add(32, '学习：q 和 y', 'learn', chars(learn(['q', 'y'], 32)));
  add(33, '练习：q 和 y', 'practice', chars(spread(['q', 'y', 'w', 'o', 'e', 'i'], 64, 33, 5)));
  add(34, 'qy回顾：q 和 y', 'review', chars(spread(['q', 'y', 'w', 'o'], 66, 34, 5)));
  add(35, '学习：t 和 p', 'learn', chars(learn(['t', 'p'], 35)));
  add(36, '练习：t 和 p', 'practice', chars(spread(['t', 'p', 'r', 'u', 'e', 'i'], 64, 36, 5)));
  add(37, 'tp回顾：t 和 p', 'review', chars(spread(['t', 'p', 'r', 'u', 'q', 'y'], 66, 37, 5)));
  add(38, '游戏：上排字母', 'game', chars(spread(topAll, 76, 38, 4)));
  add(39, '回顾：基准键上排字母', 'review', chars(spread(homePlus.concat(topAll), 78, 39, 5)));
  add(40, '左手上排字母', 'practice', chars(spread('qwert'.split(''), 64, 40, 5)));
  add(41, '右手上排字母', 'practice', chars(spread('yuiop'.split(''), 64, 41, 5)));
  add(42, '游戏：上排字母', 'game', chars(spread(topAll, 78, 42, 4)));
  add(43, '游戏：上排字母', 'game', chars(spread(topAll, 80, 43, 5)));

  // —— 下排字母 44-64 ——
  var bottomAll = 'zxcvbnm,./'.split('');
  add(44, '学习：v 和 m', 'learn', chars(learn(['v', 'm'], 44)));
  add(45, '练习：v 和 m', 'practice', chars(spread(['v', 'm', 'f', 'j'], 62, 45)));
  add(46, 'vm回顾：v 和 m', 'review', chars(spread(['v', 'm', 'f', 'j', 'b', 'n'], 64, 46, 5)));
  add(47, '学习：c 和 ,', 'learn', chars(learn(['c', ','], 47)));
  add(48, '练习：c 和 ,', 'practice', chars(spread(['c', ',', 'v', 'm'], 64, 48)));
  add(49, 'c,回顾：c 和 ,', 'review', chars(spread(['c', ',', 'v', 'm', 'x', '.'], 66, 49, 5)));
  add(50, '游戏：vmc,', 'game', chars(spread(['v', 'm', 'c', ','], 74, 50, 4)));
  add(51, '学习：x 和 .', 'learn', chars(learn(['x', '.'], 51)));
  add(52, '练习：x 和 .', 'practice', chars(spread(['x', '.', 'c', ',', 'v', 'm'], 64, 52, 5)));
  add(53, 'x.回顾：x 和 .', 'review', chars(spread(['x', '.', 'c', ','], 66, 53, 5)));
  add(54, '学习：z 和 /', 'learn', chars(learn(['z', '/'], 54)));
  add(55, '练习：z 和 /', 'practice', chars(spread(['z', '/', 'x', '.', 'c', ','], 64, 55, 5)));
  add(56, 'z/回顾：z 和 /', 'review', chars(spread(['z', '/', 'x', '.', 'v', 'm'], 66, 56, 5)));
  add(57, '游戏：下排字母,', 'game', chars(spread('zxcvbnm,'.split(''), 76, 57, 4)));
  add(58, '学习：b 和 n', 'learn', chars(learn(['b', 'n'], 58)));
  add(59, '练习：b 和 n', 'practice', chars(spread(['b', 'n', 'v', 'm', 'c', ','], 64, 59, 5)));
  add(60, 'bn回顾：b 和 n', 'review', chars(spread(['b', 'n', 'v', 'm'], 66, 60, 5)));
  add(61, '左手下排字母', 'practice', chars(spread('zxcvb'.split(''), 62, 61, 5)));
  add(62, '右手下排字母', 'practice', chars(spread('nm,./'.split(''), 62, 62, 5)));
  add(63, '练习：下排字母', 'practice', chars(spread(bottomAll, 70, 63, 5)));
  add(64, '游戏：下排字母', 'game', chars(spread(bottomAll, 78, 64, 4)));

  // —— 特殊符号 65-76 ——
  add(65, 'Tab键', 'special', multiTokens(['Tab'], 12, 65));
  add(66, 'Shift键', 'special', multiTokens(['Shift'], 12, 66));
  add(67, '#和*键', 'special', chars(spread(['#', '*'], 30, 67, 3)));
  add(68, '@和(键', 'special', chars(spread(['@', '('], 30, 68, 3)));
  add(69, '!和)键', 'special', chars(spread(['!', ')'], 30, 69, 3)));
  add(70, '%和^键', 'special', chars(spread(['%', '^'], 30, 70, 3)));
  add(71, '=和-键', 'special', chars(spread(['=', '-'], 32, 71, 4)));
  add(72, '[和]键', 'special', chars(spread(['[', ']'], 32, 72, 4)));
  add(73, '\\和|键', 'special', chars(spread(['\\', '|'], 32, 73, 4)));
  add(74, '· 键（` 和 ~）', 'special', chars(spread(['`', '~'], 32, 74, 4)));
  add(75, '游戏：特殊符号', 'game', chars(spread(['#', '*', '@', '(', '!', ')', '%', '^'], 64, 75, 4)));
  add(76, '游戏：特殊符号', 'game', chars(spread(['=', '-', '[', ']', '\\', '|', '`', '~'], 64, 76, 4)));

  // —— 手指旅行 77-94 ——
  add(77, '右手食指旅行', 'travel', chars(spread('67yuhjnm'.split(''), 66, 77, 5)));
  add(78, '左手食指旅行', 'travel', chars(spread('45rtfgvb'.split(''), 66, 78, 5)));
  add(79, '右手中指旅行', 'travel', chars(spread('8ik,'.split(''), 62, 79, 5)));
  add(80, '左手中指旅行', 'travel', chars(spread('3edc'.split(''), 62, 80, 5)));
  add(81, '右手无名指旅行', 'travel', chars(spread('9ol.'.split(''), 62, 81, 5)));
  add(82, '左手无名指旅行', 'travel', chars(spread('2wsx'.split(''), 62, 82, 5)));
  add(83, '右手小拇指旅行', 'travel', chars(spread(['0', '-', '=', 'p', '[', ']', '\\', ';', "'", '/'], 66, 83, 5)));
  add(84, '左手小拇指旅行', 'travel', chars(spread(['1', 'q', 'a', 'z', '`'], 62, 84, 5)));
  add(85, '手指旅行 $', 'travel', chars(spread(['$', '4', '5', 'r', 't', 'f', 'g', 'v', 'b'], 66, 85, 5)));
  add(86, '手指旅行 #', 'travel', chars(spread(['#', '3', 'e', 'd', 'c'], 62, 86, 5)));
  add(87, '手指旅行 @', 'travel', chars(spread(['@', '2', 'w', 's', 'x'], 62, 87, 5)));
  add(88, '手指旅行 !', 'travel', chars(spread(['!', '1', 'q', 'a', 'z'], 62, 88, 5)));
  add(89, '手指旅行 %', 'travel', chars(spread(['%', '5', 't', 'g', 'b'], 62, 89, 5)));
  add(90, '手指旅行 &', 'travel', chars(spread(['&', '7', 'y', 'h', 'n'], 62, 90, 5)));
  add(91, '手指旅行 *', 'travel', chars(spread(['*', '8', 'i', 'k', ','], 62, 91, 5)));
  add(92, '手指旅行 (', 'travel', chars(spread(['(', '9', 'o', 'l', '.'], 62, 92, 5)));
  add(93, '手指旅行 )', 'travel', chars(spread([')', '0', 'p', ';', '/'], 62, 93, 5)));
  add(94, '手指旅行 ^', 'travel', chars(spread(['^', '6', 'y', 'h', 'n'], 62, 94, 5)));

  // —— 左右手练习 95-106 ——
  var leftPinyin = 'ba ba de fa ge da ta za ca sa wa re te ze ce se ve';
  var rightPinyin = 'ni mi ji yi yu hu ju ku lu mu nu li min jing ying ning';
  var leftWords = 'we were tree water see deer free street feed deed seed';
  var rightWords = 'you him join milk noon loom hill pill mini union';

  add(95, '左手练习-拼音', 'practice', chars(cycle(leftPinyin)));
  add(96, '右手练习-拼音', 'practice', chars(cycle(rightPinyin)));
  add(97, '左手练习-拼音', 'review', chars(cycle(leftPinyin)));
  add(98, '右手练习-拼音', 'review', chars(cycle(rightPinyin)));
  add(99, '左手练习-拼音', 'review', chars(cycle(leftPinyin)));
  add(100, '右手练习-拼音', 'review', chars(cycle(rightPinyin)));
  add(101, '英文左手-英文', 'practice', chars(cycle(leftWords)));
  add(102, '右手练习-英文', 'practice', chars(cycle(rightWords)));
  add(103, '英文左手-英文', 'review', chars(cycle(leftWords)));
  add(104, '右手练习-英文', 'review', chars(cycle(rightWords)));
  add(105, '英文左手-英文', 'review', chars(cycle(leftWords)));
  add(106, '右手练习-英文', 'review', chars(cycle(rightWords)));

  // —— 拼音练习 107-135 ——
  var PINYIN_COMBOS = {
    a: 'a ai an ang ao',
    b: 'ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu',
    c: 'ca cai can cang cao ce cen ceng cha chan chang chao che chen cheng chi chong chu ci cong cu cuo',
    d: 'da dai dan dang dao de deng di dian diao die ding dong dou du duan dui duo',
    e: 'e ei en eng er',
    f: 'fa fan fang fei fen feng fo fou fu',
    g: 'ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan gui guo',
    h: 'ha hai han hang hao he hei hen heng hong hou hu hua huai huan hui hun huo',
    i: 'i ia ian iang iao ie in ing iong iu',
    j: 'ji jia jian jiang jiao jie jin jing jiu ju juan jue jun',
    k: 'ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kui kun kuo',
    l: 'la lai lan lang lao le lei leng li lian liang liao lie lin ling liu long lou lu luan lun luo lv',
    m: 'ma mai man mang mao me mei men meng mi mian miao mie min ming mo mou mu',
    n: 'na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nu nuan nuo nv',
    o: 'o ou ong',
    p: 'pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu',
    q: 'qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun',
    r: 'ran rang rao re ren reng ri rong rou ru ruan rui run ruo',
    s: 'sa sai san sang sao se sen seng sha shan shang shao she shen sheng shi shou shu shua shuai shui shuo si song sou su suan sui suo',
    t: 'ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tuo',
    u: 'u ua uai uan uang uo ui un',
    v: 'v ve van vn',
    w: 'wa wai wan wang wei wen weng wo wu',
    x: 'xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun',
    y: 'ya yan yang yao ye yi yin ying yong you yu yuan yue yun',
    z: 'za zai zan zang zao ze zei zen zeng zha zhan zhang zhao zhe zhen zheng zhi zhong zhou zhu zhuan zhui zhuo zi zong zou zu zui zuo'
  };

  add(107, '开始拼音练习', 'pinyin', chars(cycle('a o e i u v ba pa ma fa da ta na la ga ka ha', 60)));
  add(108, '声母', 'pinyin', chars(cycle('b p m f d t n l g k h j q x zh ch sh r z c s y w', 60)));
  add(109, '韵母', 'pinyin', chars(cycle('a o e i u v ai ei ui ao ou iu ie ve er an en in un vn ang eng ing ong', 64)));
  add(110, '整体认读音节', 'pinyin', chars(cycle('zhi chi shi ri zi ci si yi wu yu yue yuan yin yun ying', 64)));

  // 站内拼音组合共 25 关（a-u、w-z，未设 v），编号 111-135
  'abcdefghijklmnopqrstuwxyz'.split('').forEach(function (letter, i) {
    add(111 + i, '拼音组合 ' + letter, 'pinyin', chars(cycle(PINYIN_COMBOS[letter], 62)));
  });

  /* ---------------- 导出 ---------------- */

  window.DRILL_SECTIONS = SECTIONS;
  window.DRILLS = LIST;
})();