/** 브라우저와 Node.js에서 동일한 게임 규칙을 사용하도록 공개함. */
(function exposeGame(root, factory) {
  const game = factory();
  if (typeof module === 'object' && module.exports) module.exports = game;
  else root.YesRainGame = game;
})(globalThis, function createGame() {
  'use strict';

  const SLOTS = { body: '몸통', arm: '팔·장비', base: '이동 장치' };
  // 미션 조건과 부품 특성은 첫 플레이 검증용 값임. 실제 로봇 성능을 뜻하지 않음.
  const PARTS = {
    dog: { slot: 'body', name: '낮은 로봇개 몸통', traits: ['낮은 차체', '좁은 통로'], color: '#cde986', type: 'dog', note: '몸을 낮춰 좁은 공간으로.' },
    heavy: { slot: 'body', name: '운반차 몸통', traits: ['무거운 짐', '안정 적재'], color: '#e4b082', type: 'heavy', note: '묵직한 물건을 안정적으로.' },
    humanoid: { slot: 'body', name: '휴머노이드 몸통', traits: ['직립 자세', '구조 신호'], color: '#b5c9f0', type: 'humanoid', note: '사람과 비슷한 자세로 함께.' },
    drone: { slot: 'body', name: '드론 몸통', traits: ['공중 탐색', '구조 신호'], color: '#d3c0ed', type: 'drone', note: '위에서 살피고 위치를 알려요.' },
    sealed: { slot: 'body', name: '방수 몸통', traits: ['방수', '낮은 무게중심'], color: '#93d4d0', type: 'sealed', note: '물과 진흙 속에서 쓰는 차체.' },
    companion: { slot: 'body', name: '고양이 친구 몸통', traits: ['친근한 외형', '표정 표현'], color: '#e6b8cb', type: 'companion', note: '귀여운 귀와 표정으로 인사해요.' },
    hand: { slot: 'arm', name: '휴머노이드 팔', traits: ['정밀 작업', '정밀 집기'], color: '#dceac3', type: 'hand', note: '작은 물건도 조심스럽게.' },
    cargo: { slot: 'arm', name: '구조용 운반 받침대', traits: ['안전 운반', '조명'], color: '#f0c38a', type: 'cargo', note: '불을 밝히고 안전하게 데려와요.' },
    claw: { slot: 'arm', name: '탐지 집게', traits: ['정밀 집기', '금속 탐지'], color: '#edc598', type: 'claw', note: '금속을 찾아 집어 올려요.' },
    sensor: { slot: 'arm', name: '구조 탐색 센서', traits: ['장애물 감지', '열원 감지'], color: '#d1bcf4', type: 'sensor', note: '장애물과 사람의 흔적을 살펴요.' },
    lidar: { slot: 'arm', name: '라이다 균형 장치', traits: ['거리 감지', '균형 제어'], color: '#a9c8f5', type: 'lidar', note: '주변 거리를 읽고 자세를 잡아요.' },
    conversation: { slot: 'arm', name: '듣고 말하는 대화 모듈', traits: ['음성 인식', '대화'], color: '#ebbdce', type: 'conversation', note: '이야기를 듣고 다정하게 답해요.' },
    road: { slot: 'base', name: '자동차 바퀴', traits: ['평지 속도', '포장길 이동'], color: '#bccaa1', type: 'road', note: '평평한 길을 빠르게 달려요.' },
    legs: { slot: 'base', name: '휴머노이드 다리', traits: ['보행', '계단 이동'], color: '#b9c8ec', type: 'legs', note: '두 다리로 한 걸음씩.' },
    terrain: { slot: 'base', name: '울퉁불퉁한 바퀴', traits: ['험지 주행', '충격 완화'], color: '#dfc392', type: 'terrain', note: '자갈과 요철을 넘어가요.' },
    spider: { slot: 'base', name: '거미형 다리', traits: ['접지압 분산', '갯벌 이동'], color: '#c3d69c', type: 'spider', note: '여러 다리로 넓게 디뎌요.' },
    track: { slot: 'base', name: '광폭 무한궤도', traits: ['접지압 분산', '갯벌 이동'], color: '#a6c8ad', type: 'track', note: '넓은 접촉면으로 진흙 위를.' },
    propeller: { slot: 'base', name: '비행 프로펠러', traits: ['비행', '정지 비행'], color: '#c8b9ed', type: 'propeller', note: '떠오르고 한자리에 머물러요.' },
    underwater: { slot: 'base', name: '수중 추진기', traits: ['잠수 이동', '수중 자세 제어'], color: '#8bd6d3', type: 'underwater', note: '물속으로 내려가 방향을 잡아요.' },
    quiet: { slot: 'base', name: '저소음 바퀴', traits: ['조용한 이동', '부드러운 주행'], color: '#e6c3ce', type: 'road', note: '쉬는 시간을 방해하지 않게.' }
  };
  const MISSIONS = [
    { id: 'cave', title: '동굴 속 작은 구조', place: '낮은 동굴', icon: 'cave', tag: '구조', text: '천장이 아주 낮은 동굴에 강아지가 갇혔어요. 안쪽을 밝히고, 좁은 길을 지나 안전하게 데려와 주세요.', needs: ['낮은 차체', '좁은 통로', '조명', '안전 운반'], hint: '높이가 낮은 몸통과 구조 장비를 살펴보세요.' },
    { id: 'mud', title: '갯벌에 빠진 휴대폰', place: '해안 갯벌', icon: 'mud', tag: '회수', text: '갯벌에 휴대폰이 빠졌어요. 진흙에 깊이 빠지지 않도록 넓게 디디고, 휴대폰을 조심스럽게 집어 주세요.', needs: ['접지압 분산', '갯벌 이동', '정밀 집기', '방수'], hint: '거미형 다리와 광폭 무한궤도, 두 방법을 시험해 보세요.' },
    { id: 'rubble', title: '무너진 건물의 구조 신호', place: '건물 잔해', icon: 'rubble', tag: '탐색', text: '건물 잔해 안쪽에 사람이 있어요. 드론으로 접근해 장애물을 피하고, 사람의 흔적과 위치를 찾아 구조 신호를 보내 주세요.', needs: ['비행', '장애물 감지', '열원 감지', '구조 신호'], hint: '비행 장치와 탐색 센서가 함께 필요해요.' },
    { id: 'escort', title: '오늘의 하원 도우미', place: '학교 앞 하원길', icon: 'walking', tag: '동행', text: '갑작스러운 야근으로 보호자가 아이의 하원길에 함께할 수 없어요. 사람처럼 걷고, 주변 거리를 살피며 아이와 나란히 이동할 로봇을 만들어 주세요.', needs: ['직립 자세', '보행', '거리 감지', '균형 제어'], hint: '휴머노이드 몸통·다리와 라이다 장치를 조합해 보세요.' },
    { id: 'pool', title: '수영장 바닥의 반짝임', place: '수영장', icon: 'pool', tag: '회수', text: '소중한 반지가 수영장 바닥으로 가라앉았어요. 물속으로 내려가 금속을 찾고, 작은 반지를 집어 올려 주세요.', needs: ['방수', '잠수 이동', '금속 탐지', '정밀 집기'], hint: '방수 몸통, 수중 이동 장치, 탐지 집게가 잘 어울려요.' },
    { id: 'comfort', title: '잠깐 쉬어도 괜찮아', place: '학생 휴게실', icon: 'comfort', tag: '교감', text: '공부 스트레스로 지친 학생에게 잠깐의 쉼이 필요해요. 귀여운 모습으로 다가가 말을 듣고, 다정하게 대화할 로봇 친구를 만들어 주세요.', needs: ['친근한 외형', '음성 인식', '대화', '조용한 이동'], hint: '고양이 친구 몸통, 대화 모듈과 저소음 바퀴를 살펴보세요.' }
  ];

  /** 현재 프로토타입에서 제공하는 부품인지 확인함. */
  function hasPart(id) {
    return Object.hasOwn(PARTS, id);
  }

  /** 저장 데이터와 공유하지 않는 새 시작 상태 생성. */
  function createState() {
    return { version: 1, coins: 0, owned: ['dog', 'hand', 'road', 'legs', 'cargo'], equipped: { body: 'dog', arm: 'hand', base: 'road' }, missionId: 'cave', run: 1, completed: false, result: null };
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

  /** 손상되거나 호환되지 않는 저장값은 시작 상태로 복구함. 완료 보상은 다시 더하지 않음. */
  function restoreState(serialized) {
    try {
      const saved = JSON.parse(serialized);
      if (!saved || saved.version !== 1 || !Number.isSafeInteger(saved.coins) || saved.coins < 0 || !Number.isSafeInteger(saved.run) || saved.run < 1 || typeof saved.completed !== 'boolean') return createState();
      if (!MISSIONS.some(mission => mission.id === saved.missionId) || !Array.isArray(saved.owned) || new Set(saved.owned).size !== saved.owned.length || !saved.owned.every(hasPart)) return createState();
      if (!saved.equipped || !Object.keys(SLOTS).every(slot => saved.owned.includes(saved.equipped[slot]) && PARTS[saved.equipped[slot]].slot === slot)) return createState();
      const equipped = Object.fromEntries(Object.keys(SLOTS).map(slot => [slot, saved.equipped[slot]]));
      const state = { version: 1, coins: saved.coins, owned: [...saved.owned], equipped, missionId: saved.missionId, run: saved.run, completed: saved.completed, result: null };
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
