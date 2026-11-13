const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Game = require('./game.js');
const Data = require('./data.js');

/** 전체 지급 전의 저장값과 수집 상태를 재현함. 이전 버전의 시작 부품 5개를 그대로 사용함. */
function legacyState() {
  return { ...Game.createState(), owned: ['dog', 'hand', 'road', 'legs', 'cargo'] };
}

/** 모든 부품을 보유한 상태에서 지정한 조립과 미션을 준비함. */
function preparedState(missionId, body, arm, base) {
  return { ...Game.createState(), missionId, owned: Object.keys(Game.PARTS), equipped: { body, arm, base } };
}

const solutions = [
  ['cave', 'dog', 'cargo', 'road'],
  ['mud', 'sealed', 'hand', 'spider'],
  ['rubble', 'drone', 'sensor', 'propeller'],
  ['escort', 'humanoid', 'lidar', 'legs'],
  ['pool', 'sealed', 'claw', 'underwater'],
  ['comfort', 'companion', 'conversation', 'quiet']
];

// 미션별로 실제 조합이 전체 조건을 충족하는지 확인함.
for (const [missionId, body, arm, base] of solutions) {
  test(`${missionId}: 부품 조합으로 모든 조건 충족 및 60코인 지급`, () => {
    const state = preparedState(missionId, body, arm, base);
    const result = Game.dispatch(state);
    assert.equal(result.coins, 60);
    assert.equal(result.result.matched.length, Game.MISSIONS.find(mission => mission.id === missionId).needs.length);
    assert.deepEqual(result.result.missing, []);
    assert.deepEqual(result.owned, state.owned);
  });
}

test('일부 조건만 충족하면 25코인, 전부 부족하면 0코인 지급', () => {
  assert.equal(Game.dispatch(Game.createState()).coins, 25);
  const unsuitable = preparedState('cave', 'sealed', 'claw', 'underwater');
  const result = Game.dispatch(unsuitable);
  assert.equal(result.coins, 0);
  assert.equal(result.result.missing.length, 4);
});

test('갯벌 미션은 거미형 다리와 광폭 무한궤도 모두 사용 가능', () => {
  for (const base of ['spider', 'track']) {
    assert.equal(Game.dispatch(preparedState('mud', 'sealed', 'claw', base)).coins, 60);
  }
});

test('동일 파견을 반복 요청해도 보상 추가 없음', () => {
  const completed = Game.dispatch(preparedState('cave', 'dog', 'cargo', 'road'));
  assert.strictEqual(Game.dispatch(completed), completed);
  assert.equal(completed.coins, 60);
  assert.equal(Game.selectMission(completed, completed.missionId).completed, true);
});

test('새로고침에 해당하는 저장 복원 뒤에도 완료 보상은 추가되지 않음', () => {
  const completed = Game.dispatch(preparedState('pool', 'sealed', 'claw', 'underwater'));
  const restored = Game.restoreState(JSON.stringify(completed));
  assert.equal(restored.completed, true);
  assert.equal(Game.dispatch(restored).coins, 60);
  assert.deepEqual(restored.result, completed.result);
});

test('다음 미션에서는 부품을 재사용하고 새 파견의 보상을 받을 수 있음', () => {
  const completed = Game.dispatch(preparedState('cave', 'dog', 'cargo', 'road'));
  const next = Game.nextMission(completed);
  assert.equal(next.result, null);
  assert.equal(next.completed, false);
  assert.equal(next.run, completed.run + 1);
  assert.deepEqual(next.owned, completed.owned);
  assert.deepEqual(next.equipped, completed.equipped);
  const ready = Game.equip(Game.equip(Game.equip(next, 'sealed'), 'claw'), 'track');
  assert.equal(Game.dispatch(ready).coins, 120);
});

test('완료한 파견의 조립은 고정되고 다음 미션에서 변경 가능', () => {
  const completed = Game.dispatch(preparedState('cave', 'dog', 'cargo', 'road'));
  assert.strictEqual(Game.equip(completed, 'claw'), completed);
  assert.equal(Game.equip(Game.nextMission(completed), 'claw').equipped.arm, 'claw');
});

test('없는 부품과 알 수 없는 부품·미션은 상태를 변경하지 않음', () => {
  const initial = legacyState();
  assert.strictEqual(Game.equip(initial, 'sealed'), initial);
  assert.strictEqual(Game.equip(initial, 'constructor'), initial);
  assert.strictEqual(Game.selectMission(initial, 'unknown'), initial);
});

test('보급은 매번 미보유 부품을 지급하고 전부 찾으면 종료됨', () => {
  let state = legacyState();
  const expected = Object.keys(Game.PARTS).length;
  while (state.owned.length < expected) {
    const found = Game.collect(state, 0.5);
    assert.ok(!state.owned.includes(found.partId));
    assert.equal(found.state.owned.length, state.owned.length + 1);
    state = found.state;
  }
  assert.equal(new Set(state.owned).size, expected);
  assert.deepEqual(Game.collect(state), { state, partId: null });
});

test('보급 난수의 경곗값도 유효한 부품으로 처리됨', () => {
  for (const roll of [-1, 0, 1, 10, NaN, Infinity]) {
    assert.ok(Object.hasOwn(Game.PARTS, Game.collect(legacyState(), roll).partId));
  }
});

test('조립·선택 미션·보유 부품·잔액을 저장하고 복원함', () => {
  const state = Game.selectMission(Game.equip(Game.createState(), 'cargo'), 'escort');
  assert.deepEqual(Game.restoreState(JSON.stringify(state)), state);
});

test('저장된 결과 문구를 신뢰하지 않고 실제 파견 조건으로 결과 복원', () => {
  const completed = Game.dispatch(preparedState('cave', 'dog', 'cargo', 'road'));
  completed.result = { reward: 9999, matched: ['잘못된 조건'] };
  const restored = Game.restoreState(JSON.stringify(completed));
  assert.equal(restored.result.reward, 60);
  assert.equal(restored.result.matched.length, 4);
  assert.equal(restored.coins, 60);
});

test('손상·이전 버전·잘못된 슬롯·음수 잔액은 안전한 시작 상태로 복구', () => {
  const initial = Game.createState();
  const invalid = [
    null, '{broken', '[]', 'null',
    JSON.stringify({ ...initial, version: 99 }),
    JSON.stringify({ ...initial, coins: -1 }),
    JSON.stringify({ ...initial, coins: 1.5 }),
    JSON.stringify({ ...initial, run: 0 }),
    JSON.stringify({ ...initial, completed: 'false' }),
    JSON.stringify({ ...initial, missionId: 'unknown' }),
    JSON.stringify({ ...initial, owned: ['constructor', 'hand', 'road'] }),
    JSON.stringify({ ...initial, owned: [...initial.owned, 'dog'] }),
    JSON.stringify({ ...initial, equipped: { body: 'hand', arm: 'dog', base: 'road' } }),
    JSON.stringify({ ...legacyState(), equipped: { body: 'sealed', arm: 'hand', base: 'road' } })
  ];
  for (const data of invalid) assert.deepEqual(Game.restoreState(data), initial);
});

test('테스트 시작 시 데이터 목록의 모든 부품을 지급하고 장착할 수 있음', () => {
  const state = Game.createState();
  assert.deepEqual(state.owned, Object.keys(Data.PARTS));
  for (const [id, part] of Object.entries(Data.PARTS)) {
    assert.equal(Game.equip(state, id).equipped[part.slot], id);
  }
});

test('기존 저장 복원 시 전체 부품을 지급하면서 코인·조립·미션·완료 보상은 유지', () => {
  const legacy = legacyState();
  legacy.coins = 85;
  legacy.equipped = { body: 'dog', arm: 'cargo', base: 'legs' };
  const completed = Game.dispatch(legacy);
  const restored = Game.restoreState(JSON.stringify(completed));
  assert.deepEqual(restored.owned, Object.keys(Data.PARTS));
  assert.equal(restored.coins, completed.coins);
  assert.deepEqual(restored.equipped, completed.equipped);
  assert.equal(restored.missionId, completed.missionId);
  assert.equal(restored.run, completed.run);
  assert.equal(restored.completed, true);
  assert.deepEqual(restored.result, completed.result);
  assert.equal(Game.dispatch(restored).coins, completed.coins);
});

test('목록에 새 부품을 추가하면 새 시작과 기존 진행에 자동 지급됨', () => {
  Data.PARTS.testWheel = { ...Data.PARTS.road, name: '추가 부품 테스트' };
  try {
    assert.ok(Game.createState().owned.includes('testWheel'));
    const restored = Game.restoreState(JSON.stringify({ ...legacyState(), coins: 85 }));
    assert.ok(restored.owned.includes('testWheel'));
    assert.equal(restored.coins, 85);
  } finally {
    delete Data.PARTS.testWheel;
  }
});

test('전체 지급 설정을 끄면 시작 부품과 기존 보유 목록을 사용하는 수집 방식 유지', () => {
  Data.SETTINGS.unlockAllParts = false;
  try {
    assert.deepEqual(Game.createState().owned, Data.STARTER_PARTS);
    const collected = Game.collect(Game.createState(), 0).state;
    assert.deepEqual(Game.restoreState(JSON.stringify(collected)), collected);
  } finally {
    Data.SETTINGS.unlockAllParts = true;
  }
});

test('브라우저용 전역 모듈 경로도 같은 데이터로 전체 부품을 지급함', () => {
  const browserGlobals = vm.createContext({});
  for (const file of ['./data.js', './game.js']) {
    vm.runInContext(fs.readFileSync(require.resolve(file), 'utf8'), browserGlobals);
  }
  const game = browserGlobals.YesRainGame;
  assert.equal(game.PARTS, browserGlobals.YesRainData.PARTS);
  assert.equal(game.createState().owned.length, Object.keys(Data.PARTS).length);
  assert.equal(game.createState().missionId, Data.MISSIONS[0].id);
});
