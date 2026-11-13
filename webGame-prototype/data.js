/** 부품·미션·테스트 설정을 브라우저와 Node.js에 함께 제공함. */
(function exposeData(root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.YesRainData = data;
})(globalThis, function createData() {
  'use strict';

  // 테스트 단계에서는 새 시작과 기존 진행 모두 전체 부품을 지급함.
  // false로 바꾸면 시작 부품과 기존 보유 목록을 사용하는 수집 방식으로 돌아감.
  const SETTINGS = { unlockAllParts: true };
  const STARTER_PARTS = ['dog', 'hand', 'road', 'legs', 'cargo'];
  const DEFAULT_EQUIPMENT = { body: 'dog', arm: 'hand', base: 'road' };
  const SLOTS = { body: '몸통', arm: '팔·장비', base: '이동 장치' };

  // 부품 ID는 저장 데이터와 연결됨. 기존 ID는 유지하고 새 부품은 새 ID로 추가함.
  // slot: 장착 위치 / traits: 미션 조건과 비교 / type: app.js 그림 종류.
  // color: 그림 색 / name·note: 화면에 표시할 이름과 설명.
  // 특성과 보상은 게임용 임시값임. 실제 로봇 성능을 뜻하지 않음.
  const PARTS = {
    // 몸통
    dog: {
      slot: 'body',
      name: '낮은 로봇개 몸통',
      traits: ['낮은 차체', '좁은 통로'],
      color: '#cde986',
      type: 'dog',
      note: '몸을 낮춰 좁은 공간으로.'
    },
    heavy: {
      slot: 'body',
      name: '운반차 몸통',
      traits: ['무거운 짐', '안정 적재'],
      color: '#e4b082',
      type: 'heavy',
      note: '묵직한 물건을 안정적으로.'
    },
    humanoid: {
      slot: 'body',
      name: '휴머노이드 몸통',
      traits: ['직립 자세', '구조 신호'],
      color: '#b5c9f0',
      type: 'humanoid',
      note: '사람과 비슷한 자세로 함께.'
    },
    drone: {
      slot: 'body',
      name: '드론 몸통',
      traits: ['공중 탐색', '구조 신호'],
      color: '#d3c0ed',
      type: 'drone',
      note: '위에서 살피고 위치를 알려요.'
    },
    sealed: {
      slot: 'body',
      name: '방수 몸통',
      traits: ['방수', '낮은 무게중심'],
      color: '#93d4d0',
      type: 'sealed',
      note: '물과 진흙 속에서 쓰는 차체.'
    },
    companion: {
      slot: 'body',
      name: '고양이 친구 몸통',
      traits: ['친근한 외형', '표정 표현'],
      color: '#e6b8cb',
      type: 'companion',
      note: '귀여운 귀와 표정으로 인사해요.'
    },
    // 팔·장비
    hand: {
      slot: 'arm',
      name: '휴머노이드 팔',
      traits: ['정밀 작업', '정밀 집기'],
      color: '#dceac3',
      type: 'hand',
      note: '작은 물건도 조심스럽게.'
    },
    cargo: {
      slot: 'arm',
      name: '구조용 운반 받침대',
      traits: ['안전 운반', '조명'],
      color: '#f0c38a',
      type: 'cargo',
      note: '불을 밝히고 안전하게 데려와요.'
    },
    claw: {
      slot: 'arm',
      name: '탐지 집게',
      traits: ['정밀 집기', '금속 탐지'],
      color: '#edc598',
      type: 'claw',
      note: '금속을 찾아 집어 올려요.'
    },
    sensor: {
      slot: 'arm',
      name: '구조 탐색 센서',
      traits: ['장애물 감지', '열원 감지'],
      color: '#d1bcf4',
      type: 'sensor',
      note: '장애물과 사람의 흔적을 살펴요.'
    },
    lidar: {
      slot: 'arm',
      name: '라이다 균형 장치',
      traits: ['거리 감지', '균형 제어'],
      color: '#a9c8f5',
      type: 'lidar',
      note: '주변 거리를 읽고 자세를 잡아요.'
    },
    conversation: {
      slot: 'arm',
      name: '듣고 말하는 대화 모듈',
      traits: ['음성 인식', '대화'],
      color: '#ebbdce',
      type: 'conversation',
      note: '이야기를 듣고 다정하게 답해요.'
    },
    // 이동 장치
    road: {
      slot: 'base',
      name: '자동차 바퀴',
      traits: ['평지 속도', '포장길 이동'],
      color: '#bccaa1',
      type: 'road',
      note: '평평한 길을 빠르게 달려요.'
    },
    legs: {
      slot: 'base',
      name: '휴머노이드 다리',
      traits: ['보행', '계단 이동'],
      color: '#b9c8ec',
      type: 'legs',
      note: '두 다리로 한 걸음씩.'
    },
    terrain: {
      slot: 'base',
      name: '울퉁불퉁한 바퀴',
      traits: ['험지 주행', '충격 완화'],
      color: '#dfc392',
      type: 'terrain',
      note: '자갈과 요철을 넘어가요.'
    },
    spider: {
      slot: 'base',
      name: '거미형 다리',
      traits: ['접지압 분산', '갯벌 이동'],
      color: '#c3d69c',
      type: 'spider',
      note: '여러 다리로 넓게 디뎌요.'
    },
    track: {
      slot: 'base',
      name: '광폭 무한궤도',
      traits: ['접지압 분산', '갯벌 이동'],
      color: '#a6c8ad',
      type: 'track',
      note: '넓은 접촉면으로 진흙 위를.'
    },
    propeller: {
      slot: 'base',
      name: '비행 프로펠러',
      traits: ['비행', '정지 비행'],
      color: '#c8b9ed',
      type: 'propeller',
      note: '떠오르고 한자리에 머물러요.'
    },
    underwater: {
      slot: 'base',
      name: '수중 추진기',
      traits: ['잠수 이동', '수중 자세 제어'],
      color: '#8bd6d3',
      type: 'underwater',
      note: '물속으로 내려가 방향을 잡아요.'
    },
    quiet: {
      slot: 'base',
      name: '저소음 바퀴',
      traits: ['조용한 이동', '부드러운 주행'],
      color: '#e6c3ce',
      type: 'road',
      note: '쉬는 시간을 방해하지 않게.'
    }
  };

  // 요구 조건 needs는 위 부품의 traits와 같은 문자열을 사용함.
  const MISSIONS = [
    {
      id: 'cave',
      title: '동굴 속 작은 구조',
      place: '낮은 동굴',
      icon: 'cave',
      tag: '구조',
      text: '천장이 아주 낮은 동굴에 강아지가 갇혔어요. 안쪽을 밝히고, 좁은 길을 지나 안전하게 데려와 주세요.',
      needs: ['낮은 차체', '좁은 통로', '조명', '안전 운반'],
      hint: '높이가 낮은 몸통과 구조 장비를 살펴보세요.'
    },
    {
      id: 'mud',
      title: '갯벌에 빠진 휴대폰',
      place: '해안 갯벌',
      icon: 'mud',
      tag: '회수',
      text: '갯벌에 휴대폰이 빠졌어요. 진흙에 깊이 빠지지 않도록 넓게 디디고, 휴대폰을 조심스럽게 집어 주세요.',
      needs: ['접지압 분산', '갯벌 이동', '정밀 집기', '방수'],
      hint: '거미형 다리와 광폭 무한궤도, 두 방법을 시험해 보세요.'
    },
    {
      id: 'rubble',
      title: '무너진 건물의 구조 신호',
      place: '건물 잔해',
      icon: 'rubble',
      tag: '탐색',
      text: '건물 잔해 안쪽에 사람이 있어요. 드론으로 접근해 장애물을 피하고, 사람의 흔적과 위치를 찾아 구조 신호를 보내 주세요.',
      needs: ['비행', '장애물 감지', '열원 감지', '구조 신호'],
      hint: '비행 장치와 탐색 센서가 함께 필요해요.'
    },
    {
      id: 'escort',
      title: '오늘의 하원 도우미',
      place: '학교 앞 하원길',
      icon: 'walking',
      tag: '동행',
      text: '갑작스러운 야근으로 보호자가 아이의 하원길에 함께할 수 없어요. 사람처럼 걷고, 주변 거리를 살피며 아이와 나란히 이동할 로봇을 만들어 주세요.',
      needs: ['직립 자세', '보행', '거리 감지', '균형 제어'],
      hint: '휴머노이드 몸통·다리와 라이다 장치를 조합해 보세요.'
    },
    {
      id: 'pool',
      title: '수영장 바닥의 반짝임',
      place: '수영장',
      icon: 'pool',
      tag: '회수',
      text: '소중한 반지가 수영장 바닥으로 가라앉았어요. 물속으로 내려가 금속을 찾고, 작은 반지를 집어 올려 주세요.',
      needs: ['방수', '잠수 이동', '금속 탐지', '정밀 집기'],
      hint: '방수 몸통, 수중 이동 장치, 탐지 집게가 잘 어울려요.'
    },
    {
      id: 'comfort',
      title: '잠깐 쉬어도 괜찮아',
      place: '학생 휴게실',
      icon: 'comfort',
      tag: '교감',
      text: '공부 스트레스로 지친 학생에게 잠깐의 쉼이 필요해요. 귀여운 모습으로 다가가 말을 듣고, 다정하게 대화할 로봇 친구를 만들어 주세요.',
      needs: ['친근한 외형', '음성 인식', '대화', '조용한 이동'],
      hint: '고양이 친구 몸통, 대화 모듈과 저소음 바퀴를 살펴보세요.'
    }
  ];

  return { SETTINGS, STARTER_PARTS, DEFAULT_EQUIPMENT, SLOTS, PARTS, MISSIONS };
});
