/* ============================================================
   打字练习 · 交互逻辑
   - 逐字符高亮：当前字符蓝色脉冲，正确绿色，错误粉色抖动，退格黄色
   - 虚拟键盘：目标键蓝底高亮，按错键红色标记，按键有下压缩放
   - 实时统计：速度（字/分钟）、准确率、用时，首个按键开始计时
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- DOM ---------------- */
  var stage = document.getElementById('stage');
  var stageTip = document.getElementById('stageTip');
  var progressEl = document.getElementById('progress');
  var progressFill = document.getElementById('progressFill');
  var keyboardEl = document.getElementById('keyboard');
  var crumbLevel = document.getElementById('crumbLevel');
  var btnLevels = document.getElementById('btnLevels');
  var levelOverlay = document.getElementById('levelOverlay');
  var levelsEl = document.getElementById('levels');
  var levelCount = document.getElementById('levelCount');
  var btnLevelsClose = document.getElementById('btnLevelsClose');
  var statSpeed = document.getElementById('statSpeed');
  var statTime = document.getElementById('statTime');
  var statCombo = document.getElementById('statCombo');
  var comboChip = document.getElementById('comboChip');
  var starsEl = document.getElementById('stars');
  var cheerEl = document.getElementById('cheer');

  var fingerHand = document.getElementById('fingerHand');
  var fingerName = document.getElementById('fingerName');
  var fingerKey = document.getElementById('fingerKey');
  var fingerHint = document.getElementById('fingerHint');

  var pauseOverlay = document.getElementById('pauseOverlay');
  var resultOverlay = document.getElementById('resultOverlay');
  var resultStarRow = document.getElementById('resultStarRow');
  var customOverlay = document.getElementById('customOverlay');
  var customText = document.getElementById('customText');

  var btnPause = document.getElementById('btnPause');
  var btnHint = document.getElementById('btnHint');
  var btnTheme = document.getElementById('btnTheme');
  var btnPalette = document.getElementById('btnPalette');
  var paletteOverlay = document.getElementById('paletteOverlay');
  var paletteList = document.getElementById('paletteList');
  var btnPaletteClose = document.getElementById('btnPaletteClose');
  var btnSound = document.getElementById('btnSound');
  var btnRestart = document.getElementById('btnRestart');
  var btnBrand = document.getElementById('btnBrand');
  var btnCustom = document.getElementById('btnCustom');
  var btnCustomApply = document.getElementById('btnCustomApply');
  var btnCustomCancel = document.getElementById('btnCustomCancel');
  var btnResume = document.getElementById('btnResume');
  var btnRetry = document.getElementById('btnRetry');
  var btnNext = document.getElementById('btnNext');

  /* ---------------- 键盘布局 ---------------- */
  // top 为 Shift 上档字符，base 为键位字符（用于高亮匹配）
  function key(base, top, grow, label) {
    return { base: base, top: top || '', grow: grow || 1, label: label || '' };
  }

  var KEY_ROWS = [
    [
      key('`', '~'), key('1', '!'), key('2', '@'), key('3', '#'), key('4', '$'),
      key('5', '%'), key('6', '^'), key('7', '&'), key('8', '*'), key('9', '('),
      key('0', ')'), key('-', '_'), key('=', '+'), key('Backspace', '', 2, 'backspace')
    ],
    [
      key('Tab', '', 1.5, 'tab'),
      key('q'), key('w'), key('e'), key('r'), key('t'), key('y'), key('u'), key('i'), key('o'), key('p'),
      key('[', '{'), key(']', '}'), key('\\', '|')
    ],
    [
      key('CapsLock', '', 1.75, 'capslock'),
      key('a'), key('s'), key('d'), key('f'), key('g'), key('h'), key('j'), key('k'), key('l'),
      key(';', ':'), key("'", '"'),
      key('Enter', '', 2.25, 'enter')
    ],
    [
      key('ShiftLeft', '', 2.25, 'shift'),
      key('z'), key('x'), key('c'), key('v'), key('b'), key('n'), key('m'),
      key(',', '<'), key('.', '>'), key('/', '?'),
      key('ShiftRight', '', 2.75, 'shift')
    ],
    [
      key('ControlLeft', '', 1, 'ctrl'),
      key('MetaLeft', '', 1, 'win'),
      key('AltLeft', '', 1, 'alt'),
      key(' ', '', 6.2, 'space'),
      key('AltRight', '', 1, 'alt'),
      key('MetaRight', '', 1, 'win'),
      key('ControlRight', '', 1, 'ctrl')
    ]
  ];

  // 字符 → 键位（用于定位高亮）
  var KEY_ALIAS = {};
  // 特殊键（Tab / Shift / Enter …）→ 键位
  var NAMED_KEYS = {};

  /* ---------------- 手指分工 ---------------- */
  var FINGER_MAP = {
    '`': ['左手', '小指'], '1': ['左手', '小指'], 'q': ['左手', '小指'], 'a': ['左手', '小指'], 'z': ['左手', '小指'],
    '2': ['左手', '无名指'], 'w': ['左手', '无名指'], 's': ['左手', '无名指'], 'x': ['左手', '无名指'],
    '3': ['左手', '中指'], 'e': ['左手', '中指'], 'd': ['左手', '中指'], 'c': ['左手', '中指'],
    '4': ['左手', '食指'], '5': ['左手', '食指'], 'r': ['左手', '食指'], 't': ['左手', '食指'],
    'f': ['左手', '食指'], 'g': ['左手', '食指'], 'v': ['左手', '食指'], 'b': ['左手', '食指'],
    ' ': ['拇指', ''],
    Tab: ['左手', '小指'],
    Shift: ['左手', '小指'],
    Enter: ['右手', '小指'],
    Backspace: ['右手', '小指'],
    '6': ['右手', '食指'], '7': ['右手', '食指'], 'y': ['右手', '食指'], 'u': ['右手', '食指'],
    'h': ['右手', '食指'], 'j': ['右手', '食指'], 'n': ['右手', '食指'], 'm': ['右手', '食指'],
    '8': ['右手', '中指'], 'i': ['右手', '中指'], 'k': ['右手', '中指'], ',': ['右手', '中指'],
    '9': ['右手', '无名指'], 'o': ['右手', '无名指'], 'l': ['右手', '无名指'], '.': ['右手', '无名指'],
    '0': ['右手', '小指'], '-': ['右手', '小指'], '=': ['右手', '小指'], 'p': ['右手', '小指'],
    '[': ['右手', '小指'], ']': ['右手', '小指'], '\\': ['右手', '小指'], ';': ['右手', '小指'],
    "'": ['右手', '小指'], '/': ['右手', '小指']
  };

  // Shift 上档字符 → 基础键：指法沿用基础键，提示中额外显示 Shift 组合
  var SHIFTED_CHARS = {
    '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
    '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-',
    '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'",
    '<': ',', '>': '.', '?': '/'
  };

  Object.keys(SHIFTED_CHARS).forEach(function (shifted) {
    var base = SHIFTED_CHARS[shifted];
    if (FINGER_MAP[base]) FINGER_MAP[shifted] = FINGER_MAP[base];
  });

  /* ---------------- 状态 ---------------- */
  var state = {
    drillIndex: 0,
    text: '',
    chars: [],
    unitTokens: [],
    tokens: [],
    pos: 0,             // 下一个待输入字符的下标
    typedCh: [],        // 每个位置最终输入的字符（null 表示尚未输入或被回退）
    typedOk: [],        // 每个位置最终是对是错（true / false / null）
    totalKeys: 0,       // 已填入的位置数
    correctKeys: 0,     // 其中正确的位置数
    stars: 0,           // 已点亮的星星（本次练习内只升不降）
    combo: 0,           // 当前连对
    maxCombo: 0,        // 本次最长连对
    cheerTimer: null,

    started: false,
    finished: false,
    paused: false,
    startAt: 0,
    elapsedMs: 0,       // 已累计用时（不含暂停）
    timerId: null,
    runId: 0,
    hintOn: true,
    soundOn: true
  };

  /* ---------------- 按键音（Web Audio 合成，无需音频文件） ---------------- */
  var audioCtx = null;
  var audioMaster = null;
  var noiseBuffer = null;

  // 浏览器要求首次发声必须发生在用户手势里，键盘按下即为手势
  function ensureAudio() {
    if (!state.soundOn) return null;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;

      if (!audioCtx) {
        audioCtx = new Ctx();

        // 总音量：保留一点余量，避免“哒”和“嗒”叠加时爆音
        audioMaster = audioCtx.createGain();
        audioMaster.gain.value = 0.8;
        audioMaster.connect(audioCtx.destination);

        // 预先造一小段白噪声，用来做键帽敲击的清脆瞬态
        var len = Math.floor(audioCtx.sampleRate * 0.08);
        noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        var data = noiseBuffer.getChannelData(0);
        for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      }

      if (audioCtx.state === 'suspended' && audioCtx.resume) audioCtx.resume();
      return audioCtx;
    } catch (err) {
      return null;
    }
  }

  // 振荡器音体：给出“嗒”的音高与余韵
  function tone(fromFreq, toFreq, duration, volume, wave) {
    var ctx = ensureAudio();
    if (!ctx || !audioMaster) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = wave || 'triangle';
      osc.frequency.setValueAtTime(fromFreq, now);
      osc.frequency.exponentialRampToValueAtTime(toFreq, now + duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(audioMaster);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (err) {
      /* 音频不可用时静默跳过，不影响打字 */
    }
  }

  // 噪声瞬态：机械键盘那种“哒”的起音，比纯正弦更容易被听清
  function noiseTick(duration, volume, filterType, freq) {
    var ctx = ensureAudio();
    if (!ctx || !audioMaster || !noiseBuffer) return;
    try {
      var now = ctx.currentTime;
      var src = ctx.createBufferSource();
      src.buffer = noiseBuffer;

      var filter = ctx.createBiquadFilter();
      filter.type = filterType || 'highpass';
      filter.frequency.setValueAtTime(freq || 1500, now);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(audioMaster);
      src.start(now);
      src.stop(now + duration + 0.01);
    } catch (err) {
      /* 音频不可用时静默跳过，不影响打字 */
    }
  }

  // kind: correct 正确字符 / wrong 按错 / back 退格
  function playSound(kind) {
    if (!state.soundOn) return;
    if (kind === 'correct') {
      // 清脆的敲击声：高频瞬态 + 中频音体，音量比上一版提高，确保听得清
      noiseTick(0.045, 0.55, 'highpass', 1400);
      tone(780, 520, 0.075, 0.3, 'triangle');
    } else if (kind === 'wrong') {
      // 按错：低而短的一声，听得出来但依然温和
      tone(245, 175, 0.14, 0.24, 'sine');
      noiseTick(0.035, 0.12, 'lowpass', 800);
    } else if (kind === 'win') {
      // 完成小号角：C5-E5-G5-C6 快速上行，外加一点高频闪光
      var notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach(function (freq, i) {
        setTimeout(function () {
          tone(freq, freq * 1.002, 0.24, 0.16, 'triangle');
        }, i * 105);
      });
      noiseTick(0.16, 0.08, 'highpass', 2400);
    } else if (kind === 'back') {
      noiseTick(0.032, 0.24, 'highpass', 1000);
      tone(480, 360, 0.055, 0.16, 'triangle');
    }
  }

  function readSoundPref() {
    try {
      var v = window.localStorage.getItem('daziya.soundOn');
      return v === null ? true : v === '1';
    } catch (e) {
      return true;
    }
  }

  function writeSoundPref(on) {
    try {
      window.localStorage.setItem('daziya.soundOn', on ? '1' : '0');
    } catch (e) {
      /* 本地存储不可用时忽略 */
    }
  }

  /* ---------------- 键盘渲染 ---------------- */
  function buildKeyboard() {
    var frag = document.createDocumentFragment();

    KEY_ROWS.forEach(function (row) {
      var rowEl = document.createElement('div');
      rowEl.className = 'kb-row';

      row.forEach(function (k) {
        var keyEl = document.createElement('div');
        keyEl.className = 'key';
        if (k.base === ' ') {
          keyEl.classList.add('key--space');
        } else if (k.grow !== 1) {
          keyEl.classList.add('key--w' + String(k.grow).replace('.', ''));
        }
        keyEl.dataset.key = k.base;
        NAMED_KEYS[k.base] = keyEl;
        if (k.label) {
          keyEl.classList.add('key--blank');
          keyEl.textContent = k.label;
        } else if (k.top) {
          keyEl.innerHTML =
            '<span class="key__top">' + escapeHtml(k.top) + '</span>' +
            '<span class="key__label">' + escapeHtml(k.base) + '</span>';
        } else {
          keyEl.innerHTML = '<span class="key__label">' + escapeHtml(k.base.toUpperCase()) + '</span>';
        }

        if (k.base.length === 1) {
          KEY_ALIAS[k.base] = keyEl;
          if (k.top) KEY_ALIAS[k.top] = keyEl;
        }
        rowEl.appendChild(keyEl);
      });

      frag.appendChild(rowEl);
    });

    keyboardEl.innerHTML = '';
    keyboardEl.appendChild(frag);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var NAMED_KEY_ALIAS = {
    Tab: 'Tab',
    Shift: 'ShiftLeft',
    Enter: 'Enter',
    Backspace: 'Backspace',
    CapsLock: 'CapsLock'
  };

  function keyElementFor(ch) {
    if (!ch) return null;
    if (NAMED_KEY_ALIAS[ch]) return NAMED_KEYS[NAMED_KEY_ALIAS[ch]] || null;
    var lower = ch.toLowerCase();
    if (KEY_ALIAS[lower]) return KEY_ALIAS[lower];
    if (ch === ' ' && KEY_ALIAS[' ']) return KEY_ALIAS[' '];
    return null;
  }

  /* ---------------- 关卡 ---------------- */
  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function levelLabel(drill) {
    return drill.n ? '关卡 ' + pad2(drill.n) + ' · ' + drill.name : drill.name;
  }

  // 关卡面板：按章节分组列出全部关卡
  function renderLevels() {
    var groups = {};
    window.DRILLS.forEach(function (d, i) {
      var key = d.section || 'custom';
      if (!groups[key]) groups[key] = [];
      groups[key].push({ d: d, i: i });
    });

    levelsEl.innerHTML = '';
    var count = 0;

    function buildGrid(list, isCustom) {
      var grid = document.createElement('div');
      grid.className = 'levels__grid';
      list.forEach(function (item) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'level-chip' +
          (isCustom ? ' level-chip--custom' : ' level-chip--' + item.d.kind) +
          (item.i === state.drillIndex ? ' level-chip--current' : '');
        chip.dataset.index = String(item.i);
        if (isCustom) {
          chip.textContent = item.d.name;
        } else {
          chip.innerHTML =
            '<span class="level-chip__num">' + pad2(item.d.n) + '</span>' +
            '<span class="level-chip__name">' + escapeHtml(item.d.name) + '</span>';
        }
        grid.appendChild(chip);
        count += 1;
      });
      return grid;
    }

    (window.DRILL_SECTIONS || []).forEach(function (sec) {
      var list = groups[sec.id];
      if (!list || !list.length) return;

      var block = document.createElement('section');
      block.className = 'levels__section';
      var head = document.createElement('div');
      head.className = 'levels__section-head';
      head.innerHTML = '<strong>' + escapeHtml(sec.title) + '</strong>' +
        '<span>' + escapeHtml(sec.hint || '') + '</span>' +
        '<em>' + list.length + ' 关</em>';
      block.appendChild(head);
      block.appendChild(buildGrid(list, false));
      levelsEl.appendChild(block);
    });

    if (groups.custom && groups.custom.length) {
      var block = document.createElement('section');
      block.className = 'levels__section';
      var head = document.createElement('div');
      head.className = 'levels__section-head';
      head.innerHTML = '<strong>自定义</strong><span>粘贴任意英文 / 数字 / 符号文本</span>';
      block.appendChild(head);
      block.appendChild(buildGrid(groups.custom, true));
      levelsEl.appendChild(block);
    }

    levelCount.textContent = String(count);

    var current = levelsEl.querySelector('.level-chip--current');
    if (current && current.scrollIntoView) {
      current.scrollIntoView({ block: 'nearest' });
    }
  }

  function loadDrill(index) {
    var drill = window.DRILLS[index];
    if (!drill) return;

    state.drillIndex = index;
    state.unitTokens = drill.tokens
      ? drill.tokens.slice()
      : String(drill.chars || '').split('');
    state.text = state.unitTokens.join('');
    crumbLevel.textContent = levelLabel(drill);
    stageTip.textContent = drill.note || '按任意字母键开始计时';
    renderStage();
    resetRun();
    if (!levelOverlay.hidden) renderLevels();
  }

  /* ---------------- 文本渲染 ---------------- */
  function renderStage() {
    var frag = document.createDocumentFragment();
    state.chars = state.unitTokens.slice();
    state.tokens = [];
    // 逐位记录最终输入结果，供回退与“只看最终文本”的准确率结算使用
    state.typedCh = new Array(state.chars.length).fill(null);
    state.typedOk = new Array(state.chars.length).fill(null);

    state.chars.forEach(function (ch, i) {
      var token = document.createElement('div');
      token.className = 'token';
      token.dataset.index = String(i);
      if (ch === ' ') token.classList.add('token--space');
      if (ch.length > 1) token.classList.add('token--wide');
      var inner = document.createElement('span');
      inner.textContent = ch === ' ' ? '' : ch;
      token.appendChild(inner);
      frag.appendChild(token);
      state.tokens.push(token);
    });

    stage.innerHTML = '';
    stage.appendChild(frag);
    stage.scrollTop = 0;
  }

  /* ---------------- 运行态重置 ---------------- */
  function resetRun() {
    clearInterval(state.timerId);
    state.timerId = null;
    state.runId += 1;

    state.pos = 0;
    state.totalKeys = 0;
    state.correctKeys = 0;
    for (var i = 0; i < state.typedCh.length; i++) {
      state.typedCh[i] = null;
      state.typedOk[i] = null;
    }
    
    state.stars = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.finalStars = 0;
    clearTimeout(state.cheerTimer);

    state.started = false;
    state.finished = false;
    state.paused = false;
    state.startAt = 0;
    state.elapsedMs = 0;

    state.tokens.forEach(function (t) {
      t.classList.remove('token--active', 'token--right', 'token--error', 'token--back', 'token--wrong');
    });
    Array.prototype.forEach.call(keyboardEl.querySelectorAll('.key'), function (k) {
      k.classList.remove('key--target', 'key--wrong', 'key--pressed');
    });

    if (state.tokens.length) {
      state.tokens[0].classList.add('token--active');
    }

    pauseOverlay.hidden = true;
    resultOverlay.hidden = true;
    btnPause.setAttribute('aria-pressed', 'false');
    btnPause.textContent = '暂停';

    updateProgress();
    updateStats();
    updateHint();
    setCheer('准备好了就按第一个键吧～', '');
    stage.scrollTop = 0;
  }

  /* ---------------- 计时与统计 ---------------- */
  function startTimer() {
    state.started = true;
    state.startAt = performance.now();
    state.timerId = setInterval(function () {
      updateStats();
    }, 200);
  }

  function elapsedMs() {
    if (!state.started) return 0;
    if (state.paused) return state.elapsedMs;
    return state.elapsedMs + (performance.now() - state.startAt);
  }

  /* ------------- 儿童激励指标：星星 + 连对 ------------- */
  var STAR_MIN_KEYS = 30;                       // 样本下限：不足 30 次击键时按 30 计，避免第一下就满星
  // 5★ ~ 1★ 的“稳妥准确率”门槛：每 20 个百分点一颗星，准确率达到 80% 即满 5 星
  // 80%+ → 5★，60-79% → 4★，40-59% → 3★，20-39% → 2★，20% 以下 → 1★
  var STAR_THRESHOLDS = [80, 60, 40, 20, 0];

  // 已填位置数（回退过的位置不计）
  function filledCount() {
    var n = 0;
    for (var i = 0; i < state.typedOk.length; i++) {
      if (state.typedOk[i] !== null) n += 1;
    }
    return n;
  }

  // 已填位置中正确的个数
  function correctCount() {
    var n = 0;
    for (var i = 0; i < state.typedOk.length; i++) {
      if (state.typedOk[i] === true) n += 1;
    }
    return n;
  }

  // 最终准确率：只看整篇最终留下的文本，中途打错又退掉的不计入
  function accuracyPercent() {
    var total = state.chars.length;
    return total > 0 ? (correctCount() / total) * 100 : 0;
  }

  // 样本下限：取 30 与“本关输入单元数”中较小的一个，
  // 这样短关卡（例如只有 19 个字符的学习关）也能靠高准确率拿到 5 星，
  // 同时仍能避免第一下就满星。
  function sampleFloor() {
    return Math.min(STAR_MIN_KEYS, Math.max(state.chars.length, 1));
  }

  // 练习过程中的即时正确率：只看已经填上的位置，分母不低于样本下限
  function liveAccuracy() {
    var denom = Math.max(filledCount(), sampleFloor());
    return denom > 0 ? (correctCount() / denom) * 100 : 0;
  }

  function starLevel(pct) {
    for (var i = 0; i < STAR_THRESHOLDS.length; i++) {
      if (pct >= STAR_THRESHOLDS[i]) return STAR_THRESHOLDS.length - i;
    }
    return 0;
  }

  // 星星只升不降：按错只会让星星停在原处，不会减少
  function evaluateStars(percent) {
    var level = starLevel(typeof percent === 'number' ? percent : liveAccuracy());
    if (level <= state.stars) return false;

    var from = state.stars;
    state.stars = level;
    renderStars(level, from);
    showStarToast(level - from);
    setCheer(level >= 4 ? '哇，' + level + ' 颗星亮起来了，你真棒！' : '星星又亮了一颗，继续加油～', 'praise');
    return true;
  }

  function renderStars(level, animateFrom) {
    var starEls = starsEl.querySelectorAll('.star');
    Array.prototype.forEach.call(starEls, function (el, i) {
      var on = i < level;
      el.classList.toggle('star--on', on);
      if (on && typeof animateFrom === 'number' && i >= animateFrom) {
        el.classList.remove('star--pop');
        void el.offsetWidth;
        el.classList.add('star--pop');
      }
    });
    starsEl.setAttribute('aria-label', '目前获得 ' + level + ' 颗星，共 5 颗');
  }

  function showStarToast(n) {
    var host = starsEl.parentElement;
    if (!host) return;

    // 同时只保留一条提示，避免连续升星时提示叠在一起
    Array.prototype.forEach.call(host.querySelectorAll('.star-toast'), function (old) {
      if (old.parentNode) old.parentNode.removeChild(old);
    });

    var toast = document.createElement('span');
    toast.className = 'star-toast';
    toast.textContent = state.stars >= 5 ? '满星！' : '+' + (n || 1) + ' ★';
    host.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 900);
  }

  function setCheer(text, tone) {
    if (cheerEl.textContent === text) return;
    cheerEl.textContent = text;
    cheerEl.className = 'cheer' + (tone ? ' cheer--' + tone : '');
    cheerEl.classList.remove('cheer--pulse');
    void cheerEl.offsetWidth;
    cheerEl.classList.add('cheer--pulse');
  }

  function comboCheer() {
    var c = state.combo;
    if (c >= 15) return '哇！连对 ' + c + ' 个，你太厉害了！';
    if (c >= 10) return '真棒！已经连对 ' + c + ' 个啦！';
    if (c >= 5) return '很好！连续对了 ' + c + ' 个～';
    if (c >= 2) return '继续保持，已经连对 ' + c + ' 个！';
    if (state.stars >= 3) return '你越来越稳了，星星在为你亮着～';
    return '一个一个来，你可以的～';
  }

  // 按错时给温柔提示，1.8 秒后回到常规鼓励语
  function remindGentle() {
    setCheer('没关系，按删除键可以回去改掉它～', 'gentle');
    clearTimeout(state.cheerTimer);
    state.cheerTimer = setTimeout(function () {
      if (state.finished) return;
      setCheer(comboCheer(), state.combo >= 5 ? 'praise' : '');
    }, 1800);
  }

  // 每个关卡单独记录历史最好星星，避免短关卡的成绩影响其他关卡
  function bestStarsKey() {
    var drill = window.DRILLS[state.drillIndex];
    if (!drill) return 'daziya.bestStars.unknown';
    if (drill.id === 'custom') {
      // 自定义文本按内容摘要区分，换了文本就重新记录
      var text = drill.tokens ? drill.tokens.join('') : '';
      var hash = 0;
      for (var i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) | 0;
      }
      return 'daziya.bestStars.custom.' + (hash >>> 0).toString(36);
    }
    return 'daziya.bestStars.' + (drill.n || drill.id || state.drillIndex);
  }

  function readBestStars() {
    try {
      var v = parseInt(window.localStorage.getItem(bestStarsKey()) || '0', 10);
      return isNaN(v) ? 0 : v;
    } catch (e) {
      return 0;
    }
  }

  function writeBestStars(v) {
    try {
      window.localStorage.setItem(bestStarsKey(), String(v));
    } catch (e) {
      /* 本地存储不可用时静默跳过，不影响练习 */
    }
  }

  function updateStats() {
    var ms = elapsedMs();
    var seconds = Math.floor(ms / 1000);
    var minutes = ms / 60000;

    var speed = minutes > 0.008 ? Math.round(state.correctKeys / minutes) : 0;
    var level = state.finished ? state.finalStars : state.stars;
    var combo = state.finished ? state.maxCombo : state.combo;

    statSpeed.textContent = String(state.finished ? state.finalSpeed : speed);
    statTime.textContent = String(state.finished ? state.finalSeconds : seconds);
    statCombo.textContent = String(combo);
    comboChip.classList.toggle('combo--hot', combo >= 5);
    renderStars(level);
  }

  function updateProgress() {
    var pct = state.chars.length
      ? Math.round((state.pos / state.chars.length) * 100)
      : 0;
    progressFill.style.width = pct + '%';
    progressEl.setAttribute('aria-valuenow', String(pct));
  }

  function updateHint() {
    var ch = state.chars[state.pos];
    if (state.finished || ch === undefined) {
      fingerHint.style.visibility = 'hidden';
      return;
    }
    fingerHint.style.visibility = 'visible';

    var info = FINGER_MAP[ch] || FINGER_MAP[ch.toLowerCase()] || ['键盘', '任意手指'];
    fingerHand.textContent = info[0];
    fingerName.textContent = info[1] || '';
    if (SHIFTED_CHARS[ch]) {
      // 上档字符：提示具体要按住 Shift 再按哪个基础键
      fingerKey.textContent = 'Shift + ' + SHIFTED_CHARS[ch];
    } else {
      fingerKey.textContent = ch === ' ' ? 'Space' : (ch.length > 1 ? ch : ch.toUpperCase());
    }

    Array.prototype.forEach.call(keyboardEl.querySelectorAll('.key--target'), function (k) {
      k.classList.remove('key--target');
    });
    var keyEl = keyElementFor(ch);
    if (keyEl) keyEl.classList.add('key--target');
  }

  /* ---------------- 输入处理 ---------------- */
  // 输入单元比对：普通字符逐字比较，Tab / Shift 等特殊键比较键名
  function matchesExpected(expected, key) {
    if (key === expected) return true;
    if (expected === 'Shift' && (key === 'ShiftLeft' || key === 'ShiftRight')) return true;
    return false;
  }

  // 按位置统计“已填入 / 其中正确”的数量
  function syncCounts() {
    state.totalKeys = filledCount();
    state.correctKeys = correctCount();
  }

  // 输入的字符无论对错都会填到当前位置并前移，错的位置保留红色标记
  function handleCharKey(ch) {
    if (state.finished || state.paused) return;

    if (!state.started) startTimer();

    var expected = state.chars[state.pos];
    if (expected === undefined) return;

    var ok = matchesExpected(expected, ch);
    var token = state.tokens[state.pos];
    var pressedKey = keyElementFor(ch);
    var runId = state.runId;

    // 记录这一位置的最终结果，回退时会被清除
    state.typedCh[state.pos] = ch;
    state.typedOk[state.pos] = ok;

    token.classList.remove('token--active', 'token--error', 'token--back', 'token--right', 'token--wrong');

    if (ok) {
      state.combo += 1;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      token.classList.add('token--right');
      if (pressedKey) flashKey(pressedKey);
      playSound('correct');
    } else {
      // 打错：这一格立即标红，光标照常前进到下一个位置
      state.combo = 0;
      token.classList.add('token--wrong');
      if (pressedKey) flashWrongKey(pressedKey, runId);
      playSound('wrong');
      remindGentle();
    }

    syncCounts();

    state.pos += 1;
    updateProgress();

    // 先结算星星再判断是否通关，避免最后一个字符跨过门槛却升不上星
    var starUpgraded = evaluateStars();

    if (state.pos >= state.chars.length) {
      // 最后一个字符打对了才结算；打错时停在文末，等用户退格改对，
      // 避免手滑打错最后一个字就直接出结果、再也改不了。
      if (ok) {
        finish();
      } else {
        clearTimeout(state.cheerTimer);
        setCheer('最后一个字打错啦，按删除键回去改一下吧～', 'gentle');
        updateHint();
        updateStats();
      }
      return;
    }

    state.tokens[state.pos].classList.add('token--active');
    scrollActiveIntoView();
    updateHint();
    if (ok && !starUpgraded) {
      setCheer(comboCheer(), state.combo >= 5 ? 'praise' : '');
    }
    updateStats();
  }

  // 按错键的红色提示：闪现约 0.45 秒后自动褪回常态，不长期停留
  function flashWrongKey(keyEl, runId) {
    if (keyEl._wrongTimer) clearTimeout(keyEl._wrongTimer);
    keyEl.classList.remove('key--wrong');
    void keyEl.offsetWidth;
    keyEl.classList.add('key--wrong');

    keyEl._wrongTimer = setTimeout(function () {
      keyEl._wrongTimer = null;
      if (state.runId !== runId) return;
      keyEl.classList.remove('key--wrong');
    }, 450);
  }

  function flashKey(keyEl) {
    keyEl.classList.add('key--pressed');
    setTimeout(function () {
      keyEl.classList.remove('key--pressed');
    }, 110);
  }

  // 退格：退回上一个位置并清掉那里的结果，可以重新输入，最终结算不受影响
  function handleBackspace() {
    if (state.finished || state.paused || state.pos === 0) return;

    var idx = state.pos - 1;
    var runId = state.runId;
    var target = state.tokens[idx];
    var current = state.tokens[state.pos];

    if (current) current.classList.remove('token--active');
    playSound('back');

    state.typedCh[idx] = null;
    state.typedOk[idx] = null;
    state.pos = idx;
    syncCounts();

    target.classList.remove('token--right', 'token--wrong', 'token--error', 'token--back', 'token--active');
    void target.offsetWidth;
    target.classList.add('token--back', 'token--active');

    setTimeout(function () {
      if (state.runId !== runId) return;
      target.classList.remove('token--back');
    }, 260);

    scrollActiveIntoView();
    updateProgress();
    updateHint();
    updateStats();
  }

  function scrollActiveIntoView() {
    var token = state.tokens[state.pos];
    if (!token) return;
    var top = token.offsetTop;
    var bottom = top + token.offsetHeight;
    var viewTop = stage.scrollTop;
    var viewBottom = viewTop + stage.clientHeight;
    if (bottom > viewBottom) {
      stage.scrollTop = bottom - stage.clientHeight + 2;
    } else if (top < viewTop) {
      stage.scrollTop = top - 2;
    }
  }

  /* ---------------- 完成 ---------------- */
  // 完成时的鼓励语：按星星颗数给不同说法，没有一句是批评
  var RESULT_WORDS = {
    5: '五颗星全亮啦！又稳又准，太厉害了！',
    4: '四颗星到手，离满星只差一点点！',
    3: '三颗星，稳稳定定的进步！',
    2: '两颗星，再多一点细心就会更亮！',
    1: '点亮了一颗星，下次会更多！',
    0: '认真打完就很棒，星星会越来越亮！'
  };

  // 完成时的彩纸：在结果卡片里撒一把，播完自动清理
  function celebrateResult() {
    var layer = document.getElementById('resultConfetti');
    if (!layer) return;
    layer.innerHTML = '';
    var colors = ['var(--accent)', 'var(--warm)', 'var(--star-on)', 'var(--ok-bg)'];
    // 铺满整个视口宽度，模拟从屏幕顶端撒下
    for (var i = 0; i < 44; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti' + (Math.random() < 0.3 ? ' confetti--round' : '');
      piece.style.left = (Math.random() * 100).toFixed(2) + 'vw';
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.setProperty('--drift', (Math.random() * 90 - 45).toFixed(0) + 'px');
      piece.style.setProperty('--spin', (Math.random() > 0.5 ? 1 : -1) * (260 + Math.random() * 300) + 'deg');
      piece.style.width = (6 + Math.random() * 6).toFixed(1) + 'px';
      if (!piece.classList.contains('confetti--round')) {
        piece.style.height = (10 + Math.random() * 8).toFixed(1) + 'px';
      }
      piece.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
      piece.style.animationDuration = (1.8 + Math.random() * 1.1).toFixed(2) + 's';
      layer.appendChild(piece);
    }
    setTimeout(function () {
      layer.innerHTML = '';
    }, 3400);
  }

  function finish() {
    state.finished = true;
    clearInterval(state.timerId);
    state.timerId = null;
    clearTimeout(state.cheerTimer);

    var ms = elapsedMs();
    var minutes = ms / 60000;
    state.finalSpeed = minutes > 0 ? Math.round(state.correctKeys / minutes) : 0;
    // 最终准确率只看打完后的整篇文本，中途打错又退掉的不计入
    state.finalAccuracy = Math.round(accuracyPercent());
    // 通关时按最终文本的准确率重新判定星级，保证“80% 才是 5 星”在结果页成立
    state.stars = starLevel(state.finalAccuracy);
    state.finalStars = state.stars;
    state.finalSeconds = Math.max(1, Math.round(ms / 1000));

    progressFill.style.width = '100%';
    progressEl.setAttribute('aria-valuenow', '100');
    fingerHint.style.visibility = 'hidden';
    updateStats();

    // 完成弹层以星星为主，数字为辅
    var resultStars = resultStarRow.querySelectorAll('.star');
    Array.prototype.forEach.call(resultStars, function (el, i) {
      el.classList.toggle('star--on', i < state.finalStars);
    });
    resultStarRow.setAttribute('aria-label', '本关获得 ' + state.finalStars + ' 颗星');

    document.getElementById('resultSpeed').textContent = String(state.finalSpeed);
    document.getElementById('resultCombo').textContent = String(state.maxCombo);
    document.getElementById('resultAccuracy').textContent = state.finalAccuracy + '%';
    document.getElementById('resultTime').textContent = String(state.finalSeconds);
    document.getElementById('resultDesc').textContent = RESULT_WORDS[state.finalStars] || RESULT_WORDS[0];

    var best = readBestStars();
    if (state.finalStars > best) {
      best = state.finalStars;
      writeBestStars(best);
    }
    document.getElementById('resultExtra').textContent = '本关历史最好：' + best + ' 颗星' +
      (state.finalStars >= 5 ? '（满星成就！）' : '');

    setCheer('完成啦！' + (state.finalStars > 0 ? '你拿到了 ' + state.finalStars + ' 颗星～' : '慢慢来，星星会越来越多的～'), 'praise');
    celebrateResult();
    playSound('win');
    resultOverlay.hidden = false;
  }

  /* ---------------- 暂停 ---------------- */
  function togglePause(force) {
    if (state.finished || !state.started) {
      if (!state.started) {
        stageTip.textContent = '先按任意字母键开始，再使用暂停。';
      }
      return;
    }

    var next = typeof force === 'boolean' ? force : !state.paused;
    if (next === state.paused) return;

    if (next) {
      state.elapsedMs += performance.now() - state.startAt;
      state.paused = true;
      clearInterval(state.timerId);
      state.timerId = null;
      pauseOverlay.hidden = false;
      btnPause.textContent = '继续';
      btnPause.setAttribute('aria-pressed', 'true');
    } else {
      state.paused = false;
      state.startAt = performance.now();
      state.timerId = setInterval(function () {
        updateStats();
      }, 200);
      pauseOverlay.hidden = true;
      btnPause.textContent = '暂停';
      btnPause.setAttribute('aria-pressed', 'false');
      stage.focus({ preventScroll: true });
    }
  }

  /* ---------------- 配色预设 ---------------- */
  var PALETTES = [
    { id: 'mist', name: '雾紫奶油', sw: { bg: '#fff9f5', accent: '#7c5cc4', header: '#ece0ff' } },
    { id: 'sakura', name: '樱花粉', sw: { bg: '#fff7f9', accent: '#c2255c', header: '#ffe1ec' } },
    { id: 'mint', name: '薄荷青', sw: { bg: '#f5fbfa', accent: '#0f766e', header: '#dcf4ef' } },
    { id: 'peach', name: '蜜桃暖阳', sw: { bg: '#fffaf3', accent: '#c05621', header: '#ffe8d3' } },
    { id: 'berry', name: '莓果紫', sw: { bg: '#fbf6fa', accent: '#9d3b6b', header: '#f4e3ef' } }
  ];

  var currentPalette = 'mist';

  function renderPaletteList() {
    if (!paletteList) return;
    paletteList.innerHTML = '';
    PALETTES.forEach(function (item) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-item';
      btn.dataset.id = item.id;
      btn.setAttribute('aria-pressed', item.id === currentPalette ? 'true' : 'false');
      btn.innerHTML =
        '<span class="palette-swatch" style="--sw-bg:' + item.sw.bg + ';--sw-accent:' + item.sw.accent + ';--sw-header:' + item.sw.header + '"></span>' +
        '<span class="palette-name">' + item.name + '</span>';
      paletteList.appendChild(btn);
    });
  }

  function applyPalette(id, persist) {
    if (!PALETTES.some(function (p) { return p.id === id; })) return;
    currentPalette = id;
    document.documentElement.dataset.palette = id;
    if (persist) writePref('daziya.palette', id);
    Array.prototype.forEach.call(paletteList ? paletteList.querySelectorAll('.palette-item') : [], function (el) {
      el.setAttribute('aria-pressed', el.dataset.id === id ? 'true' : 'false');
    });
  }

  function readPref(key, fallback) {
    try {
      var v = window.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function writePref(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* 本地存储不可用时忽略 */
    }
  }

  /* ---------------- 事件绑定 ---------------- */
  // 记录当前按住的键，用于屏蔽长按产生的自动重复（不同浏览器 e.repeat 支持不一致）
  var heldKeys = Object.create(null);

  function clearHeldKeys() {
    heldKeys = Object.create(null);
  }

  function isCharKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (e.key === ' ') return true;
    return e.key.length === 1;
  }

  document.addEventListener('keydown', function (e) {
    // 长按只算一次：系统自动重复的 keydown 直接丢弃
    var keyId = e.code || e.key;
    var alreadyHeld = heldKeys[keyId] === true;
    heldKeys[keyId] = true;

    if (e.repeat || alreadyHeld) {
      // 仍要拦住空格/退格/字符键的默认行为，避免页面滚动或字符被写入
      if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab' || isCharKey(e)) {
        e.preventDefault();
      }
      return;
    }

    if (!paletteOverlay.hidden) {
      if (e.key === 'Escape') {
        paletteOverlay.hidden = true;
        stage.focus({ preventScroll: true });
      }
      return;
    }

    if (!customOverlay.hidden) return;

    if (!levelOverlay.hidden) {
      if (e.key === 'Escape') {
        levelOverlay.hidden = true;
        stage.focus({ preventScroll: true });
      }
      return;
    }

    if (e.key === 'Escape') {
      if (!pauseOverlay.hidden) togglePause(false);
      return;
    }

    if (!pauseOverlay.hidden) {
      if (e.key === ' ') {
        e.preventDefault();
        togglePause(false);
      }
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }

    // Tab：练习页里一律阻止焦点跳走，只有当前关卡要求时才计为输入
    if (e.key === 'Tab') {
      e.preventDefault();
      if (state.chars[state.pos] === 'Tab') handleCharKey('Tab');
      return;
    }

    // Shift：只在“Shift 键”关卡里计为输入，其他关卡忽略，避免提示刷错
    if (e.key === 'Shift') {
      if (state.chars[state.pos] === 'Shift') handleCharKey('Shift');
      return;
    }

    if (isCharKey(e)) {
      e.preventDefault();
      handleCharKey(e.key);
    }
  });

  document.addEventListener('keyup', function (e) {
    delete heldKeys[e.code || e.key];
    var keyEl = keyElementFor(e.key);
    if (keyEl) keyEl.classList.remove('key--pressed');
  });

  // 失焦时清空按住状态，避免"卡键"导致之后按同一个键不响应
  window.addEventListener('blur', clearHeldKeys);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearHeldKeys();
  });

  btnPause.addEventListener('click', function () {
    togglePause();
  });

  btnResume.addEventListener('click', function () {
    togglePause(false);
  });

  btnRestart.addEventListener('click', function () {
    resetRun();
    stage.focus({ preventScroll: true });
  });

  btnBrand.addEventListener('click', function () {
    resetRun();
    stage.focus({ preventScroll: true });
  });

  btnRetry.addEventListener('click', function () {
    resetRun();
    stage.focus({ preventScroll: true });
  });

  btnNext.addEventListener('click', function () {
    var next = (state.drillIndex + 1) % window.DRILLS.length;
    loadDrill(next);
    stage.focus({ preventScroll: true });
  });

  btnSound.addEventListener('click', function () {
    state.soundOn = !state.soundOn;
    btnSound.setAttribute('aria-pressed', state.soundOn ? 'true' : 'false');
    writeSoundPref(state.soundOn);
    if (state.soundOn) {
      // 打开时给一声试听，方便确认音量和音色
      playSound('correct');
    }
  });

  btnHint.addEventListener('click', function () {
    state.hintOn = !state.hintOn;
    btnHint.setAttribute('aria-pressed', state.hintOn ? 'true' : 'false');
    keyboardEl.dataset.hint = state.hintOn ? 'on' : 'off';
    fingerHint.style.display = state.hintOn ? '' : 'none';
  });

  btnTheme.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    btnTheme.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    writePref('daziya.theme', next);
  });

  btnPalette.addEventListener('click', function () {
    renderPaletteList();
    paletteOverlay.hidden = false;
  });

  btnPaletteClose.addEventListener('click', function () {
    paletteOverlay.hidden = true;
    stage.focus({ preventScroll: true });
  });

  paletteList.addEventListener('click', function (e) {
    var item = e.target.closest ? e.target.closest('.palette-item') : null;
    if (!item) return;
    applyPalette(item.dataset.id, true);
    // 选中即应用并收起面板，不用再点“关闭”
    paletteOverlay.hidden = true;
    stage.focus({ preventScroll: true });
  });

  // 点面板外的遮罩也能关闭
  paletteOverlay.addEventListener('click', function (e) {
    if (e.target === paletteOverlay) {
      paletteOverlay.hidden = true;
      stage.focus({ preventScroll: true });
    }
  });

  btnLevels.addEventListener('click', function () {
    renderLevels();
    levelOverlay.hidden = false;
  });

  btnLevelsClose.addEventListener('click', function () {
    levelOverlay.hidden = true;
    stage.focus({ preventScroll: true });
  });

  levelsEl.addEventListener('click', function (e) {
    var chip = e.target.closest ? e.target.closest('.level-chip') : null;
    if (!chip) return;
    loadDrill(Number(chip.dataset.index));
    levelOverlay.hidden = true;
    stage.focus({ preventScroll: true });
  });

  btnCustom.addEventListener('click', function () {
    customOverlay.hidden = false;
    customText.focus();
  });

  btnCustomCancel.addEventListener('click', function () {
    customOverlay.hidden = true;
    stage.focus({ preventScroll: true });
  });

  btnCustomApply.addEventListener('click', function () {
    var raw = customText.value.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ');
    // 仅保留可映射到物理键盘的 ASCII 可打印字符
    var cleaned = raw.split('').filter(function (c) {
      var code = c.charCodeAt(0);
      return code >= 32 && code <= 126;
    }).join('').trim();

    if (cleaned.length < 5) {
      alert('请至少输入 5 个可打印的英文/数字/符号字符。');
      return;
    }

    var drill = {
      id: 'custom',
      n: 0,
      name: '自定义文本',
      kind: 'custom',
      section: 'custom',
      tokens: cleaned.split(''),
      chars: cleaned,
      note: '自定义文本节奏练习，注意保持一致的速度与准确率。'
    };

    // 覆盖已有的自定义关卡，避免列表无限增长
    var existIndex = window.DRILLS.findIndex(function (d) { return d.id === 'custom'; });
    if (existIndex >= 0) {
      window.DRILLS[existIndex] = drill;
    } else {
      window.DRILLS.push(drill);
    }

    loadDrill(window.DRILLS.findIndex(function (d) { return d.id === 'custom'; }));
    customOverlay.hidden = true;
    stage.focus({ preventScroll: true });
  });

  // 点击文本区聚焦，便于键盘输入
  stage.addEventListener('click', function () {
    stage.focus({ preventScroll: true });
  });

  /* ---------------- 初始化 ---------------- */
  applyPalette(readPref('daziya.palette', 'mist'), false);
  var savedTheme = readPref('daziya.theme', 'light');
  document.documentElement.dataset.theme = savedTheme;
  btnTheme.setAttribute('aria-pressed', savedTheme === 'dark' ? 'true' : 'false');

  buildKeyboard();
  state.soundOn = readSoundPref();
  btnSound.setAttribute('aria-pressed', state.soundOn ? 'true' : 'false');
  loadDrill(0);
  renderLevels();
  stage.focus({ preventScroll: true });
})();