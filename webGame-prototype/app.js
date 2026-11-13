/** DOM 표시와 브라우저 저장 연결. 게임 판정은 game.js에 모음. */
(function startWorkshop() {
  'use strict';

  const Game = window.YesRainGame;
  const storageKey = 'yesrain-game-prototype-v1';
  let storageWarning = false;
  let activeSlot = 'body';
  let toastTimer;
  let lastFoundPart = null;
  const dialogReturnFocus = new Map();
  let state = loadProgress();

  /** 고정된 화면 요소를 ID로 가져옴. */
  function byId(id) {
    return document.getElementById(id);
  }

  /** 저장 접근이 막혀도 메모리에서 플레이를 시작함. 기존 별도 프로토타입 저장키는 건드리지 않음. */
  function loadProgress() {
    try {
      return Game.restoreState(localStorage.getItem(storageKey));
    } catch {
      storageWarning = true;
      return Game.createState();
    }
  }

  /** 저장 성공 여부를 실제 결과에 따라 안내함. 저장 실패 시에도 현재 창의 게임은 유지됨. */
  function saveProgress() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      storageWarning = false;
    } catch {
      storageWarning = true;
    }
  }

  /** 부품 획득 등 일시적인 피드백을 표시함. 저장 실패 안내는 하단에 계속 남김. */
  function showToast(message) {
    clearTimeout(toastTimer);
    byId('toast').textContent = message;
    byId('toast').hidden = false;
    toastTimer = setTimeout(hideToast, 4200);
  }

  /** 안내 표시 시간이 지나면 토스트를 숨김. */
  function hideToast() {
    byId('toast').hidden = true;
  }

  /** 미션 장소를 구별하는 선형 아이콘 생성. 외부 이미지 요청 없이 표시함. */
  function missionIcon(name) {
    const paths = {
      cave: '<path d="M3 20 8 5h8l5 15h-6l-3-8-3 8zM7 9h3m5-1 2 3"/>',
      mud: '<path d="M2 17q4-4 8 0t12 0M2 21q4-3 8 0t12 0M9 3h7l-1 11H8zM11 6h2"/>',
      rubble: '<path d="m3 21 1-9 6-2 2-7 7 3 2 15zM4 12l9 4-3 5m3-5 3-7m-6 1 4 3"/>',
      walking: '<circle cx="13" cy="4" r="2"/><path d="m11 8-3 6-5 1m8-7 4 5 5 1m-9-6 2 8-5 6m5-6 5 6"/>',
      pool: '<path d="M2 18q4-4 8 0t12 0M2 22q4-3 8 0t12 0M4 14V4h5m-5 4h5m-5 4h5"/><circle cx="16" cy="9" r="4"/>',
      comfort: '<path d="M4 8 3 2l6 4h6l6-4-1 6v10l-8 4-8-4zM8 11v2m8-2v2m-7 4 3 2 3-2"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
  }

  /** 몸통별 실루엣을 같은 조립 좌표에 그려 혼합 장착을 표현함. */
  function drawBody(part) {
    const shapes = {
      dog: '<path d="m160 172-29-22-13 3" fill="none"/><rect x="157" y="145" width="166" height="77" rx="25"/><path d="m286 145 8-25 24-8 32 15v43l-35 9z"/><path d="m301 121-5-21 19 13"/><rect x="316" y="136" width="21" height="10" rx="4" fill="#203323" stroke="none"/><circle cx="331" cy="140" r="3" fill="#efffc5" stroke="none"/><path d="M181 161h59m-59 10h39" opacity=".3"/>',
      heavy: '<rect x="150" y="137" width="182" height="92" rx="13"/><path d="M176 143v77m131-77v77" opacity=".35"/><rect x="193" y="157" width="96" height="28" rx="6" fill="#26392b"/><path d="M203 172h32m13 0h30" stroke="#eaf4c1"/><path d="M211 137v-22h62v22" fill="none"/>',
      humanoid: '<path d="m200 139 37-15h35l33 15-18 77h-69z"/><rect x="229" y="70" width="51" height="52" rx="17"/><rect x="237" y="87" width="36" height="12" rx="5" fill="#23382c" stroke="none"/><path d="M238 151h31m-21 0v30" stroke="#eff9db"/><path d="M219 216h67l-8 20h-53z"/>',
      drone: '<path d="m181 153 26-35h85l27 35"/><ellipse cx="250" cy="163" rx="82" ry="35"/><rect x="230" y="177" width="42" height="37" rx="9"/><circle cx="251" cy="194" r="10" fill="#263d32"/><circle cx="251" cy="194" r="4" fill="#d8f58b" stroke="none"/><path d="M215 144h70" opacity=".4"/>',
      sealed: '<rect x="174" y="118" width="145" height="112" rx="48"/><circle cx="246" cy="170" r="38" fill="#244d47"/><circle cx="246" cy="170" r="28" fill="#76bcb5"/><path d="m230 158 12-9m-16 21 9-7" stroke="#d5faf1" stroke-width="6"/><path d="M187 213h117" opacity=".3"/><path d="M227 118v-12h37v12" fill="none"/>',
      companion: '<rect x="187" y="154" width="125" height="77" rx="30"/><path d="m211 102-8-32 33 22m35 0 30-22-6 38"/><rect x="201" y="93" width="103" height="83" rx="32"/><rect x="215" y="112" width="75" height="39" rx="17" fill="#283329"/><path d="m229 131 5-7 5 7m23 0 5-7 5 7" stroke="#fae0a2" stroke-width="4" fill="none"/><path d="m240 158 11 6 11-6" fill="none" stroke-width="3"/><path d="m310 198 23-20-7-20" fill="none" stroke-width="13"/>'
    };
    return `<g fill="${part.color}" stroke="#17251c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${shapes[part.type]}</g>`;
  }

  /** 선택한 장비의 집게·운반대·센서 모양을 그려 장착 변화를 보여줌. */
  function drawArm(part) {
    const shapes = {
      hand: '<path d="m207 165-47 25-26 40" fill="none" stroke-width="19"/><circle cx="159" cy="190" r="11"/><path d="m133 225-12 16 4 13m10-27 1 22 12 4m-16-27 15 10 5 15" fill="none" stroke-width="7"/>',
      cargo: '<path d="m208 178-37 38h-58" fill="none" stroke-width="13"/><rect x="86" y="216" width="108" height="16" rx="4"/><rect x="106" y="186" width="57" height="30" rx="8"/><path d="M118 197h29m-15-9v24" stroke="#765d32" stroke-width="3"/><path d="M177 170v-33h-20" fill="none" stroke-width="7"/><path d="m158 131-16 7 16 7z" fill="#f7ecac" stroke-width="3"/>',
      claw: '<path d="m211 170-51 20-28 38" fill="none" stroke-width="17"/><circle cx="160" cy="190" r="10"/><path d="m131 223-19 8-2 21 13 8m9-37 15 13-3 21-12 5" fill="none" stroke-width="8"/><circle cx="181" cy="180" r="10" fill="#d8f58b" stroke-width="3"/><path d="M178 180h6" stroke-width="2"/>',
      sensor: '<path d="M199 172h-37v-48" fill="none" stroke-width="12"/><rect x="133" y="99" width="59" height="36" rx="9"/><circle cx="151" cy="116" r="8" fill="#544966"/><circle cx="175" cy="116" r="8" fill="#d8f58b"/><path d="m121 106-14-8m14 28-14 8" fill="none" stroke-width="3" opacity=".6"/>',
      lidar: '<path d="M200 178h-40v-61" fill="none" stroke-width="11"/><path d="M137 95h46v23h-46z"/><ellipse cx="160" cy="95" rx="23" ry="8" fill="#d8f58b"/><path d="m129 91-20-7m20 26-22 8m83-27 19-7" stroke-width="3" fill="none" opacity=".7"/>',
      conversation: '<path d="m205 174-45 18-18 30" fill="none" stroke-width="15"/><rect x="122" y="211" width="36" height="39" rx="13"/><path d="M132 225h16m-16 8h16" stroke-width="3"/><path d="M104 104h80v43h-45l-15 14v-14h-20z" fill="#eef0cd" stroke-width="3"/><path d="M120 124h4m13 0h4m13 0h4" stroke-width="5"/>'
    };
    return `<g fill="${part.color}" stroke="#17251c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${shapes[part.type]}</g>`;
  }

  /** 바퀴·다리·무한궤도·프로펠러·수중 추진기를 같은 몸통과 조합함. */
  function drawBase(part) {
    const wheel = '<circle cx="194" cy="254" r="34"/><circle cx="299" cy="254" r="34"/><circle cx="194" cy="254" r="15" fill="#3f5140"/><circle cx="299" cy="254" r="15" fill="#3f5140"/>';
    const shapes = {
      road: `<path d="M194 235h105" stroke-width="15"/>${wheel}`,
      terrain: `<path d="M194 235h105" stroke-width="15"/><g stroke-dasharray="8 5" stroke-width="9">${wheel}</g>`,
      legs: '<path d="m223 204-14 35 8 35m55-70 15 35-9 35" fill="none" stroke-width="21"/><circle cx="211" cy="240" r="12"/><circle cx="285" cy="240" r="12"/><path d="M198 274h36v14h-49v-7zm64 0h35l14 14h-50z"/>',
      spider: '<path d="m210 202-67 10-26 63m112-73-42 47-7 33m91-80 62 10 29 63m-107-73 44 47 11 33m-65-77-2 65" fill="none" stroke-width="12"/><path d="M106 278h24m39 6h25m105 0h24m28-6h24m-146-5h25" stroke-width="8"/>',
      track: '<rect x="144" y="226" width="201" height="67" rx="32" fill="#425744"/><rect x="157" y="238" width="175" height="42" rx="20"/><circle cx="180" cy="259" r="13"/><circle cx="308" cy="259" r="13"/><path d="M213 248v21m23-21v21m23-21v21m23-21v21" stroke-width="4"/>',
      propeller: '<path d="m214 176-66-60m130 60 66-60m-130 74-66 47m130-47 66 47" fill="none" stroke-width="12"/><g fill="#c8b9ed55" stroke-width="3"><ellipse cx="141" cy="110" rx="49" ry="14"/><ellipse cx="350" cy="110" rx="49" ry="14"/><ellipse cx="141" cy="240" rx="49" ry="14"/><ellipse cx="350" cy="240" rx="49" ry="14"/></g><path d="m112 110 58 0m151 0h58M112 240h58m180 0h29" stroke-width="6"/><path d="m221 215-10 37h70l-10-37" fill="none" stroke-width="7"/>',
      underwater: '<path d="m199 199-61 20v29l65-13m93-36 61 20v29l-65-13"/><ellipse cx="139" cy="234" rx="15" ry="23" fill="#376f66"/><ellipse cx="356" cy="234" rx="15" ry="23" fill="#376f66"/><path d="M139 219v30m-9-15h18m208-15v30m-9-15h18" stroke="#b9ece2" stroke-width="4"/><path d="m219 221-9 37h70l-9-37" fill="none" stroke-width="8"/>'
    };
    return `<g fill="${part.color}" stroke="#17251c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${shapes[part.type]}</g>`;
  }

  /** 부품 그림을 축소함. 미발견 부품도 형태를 미리 살펴볼 수 있게 함. */
  function partArtwork(part) {
    const views = { body: '120 65 245 180', arm: '77 75 150 195', base: '90 155 310 150' };
    const draw = { body: drawBody, arm: drawArm, base: drawBase };
    return `<svg viewBox="${views[part.slot]}" aria-hidden="true">${draw[part.slot](part)}</svg>`;
  }

  /** 조건의 일치·부족을 기호와 문구로 함께 표시함. */
  function traitChip(trait, matched, report = false) {
    const className = matched ? 'matched' : report ? 'missing' : '';
    return `<span class="trait ${className}"><span aria-hidden="true">${matched ? '✓' : '−'}</span><span>${trait}</span></span>`;
  }

  /** 선택한 미션을 상단에 요약하고 상세·다른 미션은 선택 창에 표시함. */
  function renderMission() {
    const mission = Game.MISSIONS.find(mission => mission.id === state.missionId);
    const suitability = Game.evaluate(state.equipped, state.missionId);
    byId('mission-count').textContent = `${Game.MISSIONS.length}개`;
    byId('mission-icon').innerHTML = missionIcon(mission.icon);
    byId('mission-title').textContent = mission.title;
    byId('open-missions').setAttribute('aria-label', `${mission.title}, 미션 선택 및 자세히 보기`);
    byId('mission-list').innerHTML = Game.MISSIONS.map(item => `<button id="mission-${item.id}" class="mission-card" type="button" data-mission="${item.id}" aria-pressed="${item.id === state.missionId}"><span class="mission-icon">${missionIcon(item.icon)}</span><span><strong>${item.title}</strong><small>${item.id === state.missionId ? '✓ 현재 미션' : `${item.tag} · ${item.place}`}</small></span></button>`).join('');
    byId('mission-kicker').textContent = `${mission.tag} · ${mission.place}`;
    byId('mission-detail-title').textContent = mission.title;
    byId('mission-text').textContent = mission.text;
    byId('mission-hint').textContent = mission.hint;
    const chips = mission.needs.map(need => traitChip(need, suitability.matched.includes(need))).join('');
    byId('requirements').innerHTML = chips;
    byId('mission-detail-requirements').innerHTML = chips;
    byId('readiness-value').textContent = `${suitability.matched.length}/${mission.needs.length} 준비`;
    byId('robot-status').textContent = state.completed ? '출동 완료! 로봇이 돌아왔어요' : suitability.missing.length ? '파견 준비 중' : '준비 완료! 출동해 볼까요?';
    byId('dispatch').innerHTML = `<span>${state.completed ? '다음 미션' : '파견하기'}<small>${state.completed ? '새로운 곳으로 출동해요' : `${suitability.matched.length}/${mission.needs.length} 특성 충족`}</small></span><span class="dispatch-arrow" aria-hidden="true">${state.completed ? '→' : '↗'}</span>`;
    byId('open-result').hidden = !state.completed;
  }

  /** 로봇을 무대 중앙에 그리고 세 개의 부품 슬롯을 하단 플로팅 버튼으로 표시함. */
  function renderRobot() {
    const body = Game.PARTS[state.equipped.body];
    const arm = Game.PARTS[state.equipped.arm];
    const base = Game.PARTS[state.equipped.base];
    byId('robot-preview').innerHTML = `<svg viewBox="80 55 335 265" aria-hidden="true">${drawBase(base)}${drawBody(body)}${drawArm(arm)}</svg>`;
    byId('robot-preview').setAttribute('aria-label', `${body.name}, ${arm.name}, ${base.name} 조합의 로봇`);
    byId('equipment-summary').innerHTML = Object.entries(Game.SLOTS).map(([slot, label]) => {
      const part = Game.PARTS[state.equipped[slot]];
      return `<button id="equipment-${slot}" class="equipment-card" data-equipment="${slot}" type="button" aria-haspopup="dialog" aria-controls="parts-dialog" aria-label="${label}: ${part.name}, 바꾸기" title="${part.name}" ${state.completed ? 'disabled' : ''}><span class="slot-art">${partArtwork(part)}</span><span class="slot-label">${label}<span aria-hidden="true">↻</span></span><small>${part.name}</small></button>`;
    }).join('');
  }

  /** 부품은 선택 창 안에서만 나열함. 보유·새 부품을 먼저 표시하고 필요한 특성을 강조함. */
  function renderParts() {
    const mission = Game.MISSIONS.find(mission => mission.id === state.missionId);
    byId('part-count').textContent = `${state.owned.length}/${Object.keys(Game.PARTS).length}`;
    for (const tab of byId('part-tabs').querySelectorAll('[data-slot]')) {
      const selected = tab.dataset.slot === activeSlot;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    byId('parts-grid').setAttribute('aria-labelledby', `tab-${activeSlot}`);
    const parts = Object.entries(Game.PARTS).filter(([, part]) => part.slot === activeSlot);
    parts.sort(([a], [b]) => Number(b === lastFoundPart) - Number(a === lastFoundPart) || Number(state.owned.includes(b)) - Number(state.owned.includes(a)));
    byId('parts-grid').innerHTML = parts.map(([id, part]) => {
      const owned = state.owned.includes(id);
      const equipped = state.equipped[activeSlot] === id;
      const traits = part.traits.map(trait => `<span class="${mission.needs.includes(trait) ? 'relevant' : ''}">${trait}</span>`).join('');
      return `<button id="part-${id}" class="part-card ${owned ? '' : 'locked'} ${id === lastFoundPart ? 'just-found' : ''}" data-part="${id}" type="button" aria-pressed="${equipped}" ${!owned || state.completed ? 'disabled' : ''}><span class="part-art">${partArtwork(part)}</span><span><span class="part-card-head"><strong>${part.name}</strong><span class="part-badge">${id === lastFoundPart ? '새 부품!' : equipped ? '✓ 장착' : owned ? '장착하기' : '미발견'}</span></span><span class="part-traits">${traits}</span><small>${part.note}</small></span></button>`;
    }).join('');
    byId('parts-help').textContent = state.completed ? '부품은 그대로 있어요. 다음 미션에서 다시 조립해요.' : lastFoundPart && Game.PARTS[lastFoundPart].slot === activeSlot ? `${Game.PARTS[lastFoundPart].name} 발견! 눌러서 장착해 보세요.` : '장착할 부품을 골라 주세요. 밑줄은 이번 미션에 필요한 특성이에요.';
    const allFound = state.owned.length === Object.keys(Game.PARTS).length;
    byId('collect-label').textContent = allFound ? '부품 목록' : '부품 보급';
    byId('collect').setAttribute('aria-label', allFound ? '모든 부품 보기' : `새 부품 보급 받기, 현재 ${state.owned.length}개 보유`);
  }

  /** 출동 결과는 팝업에 표시함. 완료한 결과는 다시 열어 확인할 수 있음. */
  function renderResult() {
    byId('next-mission').disabled = !state.completed;
    if (!state.result) {
      byId('result').innerHTML = '<p class="report-footnote">아직 출동 전이에요. 로봇을 준비하고 파견해 보세요.</p>';
      return;
    }
    const result = state.result;
    const mission = Game.MISSIONS.find(mission => mission.id === result.missionId);
    const matched = result.matched.length ? result.matched.map(trait => traitChip(trait, true, true)).join('') : '<p>충족한 조건이 없어요.</p>';
    const missing = result.missing.length ? result.missing.map(trait => traitChip(trait, false, true)).join('') : '<p>모든 조건을 충족했어요!</p>';
    const title = result.missing.length ? result.matched.length ? '도움이 됐어요!' : '다른 조합이 필요해요' : '딱 맞는 로봇! 임무 완료';
    byId('result').innerHTML = `<div class="result-emblem" aria-hidden="true">${result.missing.length ? '↗' : '✓'}</div><div class="report-summary"><h3>${title}</h3><p>${mission.title} · ${result.matched.length}/${mission.needs.length} 조건 충족</p><div class="report-coins">+${result.reward}<small> 코인</small></div></div><div class="report-details"><div><h4>✓ 충족한 조건</h4><div class="requirements">${matched}</div></div><div><h4>− 보완할 조건</h4><div class="requirements">${missing}</div></div></div><p class="report-footnote">보상이 반영됐어요. 부품은 다음 미션에도 쓸 수 있어요.</p>`;
  }

  /** 화면 갱신 후 동일한 버튼으로 키보드 포커스를 되돌림. 열린 팝업 밖으로 포커스를 옮기지 않음. */
  function render() {
    const focusedId = document.activeElement?.id;
    byId('coins').textContent = state.coins.toLocaleString('ko-KR');
    byId('coins').title = `${state.coins.toLocaleString('ko-KR')} 테스트 코인`;
    renderMission();
    renderRobot();
    renderParts();
    renderResult();
    byId('save-status').textContent = storageWarning ? '저장할 수 없어요. 창을 닫으면 진행이 사라질 수 있어요.' : '이 브라우저에 자동 저장 · 테스트 플레이';
    byId('save-status').classList.toggle('warning', storageWarning);
    const focused = focusedId && byId(focusedId);
    const dialog = document.querySelector('dialog[open]');
    if (focused && !focused.disabled && (!dialog || dialog.contains(focused))) focused.focus({ preventScroll: true });
  }

  /** 게임 상태를 저장한 뒤 표시함. UI 개편에서도 기존 저장키·데이터 형식을 유지함. */
  function update(nextState) {
    if (nextState === state) return;
    state = nextState;
    saveProgress();
    render();
  }

  /** 팝업을 모달로 열어 배경 조작을 막음. 닫을 때 복귀할 버튼 ID를 보관함. */
  function openDialog(id, focusId) {
    const dialog = byId(id);
    if (dialog.open) return;
    dialogReturnFocus.set(id, document.activeElement?.id || 'dispatch');
    dialog.showModal();
    dialog.querySelector('.dialog-body').scrollTop = 0;
    const target = focusId && byId(focusId);
    if (target && !target.disabled) target.focus({ preventScroll: true });
  }

  /** 페이지 스크롤 없이 현재 팝업을 닫음. */
  function closeDialog(id) {
    const dialog = byId(id);
    if (dialog.open) dialog.close();
  }

  /** 닫기 버튼과 바깥 영역 터치를 처리함. 팝업 안쪽의 빈 공간 터치는 닫기로 오인하지 않음. */
  function handleDialogClick(event) {
    const dialog = event.currentTarget;
    const button = event.target.closest('[data-close]');
    if (button) {
      closeDialog(button.dataset.close);
      return;
    }
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog(dialog.id);
  }

  /** 닫기·Escape 이후 팝업을 열었던 버튼으로 복귀함. */
  function handleDialogClose(event) {
    const id = event.currentTarget.id;
    if (id === 'parts-dialog') lastFoundPart = null;
    const returnId = dialogReturnFocus.get(id);
    dialogReturnFocus.delete(id);
    if (!document.querySelector('dialog[open]')) byId(returnId)?.focus({ preventScroll: true });
  }

  /** 상단 미션 버튼에서 상세 설명과 의뢰 목록을 엶. */
  function handleOpenMissions() {
    openDialog('missions-dialog');
  }

  /** 다른 미션을 선택하면 새 출동을 준비하고 무대로 복귀함. */
  function handleMissionClick(event) {
    const button = event.target.closest('[data-mission]');
    if (!button) return;
    update(Game.selectMission(state, button.dataset.mission));
    closeDialog('missions-dialog');
  }

  /** 부품을 장착하면 선택 창을 닫고 바뀐 로봇을 바로 보여줌. */
  function handlePartClick(event) {
    const button = event.target.closest('[data-part]');
    if (!button || button.disabled) return;
    const part = Game.PARTS[button.dataset.part];
    update(Game.equip(state, button.dataset.part));
    closeDialog('parts-dialog');
    showToast(`${part.name} 장착!`);
  }

  /** 전체 보유 상태에서는 목록을 엶. 수집 중이면 새 부품을 지급하고 맨 앞에 표시함. */
  function handleCollect() {
    const found = Game.collect(state);
    if (!found.partId) {
      lastFoundPart = null;
      renderParts();
      openDialog('parts-dialog', `tab-${activeSlot}`);
      return;
    }
    lastFoundPart = found.partId;
    activeSlot = Game.PARTS[found.partId].slot;
    update(found.state);
    openDialog('parts-dialog', state.completed ? `tab-${activeSlot}` : `part-${found.partId}`);
  }

  /** 주요 버튼의 행동은 준비 중에는 파견, 완료 후에는 다음 미션으로 연결함. */
  function handlePrimaryAction() {
    if (state.completed) {
      handleNextMission();
      return;
    }
    update(Game.dispatch(state));
    openDialog('result-dialog', 'next-mission');
  }

  /** 이미 받은 결과를 다시 확인함. 보상 지급 함수를 호출하지 않음. */
  function handleOpenResult() {
    if (state.completed) openDialog('result-dialog', 'next-mission');
  }

  /** 다음 미션으로 이동하고 결과 창을 닫음. */
  function handleNextMission() {
    update(Game.nextMission(state));
    closeDialog('result-dialog');
  }

  /** 선택 창 안에서 탭만 바꾸고 긴 목록의 스크롤을 처음으로 돌림. */
  function setSlot(slot) {
    if (!Object.hasOwn(Game.SLOTS, slot)) return;
    activeSlot = slot;
    lastFoundPart = null;
    renderParts();
    byId('parts-grid').closest('.dialog-body').scrollTop = 0;
  }

  /** 부품 종류 탭의 터치·클릭을 처리함. */
  function handleTabClick(event) {
    const tab = event.target.closest('[data-slot]');
    if (tab) setSlot(tab.dataset.slot);
  }

  /** 화살표·Home·End 키로 부품 탭을 이동함. */
  function handleTabKey(event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const slots = Object.keys(Game.SLOTS);
    const index = slots.indexOf(activeSlot);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? slots.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + slots.length) % slots.length;
    setSlot(slots[next]);
    byId(`tab-${slots[next]}`).focus();
  }

  /** 로봇 아래 부품 슬롯에서 해당 종류의 선택 창을 엶. */
  function handleEquipmentClick(event) {
    const button = event.target.closest('[data-equipment]');
    if (!button || button.disabled) return;
    setSlot(button.dataset.equipment);
    openDialog('parts-dialog', `tab-${activeSlot}`);
  }

  /** 같은 주소의 다른 창에서 변경한 진행을 반영함. 결과가 없어진 경우 열린 결과 창도 닫음. */
  function handleStorage(event) {
    if (event.key !== storageKey) return;
    state = Game.restoreState(event.newValue);
    render();
    if (!state.completed) closeDialog('result-dialog');
    showToast('다른 창의 진행을 반영했어요.');
  }

  byId('open-missions').addEventListener('click', handleOpenMissions);
  byId('mission-list').addEventListener('click', handleMissionClick);
  byId('parts-grid').addEventListener('click', handlePartClick);
  byId('collect').addEventListener('click', handleCollect);
  byId('dispatch').addEventListener('click', handlePrimaryAction);
  byId('open-result').addEventListener('click', handleOpenResult);
  byId('next-mission').addEventListener('click', handleNextMission);
  byId('part-tabs').addEventListener('click', handleTabClick);
  byId('part-tabs').addEventListener('keydown', handleTabKey);
  byId('equipment-summary').addEventListener('click', handleEquipmentClick);
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', handleDialogClick);
    dialog.addEventListener('close', handleDialogClose);
  }
  window.addEventListener('storage', handleStorage);
  render();
})();
