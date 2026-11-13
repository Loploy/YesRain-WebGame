/** 브라우저와 Node.js에서 동일한 게임 규칙을 사용하도록 공개함. */
(function exposeGame(root, factory) {
  const data = typeof module === 'object' && module.exports ? require('./data.js') : root.YesRainData;
  const game = factory(data);
  if (typeof module === 'object' && module.exports) module.exports = game;
  else root.YesRainGame = game;
})(globalThis, function createGame(Data) {
  'use strict';

  const { SETTINGS, STARTER_PARTS, DEFAULT_EQUIPMENT, SLOTS, PARTS, MISSIONS } = Data;

  /** 현재 프로토타입에서 제공하는 부품인지 확인함. */
  function hasPart(id) {
    return Object.hasOwn(PARTS, id);
  }

  /** 테스트 설정에 따라 전체 부품 또는 시작 부품을 지급함. 반환 배열은 원본 목록과 분리함. */
  function startingParts() {
    return SETTINGS.unlockAllParts ? Object.keys(PARTS) : [...STARTER_PARTS];
  }

  /** 초기 설정으로 새 진행 생성. 추가한 부품도 테스트 단계에서는 자동으로 지급됨. */
  function createState() {
    return { version: 1, coins: 0, owned: startingParts(), equipped: { ...DEFAULT_EQUIPMENT }, missionId: MISSIONS[0].id, run: 1, completed: false, result: null };
  }

  /** 조립 특성과 요구 조건을 비교함. 일부 충족은 25, 모두 충족은 60 테스트 코인 지급. */
  function evaluate(equipped, missionId) {
    const mission = MISSIONS.find(mission => mission.id === missionId);
    if (!mission) throw new Error('알 수 없는 미션임');
    const traits = new Set(Object.keys(SLOTS).flatMap(slot => {
      const part = PARTS[equipped[slot]];
      return part && part.slot === slot ? part.traits : [];
    }));
    const matched = mission.needs.filter(need => traits.has(need));
    const missing = mission.needs.filter(need => !traits.has(need));
    const reward = missing.length === 0 ? 60 : matched.length > 0 ? 25 : 0;
    return { matched, missing, reward };
  }

  /** 파견 당시 조립과 판정을 결과에 고정함. 이후 미션 결과와 섞이지 않게 함. */
  function makeResult(state) {
    return { missionId: state.missionId, run: state.run, equipped: { ...state.equipped }, ...evaluate(state.equipped, state.missionId) };
  }

  /** 저장된 진행을 복원함. 테스트 단계에서는 코인·조립·완료 상태를 유지하며 전체 부품을 지급함. */
  function restoreState(serialized) {
    try {
      const saved = JSON.parse(serialized);
      if (!saved || saved.version !== 1 || !Number.isSafeInteger(saved.coins) || saved.coins < 0 || !Number.isSafeInteger(saved.run) || saved.run < 1 || typeof saved.completed !== 'boolean') return createState();
      if (!MISSIONS.some(mission => mission.id === saved.missionId) || !Array.isArray(saved.owned) || new Set(saved.owned).size !== saved.owned.length || !saved.owned.every(hasPart)) return createState();
      if (!saved.equipped || !Object.keys(SLOTS).every(slot => saved.owned.includes(saved.equipped[slot]) && PARTS[saved.equipped[slot]].slot === slot)) return createState();
      const equipped = Object.fromEntries(Object.keys(SLOTS).map(slot => [slot, saved.equipped[slot]]));
      const state = { version: 1, coins: saved.coins, owned: SETTINGS.unlockAllParts ? startingParts() : [...saved.owned], equipped, missionId: saved.missionId, run: saved.run, completed: saved.completed, result: null };
      if (state.completed) state.result = makeResult(state);
      return state;
    } catch {
      return createState();
    }
  }

  /** 보유한 부품만 해당 슬롯에 장착함. 완료한 파견의 조립은 다음 의뢰에서 변경함. */
  function equip(state, partId) {
    if (state.completed || !hasPart(partId) || !state.owned.includes(partId)) return state;
    return { ...state, equipped: { ...state.equipped, [PARTS[partId].slot]: partId } };
  }

  /** 다른 미션을 선택하면 새 파견을 준비함. 같은 미션 카드를 눌러 보상을 초기화하지 않음. */
  function selectMission(state, missionId) {
    if (missionId === state.missionId || !MISSIONS.some(mission => mission.id === missionId)) return state;
    return { ...state, missionId, run: state.run + 1, completed: false, result: null };
  }

  /** 한 파견에는 한 번만 보상을 지급함. 새 파견에서는 같은 부품을 다시 사용할 수 있음. */
  function dispatch(state) {
    if (state.completed) return state;
    const result = makeResult(state);
    return { ...state, coins: Math.min(Number.MAX_SAFE_INTEGER, state.coins + result.reward), completed: true, result };
  }

  /** 다음 미션으로 이동해 결과와 파견 완료 상태만 초기화함. 보유 부품과 코인은 유지됨. */
  function nextMission(state) {
    const index = MISSIONS.findIndex(mission => mission.id === state.missionId);
    return selectMission(state, MISSIONS[(index + 1) % MISSIONS.length].id);
  }

  /** 아직 없는 부품 하나를 테스트 보급으로 지급함. roll은 재현 가능한 단위 테스트에 사용함. */
  function collect(state, roll = Math.random()) {
    const remaining = Object.keys(PARTS).filter(id => !state.owned.includes(id));
    if (!remaining.length) return { state, partId: null };
    const safeRoll = Number.isFinite(roll) ? Math.max(0, Math.min(0.999999, roll)) : 0;
    const partId = remaining[Math.floor(safeRoll * remaining.length)];
    return { state: { ...state, owned: [...state.owned, partId] }, partId };
  }

  return { SLOTS, PARTS, MISSIONS, createState, restoreState, evaluate, equip, selectMission, dispatch, nextMission, collect };
});
