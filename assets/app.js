/* ─────────────────────────────────────────────────────────
   app.js — Unada Onboarding V2 main application
   ───────────────────────────────────────────────────────── */

/* ── API Config ──────────────────────────────────────────── */
var API_URL = 'https://unada-studio-production-oxoihhrk2-youngnoh-gohs-projects.vercel.app';

/* ── State ───────────────────────────────────────────────── */
var state = {
  screenIdx: -1,   // -1=welcome, 0-30=SCREENS[], 31=generating, 32-34=reveal, 35=success
  answers: {},
  privacyChecked: false,
  isSubmitting: false,
  submitError: false,
  token: null,       // onboarding_token from URL ?token=
  tokenMissing: false,
};

/* ── Helpers ─────────────────────────────────────────────── */
function getQuestionsAnswered() {
  var count = 0;
  QUESTIONS.forEach(function(q) {
    var v = state.answers[q.key];
    if (q.type === 'slider' || q.type === 'textarea' || q.type === 'chips_fixed') {
      if (v !== undefined) count++;
    } else if (q.type === 'neighborhoods') {
      if (Array.isArray(v) && v.length > 0) count++;
    } else {
      if (v !== undefined && v !== null) count++;
    }
  });
  return count;
}

function getCurrentPart(idx) {
  if (idx < 0)   return null;
  if (idx <= 11) return 1;
  if (idx === 12) return null;
  if (idx <= 20) return 2;
  if (idx === 21) return null;
  if (idx <= 30) return 3;
  return null;
}

function isAnswered(q) {
  if (!q) return true;
  var v = state.answers[q.key];
  switch (q.type) {
    case 'slider':
    case 'textarea':
    case 'chips_fixed':
      return v !== undefined;
    case 'pills':
    case 'radio':
      return v !== undefined && v !== null;
    case 'neighborhoods':
      return Array.isArray(v) && v.length >= 1;
    case 'radio_cond': {
      if (!v) return false;
      if (q.condType === 'dogDetails' && v === 'dog') {
        return !!state.answers.petWeight;
      }
      if (q.condType === 'visaExpiry' && (v === 'workpermit' || v === 'studentvisa')) {
        return !!(state.answers.visaExpiry && state.answers.visaExpiry.length >= 4);
      }
      if (q.condType === 'contractEndDate' && v === 'contract') {
        return !!(state.answers.contractEndDate && state.answers.contractEndDate.length >= 4);
      }
      return true;
    }
    default: return true;
  }
}

function initOptionalDefaults(q) {
  if (q.type === 'slider' && state.answers[q.key] === undefined) {
    state.answers[q.key] = q.defaultVal;
  }
  if (q.type === 'textarea' && state.answers[q.key] === undefined) {
    state.answers[q.key] = '';
  }
  if (q.type === 'chips_fixed' && state.answers[q.key] === undefined) {
    state.answers[q.key] = [];
  }
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Navigation ──────────────────────────────────────────── */
function goNext() {
  var idx = state.screenIdx;

  // Welcome screen: require privacy consent
  if (idx === -1 && !state.privacyChecked) return;

  // Validate current question
  if (idx >= 0 && idx <= 30) {
    var screen = SCREENS[idx];
    if (screen.type === 'question') {
      var q = QUESTIONS[screen.qIdx];
      initOptionalDefaults(q);
      if (!isAnswered(q)) return;
    }
  }

  var next = idx + 1;

  // Fire partial saves on transition screens
  if (next === 12) { submitOnboarding('partial_1'); }
  if (next === 21) { submitOnboarding('partial_2'); }

  state.screenIdx = next;
  render();
}

function goBack() {
  if (state.screenIdx <= -1) return;
  state.screenIdx--;
  render();
}

function goExit() {
  if (confirm('Are you sure you want to exit the onboarding?')) {
    state.screenIdx = -1;
    state.answers = {};
    state.privacyChecked = false;
    render();
  }
}

function goRevealNext() {
  if (state.screenIdx < 34) {
    state.screenIdx++;
    render();
  }
}

function goRevealBack() {
  if (state.screenIdx > 32) {
    state.screenIdx--;
    render();
  }
}

/* ── Input Handlers ──────────────────────────────────────── */
/* ── Lightweight in-place update (no screen-enter replay) ─── */
// Called on within-question selection changes so the slide-in animation
// doesn't retrigger. Only updates the parts of the DOM that actually changed.
function updateSelection() {
  var idx = state.screenIdx;
  if (idx < 0 || idx > 30) { render(); return; }
  var screen = SCREENS[idx];
  if (!screen || screen.type !== 'question') { render(); return; }
  var q = QUESTIONS[screen.qIdx];

  // 1. Re-render the scroll zone (option selected states, flag boxes, cond sub-inputs)
  var scrollZone = document.querySelector('.scroll-zone');
  if (!scrollZone) { render(); return; }
  scrollZone.innerHTML =
    '<div class="category-chip">' + esc(q.category) + '</div>' +
    '<h2 class="question-text">' + esc(q.question) + '</h2>' +
    (q.hint ? '<p class="question-hint">' + esc(q.hint) + '</p>' : '') +
    renderInputComponent(q);

  // 2. Update house SVG and progress bar fill
  var answered = getQuestionsAnswered();
  var houseSvgWrap = document.querySelector('.house-svg-wrap');
  if (houseSvgWrap) houseSvgWrap.innerHTML = HOUSE.render(answered);
  var progressFill = document.querySelector('.progress-bar-fill');
  if (progressFill) progressFill.style.width = ((answered / 29) * 100) + '%';

  // 3. Swap footer (Next button enabled/disabled state may change)
  var footerEl = document.querySelector('.footer-zone');
  if (footerEl) footerEl.outerHTML = renderFooter(q, idx);
}

function selectRadio(key, value) {
  state.answers[key] = value;
  updateSelection();
}

function selectPill(key, value) {
  state.answers[key] = value;
  updateSelection();
}

function toggleChip(key, value) {
  var arr = state.answers[key] || [];
  var idx = arr.indexOf(value);
  if (idx === -1) {
    state.answers[key] = arr.concat([value]);
  } else {
    state.answers[key] = arr.filter(function(v) { return v !== value; });
  }
  updateSelection();
}

function toggleNeighborhood(value) {
  var arr = state.answers['neighborhoods'] || [];
  var idx = arr.indexOf(value);
  if (idx !== -1) {
    state.answers['neighborhoods'] = arr.filter(function(v) { return v !== value; });
  } else if (arr.length < 3) {
    state.answers['neighborhoods'] = arr.concat([value]);
  }
  updateSelection();
}

function setSlider(key, value) {
  state.answers[key] = parseInt(value, 10);
  // Only re-render the value display, not the full screen
  var q = QUESTIONS.find(function(q) { return q.key === key; });
  var el = document.querySelector('.slider-value');
  if (el && q) el.textContent = q.format(state.answers[key]);
}

function setTextarea(key, value) {
  state.answers[key] = value;
}

function setSubInput(key, value) {
  state.answers[key] = value;
  // Re-check next button state
  var screen = SCREENS[state.screenIdx];
  if (screen && screen.type === 'question') {
    var q = QUESTIONS[screen.qIdx];
    var btn = document.querySelector('.btn-next');
    if (btn) {
      if (isAnswered(q)) {
        btn.classList.remove('disabled');
        btn.disabled = false;
      } else {
        btn.classList.add('disabled');
        btn.disabled = true;
      }
    }
  }
}

function toggleWeightChip(value) {
  state.answers.petWeight = value;
  updateSelection();
}

function togglePrivacy() {
  state.privacyChecked = !state.privacyChecked;
  var checkbox = document.querySelector('.privacy-checkbox');
  var cta = document.querySelector('.btn-primary');
  if (checkbox) {
    checkbox.classList.toggle('checked', state.privacyChecked);
    checkbox.innerHTML = state.privacyChecked ? '✓' : '';
    checkbox.style.color = '#fff';
    checkbox.style.fontSize = '12px';
  }
  if (cta) {
    cta.classList.toggle('disabled', !state.privacyChecked);
    cta.disabled = !state.privacyChecked;
  }
}

async function signUp() {
  if (state.isSubmitting) return;
  state.isSubmitting = true;
  state.submitError = false;

  var btn = document.querySelector('.btn-signup');
  if (btn) {
    btn.classList.add('loading');
    btn.innerHTML = '<span style="display:flex;align-items:center;gap:8px"><span class="spinner" style="width:18px;height:18px;border-width:2px"></span>Sending…</span>';
    btn.disabled = true;
  }

  try {
    await submitOnboarding('complete');
    state.screenIdx = 35;
    render();
  } catch(e) {
    state.isSubmitting = false;
    state.submitError = true;
    if (btn) {
      btn.classList.remove('loading');
      btn.innerHTML = 'Sign up to unlock matches!';
      btn.disabled = false;
    }
    var errEl = document.querySelector('.submit-error');
    if (errEl) errEl.style.display = 'block';
  }
}

/* ── API ─────────────────────────────────────────────────── */
async function submitOnboarding(status) {
  if (!state.token) {
    // 토큰 없이 partial save는 조용히 넘어감 (complete만 에러)
    if (status === 'complete') throw new Error('no_token');
    return;
  }
  var res = await fetch(API_URL + '/api/v1/onboarding/answers', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + state.token,
    },
    body: JSON.stringify({ status: status, answers: state.answers }),
  });
  if (!res.ok) {
    var data = {};
    try { data = await res.json(); } catch(e) {}
    throw new Error(data.error || 'api_error_' + res.status);
  }
  return res.json();
}

/* ── Status Bar ──────────────────────────────────────────── */
function renderStatusBar() {
  return '<div class="status-bar">' +
    '<span>9:41</span>' +
    '<div class="status-bar-icons">' +
      '<svg width="16" height="12" viewBox="0 0 16 12" fill="none">' +
        '<rect x="0" y="4" width="3" height="8" rx="1" fill="#0D2B1E" opacity="0.4"/>' +
        '<rect x="4" y="3" width="3" height="9" rx="1" fill="#0D2B1E" opacity="0.6"/>' +
        '<rect x="8" y="1" width="3" height="11" rx="1" fill="#0D2B1E" opacity="0.8"/>' +
        '<rect x="12" y="0" width="4" height="12" rx="1" fill="#0D2B1E"/>' +
      '</svg>' +
      '<svg width="16" height="11" viewBox="0 0 18 11" fill="none">' +
        '<rect x="0.5" y="0.5" width="14" height="10" rx="2" stroke="#0D2B1E" stroke-opacity="0.5"/>' +
        '<rect x="15" y="3" width="2" height="5" rx="1" fill="#0D2B1E" opacity="0.4"/>' +
        '<rect x="2" y="2" width="10" height="7" rx="1" fill="#0D2B1E"/>' +
      '</svg>' +
    '</div>' +
  '</div>';
}

/* ── Unada Logo ───────────────────────────────────────────── */
function renderLogo() {
  return '<svg width="96" height="28" viewBox="0 0 96 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<text x="0" y="22" font-family="Nunito, sans-serif" font-size="22" font-weight="800" fill="#0D7A52">unada</text>' +
  '</svg>';
}

/* ── Nav Header ───────────────────────────────────────────── */
function renderNavHeader(screenIdx) {
  var part = getCurrentPart(screenIdx);
  var partLabel = part ? 'PART ' + part + ' OF 3' : '';
  var showBack = screenIdx > -1;

  return '<div class="nav-header">' +
    (showBack ? '<button class="nav-back-btn" onclick="goBack()">← Back</button>' : '<div style="min-width:44px"></div>') +
    '<span class="nav-part-label">' + esc(partLabel) + '</span>' +
    '<button class="nav-exit-btn" onclick="goExit()">Exit</button>' +
  '</div>';
}

/* ── Header Zone ─────────────────────────────────────────── */
function renderHeaderZone(q) {
  var answered = getQuestionsAnswered();
  var houseHtml = HOUSE.render(answered);
  var msg = CATEGORY_MESSAGES[q.category] || 'Analyzing your preferences...';
  var pct = (answered / 29) * 100;

  return '<div class="header-zone">' +
    '<div class="house-row">' +
      '<div class="house-svg-wrap">' + houseHtml + '</div>' +
      '<div class="ai-bubble">' +
        '<div class="ai-bubble-label">AI</div>' +
        '<div class="ai-bubble-msg">' + esc(msg) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="progress-bar-wrap">' +
      '<div class="progress-bar-track">' +
        '<div class="progress-bar-fill" style="width:' + pct + '%"></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* ── Flag Box ─────────────────────────────────────────────── */
function renderFlag(key, value) {
  var msgs = FLAG_MESSAGES[key];
  if (!msgs || !msgs[value]) return '';
  return '<div class="flag-box">' +
    '<span class="flag-icon">⚑</span>' +
    '<span class="flag-text">' + esc(msgs[value]) + '</span>' +
  '</div>';
}

/* ── Input Components ────────────────────────────────────── */
function renderRadio(q) {
  var val = state.answers[q.key];
  var html = '<div class="radio-group">';
  q.options.forEach(function(opt) {
    var sel = val === opt.value;
    var flagHtml = (sel && opt.flagKey) ? renderFlag(q.key, opt.value) : '';
    html += '<div class="radio-option' + (sel ? ' selected' : '') + '" onclick="selectRadio(\'' + q.key + '\',\'' + opt.value + '\')" role="radio" aria-checked="' + sel + '">' +
      '<div class="radio-circle"><div class="radio-circle-dot"></div></div>' +
      '<div class="radio-content">' +
        '<div class="radio-label">' + esc(opt.label) + '</div>' +
        (opt.hint ? '<div class="radio-hint">' + esc(opt.hint) + '</div>' : '') +
      '</div>' +
    '</div>' +
    flagHtml;
  });
  html += '</div>';
  return html;
}

function renderRadioCond(q) {
  var val = state.answers[q.key];
  var html = '<div class="radio-group">';

  q.options.forEach(function(opt) {
    var sel = val === opt.value;
    var flagHtml = (sel && opt.flagKey) ? renderFlag(q.key, opt.value) : '';

    // Determine if sub-input should show
    var showSub = false;
    if (sel && q.condType === 'dogDetails' && opt.value === 'dog') showSub = true;
    if (sel && q.condType === 'visaExpiry' && (opt.value === 'workpermit' || opt.value === 'studentvisa')) showSub = true;
    if (sel && q.condType === 'contractEndDate' && opt.value === 'contract') showSub = true;

    html += '<div class="radio-option' + (sel ? ' selected' : '') + '" onclick="selectRadio(\'' + q.key + '\',\'' + opt.value + '\')" role="radio" aria-checked="' + sel + '">' +
      '<div class="radio-circle"><div class="radio-circle-dot"></div></div>' +
      '<div class="radio-content">' +
        '<div class="radio-label">' + esc(opt.label) + '</div>' +
        (opt.hint ? '<div class="radio-hint">' + esc(opt.hint) + '</div>' : '') +
      '</div>' +
    '</div>' + flagHtml;

    if (showSub) {
      html += renderSubInput(q.condType);
    }
  });

  html += '</div>';
  return html;
}

function renderSubInput(condType) {
  if (condType === 'dogDetails') {
    var breed = state.answers.petBreed || '';
    var weight = state.answers.petWeight || '';
    return '<div class="cond-sub-input">' +
      '<div class="cond-sub-label">Dog breed</div>' +
      '<input type="text" class="cond-text-input" placeholder="e.g. Labrador, Poodle…" value="' + esc(breed) + '" oninput="setSubInput(\'petBreed\',this.value)"/>' +
      '<div class="cond-sub-label" style="margin-top:4px">Weight</div>' +
      '<div class="weight-chips">' +
        ['Under 25 lbs','25–50 lbs','Over 50 lbs'].map(function(w) {
          return '<div class="weight-chip' + (weight === w ? ' selected' : '') + '" onclick="toggleWeightChip(\'' + w + '\')">' + esc(w) + '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }
  if (condType === 'visaExpiry') {
    var ve = state.answers.visaExpiry || '';
    return '<div class="cond-sub-input">' +
      '<div class="cond-sub-label">Permit / Visa expiry date</div>' +
      '<input type="text" class="cond-text-input" placeholder="MM/YYYY" maxlength="7" value="' + esc(ve) + '" oninput="setSubInput(\'visaExpiry\',this.value)"/>' +
    '</div>';
  }
  if (condType === 'contractEndDate') {
    var cd = state.answers.contractEndDate || '';
    return '<div class="cond-sub-input">' +
      '<div class="cond-sub-label">Contract end date</div>' +
      '<input type="text" class="cond-text-input" placeholder="MM/YYYY" maxlength="7" value="' + esc(cd) + '" oninput="setSubInput(\'contractEndDate\',this.value)"/>' +
    '</div>';
  }
  return '';
}

function renderPills(q) {
  var val = state.answers[q.key];
  var html = '<div class="pills-group">';
  q.options.forEach(function(opt) {
    var sel = val === opt.value;
    html += '<div class="pill' + (sel ? ' selected' : '') + '" onclick="selectPill(\'' + q.key + '\',\'' + opt.value + '\')">' + esc(opt.label) + '</div>';
  });
  html += '</div>';
  return html;
}

function renderNeighborhoods(q) {
  var arr = state.answers[q.key] || [];
  var atMax = arr.length >= 3;
  var hint = atMax ? 'Deselect one to change' : 'Select up to 3';

  var html = '<div class="nbhd-count-hint">' + esc(hint) + ' (' + arr.length + '/3)' + '</div>' +
    '<div class="neighborhoods-group">';

  NEIGHBORHOODS.forEach(function(n) {
    var sel = arr.indexOf(n) !== -1;
    var disabled = !sel && atMax;
    html += '<div class="nbhd-chip' + (sel ? ' selected' : '') + (disabled ? ' disabled' : '') + '" onclick="toggleNeighborhood(\'' + n.replace(/'/g,"\\'") + '\')" style="cursor:' + (disabled ? 'not-allowed' : 'pointer') + '">' +
      (sel ? '<span style="font-size:10px">✓</span>' : '') +
      esc(n) +
    '</div>';
  });

  html += '</div>';
  return html;
}

function renderChipsFixed(q) {
  var arr = state.answers[q.key] || [];
  var html = '<div class="chips-group">';
  q.options.forEach(function(opt) {
    var sel = arr.indexOf(opt.value) !== -1;
    html += '<div class="chip-fixed' + (sel ? ' selected' : '') + '" onclick="toggleChip(\'' + q.key + '\',\'' + opt.value + '\')">' +
      (sel ? '<span class="chip-check">✓</span>' : '') +
      esc(opt.label) +
    '</div>';
  });
  html += '</div>';
  return html;
}

function renderSlider(q) {
  initOptionalDefaults(q);
  var v = state.answers[q.key];
  return '<div class="slider-card">' +
    '<div class="slider-value-row"><span class="slider-value">' + esc(q.format(v)) + '</span></div>' +
    '<input type="range" min="' + q.min + '" max="' + q.max + '" step="' + q.step + '" value="' + v + '"' +
      ' oninput="setSlider(\'' + q.key + '\',this.value)"' +
      ' aria-label="' + esc(q.question) + '"' +
      ' aria-valuenow="' + v + '"' +
      ' aria-valuemin="' + q.min + '" aria-valuemax="' + q.max + '"/>' +
    '<div class="slider-labels"><span>' + esc(q.format(q.min)) + '</span><span>' + esc(q.format(q.max)) + '</span></div>' +
  '</div>';
}

function renderTextarea(q) {
  initOptionalDefaults(q);
  var v = state.answers[q.key] || '';
  return '<textarea class="question-textarea" rows="4" placeholder="' + esc(q.placeholder) + '" oninput="setTextarea(\'' + q.key + '\',this.value)">' + esc(v) + '</textarea>';
}

function renderInputComponent(q) {
  switch(q.type) {
    case 'radio':       return renderRadio(q);
    case 'radio_cond':  return renderRadioCond(q);
    case 'pills':       return renderPills(q);
    case 'neighborhoods': return renderNeighborhoods(q);
    case 'chips_fixed': return renderChipsFixed(q);
    case 'slider':      return renderSlider(q);
    case 'textarea':    return renderTextarea(q);
    default: return '';
  }
}

/* ── Footer Zone ─────────────────────────────────────────── */
function renderFooter(q, screenIdx) {
  var isLast = screenIdx === 30;
  var answered = isAnswered(q);
  var nextLabel = isLast ? '✨ Generate my profile' : 'Next →';
  var nextCls = 'btn-next' + (!answered ? ' disabled' : '') + (isLast ? ' sun' : '');

  return '<div class="footer-zone">' +
    (screenIdx > 0 ? '<button class="btn-back-footer" onclick="goBack()">← Back</button>' : '') +
    '<button class="' + nextCls + '" onclick="goNext()" ' + (!answered ? 'disabled' : '') + '>' +
      esc(nextLabel) +
    '</button>' +
  '</div>';
}

/* ── Question Screen ─────────────────────────────────────── */
function renderQuestionScreen(q, screenIdx) {
  return renderStatusBar() +
    renderNavHeader(screenIdx) +
    '<div class="screen screen-enter">' +
      renderHeaderZone(q) +
      '<div class="scroll-zone">' +
        '<div class="category-chip">' + esc(q.category) + '</div>' +
        '<h2 class="question-text">' + esc(q.question) + '</h2>' +
        (q.hint ? '<p class="question-hint">' + esc(q.hint) + '</p>' : '') +
        renderInputComponent(q) +
      '</div>' +
      renderFooter(q, screenIdx) +
    '</div>';
}

/* ── Transition Screen ───────────────────────────────────── */
function renderTransitionScreen(t) {
  return renderStatusBar() +
    '<div class="screen screen-enter" style="flex:1">' +
      '<div class="transition-screen">' +
        '<div class="transition-badge">' + t.icon + '</div>' +
        '<div class="transition-sub">Part ' + t.partNum + ' of 3 complete ✓</div>' +
        '<h2 class="transition-title">' + esc(t.title) + '</h2>' +
        '<p class="transition-desc">' + esc(t.desc) + '</p>' +
        '<div class="transition-next-preview">' +
          '<div class="transition-next-icon">→</div>' +
          '<div class="transition-next-label">' + esc(t.nextPartLabel) + '</div>' +
        '</div>' +
        '<div class="transition-cta">' +
          '<button class="btn-primary" onclick="goNext()">Continue to ' + esc(t.nextPartLabel) + ' →</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ── Welcome Screen ──────────────────────────────────────── */
function renderWelcome() {
  return renderStatusBar() +
    '<div class="screen screen-enter" style="flex:1">' +
      '<div class="welcome-screen">' +
        '<div class="welcome-logo-row">' + renderLogo() + '</div>' +
        '<div class="welcome-house-area">' +
          HOUSE.render(0) +
        '</div>' +
        '<h1 class="welcome-headline">Answer questions.<br>Build your home.</h1>' +
        '<p class="welcome-desc">Each answer adds a piece to the house above. By answering all the questions it\'s fully built, and we know exactly what to find you.</p>' +
        '<div class="welcome-cta-area">' +
          '<button class="btn-primary' + (!state.privacyChecked ? ' disabled' : '') + '" onclick="goNext()" ' + (!state.privacyChecked ? 'disabled' : '') + '>Find my ideal home →</button>' +
          '<div class="privacy-row">' +
            '<div class="privacy-checkbox' + (state.privacyChecked ? ' checked' : '') + '" onclick="togglePrivacy()" style="' + (state.privacyChecked ? 'color:#fff;font-size:12px;' : '') + '">' +
              (state.privacyChecked ? '✓' : '') +
            '</div>' +
            '<p class="privacy-text">I agree to the collection and use of my personal information, including financial and immigration details, for the purpose of real estate matching. <span class="privacy-link">Privacy Policy</span></p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ── Generating Screen ───────────────────────────────────── */
function renderGenerating() {
  var houseHtml = HOUSE.render(29);
  return renderStatusBar() +
    '<div class="screen screen-enter" style="flex:1">' +
      '<div class="generating-screen">' +
        houseHtml +
        '<h2 class="generating-title">Your home is taking shape</h2>' +
        '<p class="generating-sub">Putting your profile together…</p>' +
        '<div class="spinner"></div>' +
      '</div>' +
    '</div>';
}

/* ── Reveal Slide 1 — Neighborhood Match ─────────────────── */
function renderRevealSlide1() {
  var nbhds = state.answers.neighborhoods || [];
  var primary = nbhds[0] || 'Annex';
  var scores = NEIGHBORHOOD_SCORES[primary] || NEIGHBORHOOD_SCORES_DEFAULT;
  var dims = [
    { label: 'Transit', key: 'transit' },
    { label: 'Parks',   key: 'parks'   },
    { label: 'Quiet',   key: 'quiet'   },
    { label: 'Dining',  key: 'dining'  },
    { label: 'Safety',  key: 'safety'  },
  ];

  var barsHtml = dims.map(function(d) {
    var w = scores[d.key];
    return '<div class="score-row">' +
      '<span class="score-label">' + d.label + '</span>' +
      '<div class="score-bar-wrap">' +
        '<div class="score-bar-fill" style="width:' + w + '%">' +
          '<span class="score-bar-val">' + w + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  return '<div class="reveal-content">' +
    '<p class="reveal-eyebrow">Your Neighbourhood Match</p>' +
    '<h2 class="reveal-title">' + esc(primary) + '</h2>' +
    '<div class="score-list">' + barsHtml + '</div>' +
    (nbhds.length > 1 ? '<p style="margin-top:14px;font-size:13px;color:var(--unada-fg3)">Also matched: ' + nbhds.slice(1).map(esc).join(', ') + '</p>' : '') +
  '</div>';
}

/* ── Reveal Slide 2 — Budget Reality ─────────────────────── */
function renderRevealSlide2() {
  var budget = state.answers.monthlyBudget || 2500;
  var bedroomKey = state.answers.bedrooms || '1b';
  var details = BEDROOM_DETAILS[bedroomKey] || BEDROOM_DETAILS['1b'];
  var hasParking = budget >= 3000;

  return '<div class="reveal-content">' +
    '<p class="reveal-eyebrow">Budget Reality Check</p>' +
    '<h2 class="reveal-title">What $' + budget.toLocaleString() + '/mo gets you</h2>' +
    '<div class="budget-card">' +
      '<div class="budget-card-header">' +
        '<div class="budget-card-label">Unit Type</div>' +
        '<div class="budget-card-type">' + esc(details.typeName) + '</div>' +
        '<div class="budget-card-size">' + esc(details.size) + '</div>' +
      '</div>' +
      '<div class="budget-detail-list">' +
        '<div class="budget-detail-row"><span class="budget-detail-key">Monthly rent</span><span class="budget-detail-val" style="color:var(--unada-forest)">$' + budget.toLocaleString() + '</span></div>' +
        '<div class="budget-detail-row"><span class="budget-detail-key">Parking</span><span class="budget-detail-val">' + (hasParking ? '✓ Likely included' : '✗ Not included') + '</span></div>' +
        '<div class="budget-detail-row"><span class="budget-detail-key">Locker</span><span class="budget-detail-val">1 Included</span></div>' +
        '<div class="budget-detail-row"><span class="budget-detail-key">Utilities</span><span class="budget-detail-val">Hydro separate</span></div>' +
      '</div>' +
    '</div>' +
    '<p style="font-size:12px;color:var(--unada-fg3);line-height:1.5">Estimates based on current Toronto market data. Actual availability varies.</p>' +
  '</div>';
}

/* ── Reveal Slide 3 — Teaser + CTA ───────────────────────── */
function renderRevealSlide3() {
  var budget = state.answers.monthlyBudget || 2500;
  var mults = [0.91, 0.86, 0.80, 1.04];
  var nbhds = state.answers.neighborhoods || ['Annex','Leslieville','Ossington','Corktown'];
  var mockNeighborhoods = [nbhds[0]||'Annex', nbhds[1]||'Leslieville', nbhds[2]||'Ossington', 'Nearby'];
  var bedrooms = state.answers.bedrooms || '1b';
  var bedroomLabel = (BEDROOM_DETAILS[bedrooms] || BEDROOM_DETAILS['1b']).typeName;

  var listingsHtml = mults.map(function(m, i) {
    var price = Math.max(1500, Math.round((budget * m) / 50) * 50);
    return '<div class="mock-listing-item">' +
      '<div class="mock-listing-info">' +
        '<span class="mock-listing-hood">' + mockNeighborhoods[i] + '</span>' +
        '<span class="mock-listing-size">' + bedroomLabel + '</span>' +
      '</div>' +
      '<span class="mock-listing-price">$' + price.toLocaleString() + '/mo</span>' +
    '</div>';
  }).join('');

  return '<div class="reveal-content">' +
    '<p class="reveal-eyebrow" style="font-size:12px;font-weight:700;color:var(--unada-forest)">Your ideal layout made by AI</p>' +
    '<div class="teaser-floor-plan">' +
      '<div style="width:100%;height:100%;background:linear-gradient(135deg,#0D2B1E 0%,#0D7A52 100%);position:absolute;inset:0"></div>' +
      '<div class="floor-plan-overlay">' +
        '<div class="floor-plan-lock">🔒</div>' +
        '<div class="floor-plan-msg">Unlock to see your AI floor plan</div>' +
      '</div>' +
    '</div>' +
    '<div class="mock-listings">' +
      listingsHtml +
      '<div class="mock-listings-fade"></div>' +
    '</div>' +
    '<div class="agent-card">' +
      '<div class="agent-card-icon">🏠</div>' +
      '<div>' +
        '<div class="agent-card-name">Your real estate agent + AI are on it</div>' +
        '<div class="agent-card-sub">Jane has your profile ready</div>' +
      '</div>' +
    '</div>' +
    '<button class="btn-signup" onclick="signUp()">Sign up to unlock matches!</button>' +
    '<div class="submit-error" style="display:none">Something went wrong. Please try again.</div>' +
  '</div>';
}

/* ── Reveal Nav Bar ──────────────────────────────────────── */
function renderRevealNavBar(slideNum) {
  var labels = ['Neighbourhood Match', 'Budget Reality', 'Your Matches'];
  var isFirst = slideNum === 1;
  var isLast  = slideNum === 3;

  return '<div class="reveal-nav-bar">' +
    '<button class="reveal-arrow-btn' + (isFirst ? ' disabled' : '') + '" onclick="goRevealBack()">←</button>' +
    '<div class="reveal-slide-label">' + esc(labels[slideNum - 1]) + '</div>' +
    (!isLast ? '<button class="reveal-arrow-btn" onclick="goRevealNext()">→</button>' : '<div style="width:38px"></div>') +
  '</div>';
}

/* ── Success Screen ──────────────────────────────────────── */
function renderSuccess() {
  return renderStatusBar() +
    '<div class="screen screen-enter" style="flex:1">' +
      '<div class="success-screen">' +
        HOUSE.render(29) +
        '<div class="success-check">✓</div>' +
        '<h2 class="success-title">Request sent<br>successfully!</h2>' +
        '<p class="success-desc">Your agent will review your profile and reach out within 24 hours. Please wait for confirmation.</p>' +
        '<div class="success-agent-card">' +
          '<div class="success-agent-name">🏠 Your agent: Jane</div>' +
          '<div class="success-agent-sub">Questions? She\'ll be in touch soon.</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ── Main Render ─────────────────────────────────────────── */
function render() {
  var app = document.getElementById('app');
  if (!app) return;

  var idx = state.screenIdx;
  var html = '';

  if (idx === -1) {
    html = renderWelcome();
  } else if (idx >= 0 && idx <= 30) {
    var screen = SCREENS[idx];
    if (screen.type === 'question') {
      var q = QUESTIONS[screen.qIdx];
      html = renderQuestionScreen(q, idx);
    } else if (screen.type === 'transition') {
      html = renderTransitionScreen(TRANSITIONS[screen.tIdx]);
    }
  } else if (idx === 31) {
    html = renderGenerating();
    // Auto-advance after 2.4s
    setTimeout(function() {
      if (state.screenIdx === 31) {
        state.screenIdx = 32;
        render();
      }
    }, 2400);
  } else if (idx === 32) {
    html = renderStatusBar() +
      '<div class="screen screen-enter" style="flex:1;display:flex;flex-direction:column">' +
        '<div style="flex:1;overflow:hidden;display:flex;flex-direction:column">' +
          renderRevealSlide1() +
        '</div>' +
        renderRevealNavBar(1) +
      '</div>';
  } else if (idx === 33) {
    html = renderStatusBar() +
      '<div class="screen screen-enter" style="flex:1;display:flex;flex-direction:column">' +
        '<div style="flex:1;overflow:hidden;display:flex;flex-direction:column">' +
          renderRevealSlide2() +
        '</div>' +
        renderRevealNavBar(2) +
      '</div>';
  } else if (idx === 34) {
    html = renderStatusBar() +
      '<div class="screen screen-enter" style="flex:1;display:flex;flex-direction:column">' +
        '<div style="flex:1;overflow:hidden;display:flex;flex-direction:column">' +
          renderRevealSlide3() +
        '</div>' +
        renderRevealNavBar(3) +
      '</div>';
  } else if (idx === 35) {
    html = renderSuccess();
  }

  app.innerHTML = html;
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  // URL ?token= 파싱 — Jane이 발급한 onboarding_token
  var params = new URLSearchParams(window.location.search);
  var token = params.get('token');
  if (token) {
    state.token = token;
  } else {
    state.tokenMissing = true;
    console.warn('[Unada] No onboarding token in URL. API saves will be skipped.');
  }
  render();
});
