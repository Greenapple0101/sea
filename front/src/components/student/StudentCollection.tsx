import { useState, useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { useAuth } from "../../contexts/AppContext";
import { get } from "../../utils/api";
import { FishIcon } from '../FishIcon';
import { FishAnimation } from '../FishAnimation';
import { FISH_ICONS } from '../../utils/sprite-helpers';

type FishGrade = 'COMMON' | 'RARE' | 'LEGENDARY';

interface AquariumFishItem {
  entry_id: number;
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  fish_count: number;
}

interface EncyclopediaFishItem {
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  is_collected: boolean;
  fish_count: number;
}

interface UIFish {
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  current_count: number;
  is_owned: boolean;
  size: number;
}

const getGradeColor = (grade: FishGrade) => {
  switch (grade) {
    case 'COMMON': return "var(--color-gray-400)";
    case 'RARE': return "var(--color-blue-500)";
    case 'LEGENDARY': return "var(--color-yellow-600)";
    default: return "var(--color-black)";
  }
};

const getFishSize = (grade: FishGrade) => {
  switch (grade) {
    case 'LEGENDARY': return 3;
    case 'RARE': return 2;
    default: return 2;
  }
};

export function StudentCollection() {
  const { user, isAuthenticated, userType, access_token } = useAuth();
  const [currentView, setCurrentView] = useState<'aquarium' | 'book'>('aquarium');
  const [fishList, setFishList] = useState<UIFish[]>([]);
  const [aquariumInstances, setAquariumInstances] = useState<{ id: string; fish: UIFish }[]>([]);
  const [selectedFish, setSelectedFish] = useState<UIFish | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [stats, setStats] = useState({ current: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fishTankRef = useRef<HTMLDivElement | null>(null);
  const bubbleContainerRef = useRef<HTMLDivElement | null>(null);
  const BASE_SPRITE_SIZE = 24;

  const bubbleFrequency = 400;
  const bubbleRiseMinSpeed = 50;
  const bubbleRiseMaxSpeed = 80;
  const bubbleMinSize = 4;
  const bubbleMaxSize = 8;

  // API 호출 함수
  const fetchData = async () => {
    if (!access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      if (currentView === 'aquarium') {
        const response = await get('/api/v1/collection/aquarium');
        if (!response.ok) throw new Error('수족관 정보를 불러오는데 실패했습니다.');
        const resJson = await response.json();
        const data = resJson.data;

        const converted: UIFish[] = (data.collected_fish as AquariumFishItem[]).map(item => ({
          fish_id: item.fish_id,
          fish_name: item.fish_name,
          grade: item.grade as FishGrade,
          current_count: item.fish_count,
          is_owned: true,
          size: getFishSize(item.grade as FishGrade)
        }));

        setFishList(converted);
        setStats({ current: converted.length, total: 0 }); // 수족관은 종류 수만 표시하거나 총 마리수 표시

      } else {
        // 도감 조회
        const response = await get('/api/v1/collection/encyclopedia');
        if (!response.ok) throw new Error('도감 정보를 불러오는데 실패했습니다.');
        const resJson = await response.json();
        const data = resJson.data;

        const converted: UIFish[] = (data.fish_list as EncyclopediaFishItem[]).map(item => ({
          fish_id: item.fish_id,
          fish_name: item.fish_name,
          grade: item.grade as FishGrade,
          current_count: item.fish_count,
          is_owned: item.is_collected,
          size: getFishSize(item.grade as FishGrade)
        }));

        setFishList(converted);
        setStats({ current: data.collected_count, total: data.total_fish });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFishSprite = (fish: UIFish, scaleOverride?: number) => {
    const finalScale = scaleOverride ?? fish.size;
    const finalSize = finalScale * BASE_SPRITE_SIZE;
    const spriteInfo = FISH_ICONS[fish.fish_id];
    const isAnimated = spriteInfo?.isAnimated;
    const animationData = spriteInfo?.animation;

    const IconComponent = isAnimated && animationData ? (
      <FishAnimation
        spriteUrl={animationData.url}
        totalFrames={animationData.frames}
        scale={finalScale}
        duration={animationData.duration}
      />
    ) : (
      <FishIcon
        fishId={fish.fish_id}
        scale={finalScale}
      />
    );

    return (
      <div style={{
        width: `${finalSize}px`,
        height: `${finalSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {IconComponent}
      </div>
    );
  };

  useEffect(() => {
    if (isAuthenticated && userType === 'student') {
      fetchData();
    }
  }, [isAuthenticated, userType, access_token, currentView]);

  const handleFishClick = (fish: UIFish) => {
    setSelectedFish(fish);
    setIsDetailOpen(true);
  };

  useEffect(() => {
    if (currentView !== "aquarium" || isLoading || error) return;

    const instances: { id: string; fish: UIFish }[] = [];
    fishList.forEach((fish, fishIndex) => {
      Array.from({ length: fish.current_count }).forEach((_, countIndex) => {
        instances.push({
          id: `${fish.fish_id}-${fishIndex}-${countIndex}`, // 고유 키 생성
          fish: fish,
        });
      });
    });

    setAquariumInstances(instances);

    const cleanup = () => {
      const tank = fishTankRef.current;
      if (tank) {
        const fishElements = Array.from(tank.children) as HTMLElement[];
        fishElements.forEach(fish => clearTimeout((fish as any).moveTimer));
      }
    };
    return cleanup;

  }, [currentView, fishList, isLoading])

  useEffect(() => {
    if (currentView !== "aquarium" || aquariumInstances.length === 0) return;

    const tank = fishTankRef.current;
    if (!tank) return;

    const fishElements = Array.from(tank.children) as HTMLElement[];
    fishElements.forEach(fishContainer => {
      setRandomPosition(fishContainer, tank);
      moveFishRandomly(fishContainer, tank);
    });

  }, [aquariumInstances]);

  function setRandomPosition(fish: HTMLElement, tank: HTMLDivElement) {
    const rect = tank.getBoundingClientRect();
    const padding = 10;
    fish.style.left = Math.random() * (rect.width - fish.offsetWidth - padding * 2) + padding + "px";
    fish.style.top = Math.random() * (rect.height - fish.offsetHeight - padding * 2) + padding + "px";
  }

  function moveFishRandomly(fish: HTMLElement, tank: HTMLDivElement) {
    const animate = () => {
      const rect = tank.getBoundingClientRect();
      const currentLeft = parseFloat(fish.style.left) || 0;
      const padding = 10;
      const newX = Math.random() * (rect.width - fish.offsetWidth - padding * 2) + padding;
      const newY = Math.random() * (rect.height - fish.offsetWidth - padding * 2) + padding;

      const minDuration = 4;
      const maxDuration = 8;
      const duration = Math.random() * (maxDuration - minDuration) + minDuration;

      fish.style.transform = newX > currentLeft ? "scaleX(1)" : "scaleX(-1)";
      fish.style.transition = `left ${duration}s ease-in-out, top ${duration}s ease-in-out`;
      fish.style.left = `${newX}px`;
      fish.style.top = `${newY}px`;

      if ((fish as any).moveTimer) clearTimeout((fish as any).moveTimer);

      const pauseTime = Math.random() * 500;
      (fish as any).moveTimer = setTimeout(animate, (duration * 1000) + pauseTime);
    };
    animate();
  }

  const getRarityBadge = (grade: FishGrade) => {
    let bgClass = "bg-gray-400";
    if (grade === 'RARE') bgClass = "bg-blue-500";
    if (grade === 'LEGENDARY') bgClass = "bg-yellow-600";

    return <Badge className={bgClass}>{grade}</Badge>;
  };

  useEffect(() => {
    if (currentView !== 'aquarium' || !fishTankRef.current || !bubbleContainerRef.current) return;

    const tank = fishTankRef.current;
    const bubbleContainer = bubbleContainerRef.current;

    const containerWidth = tank.offsetWidth;
    const containerHeight = tank.offsetHeight;

    const createBubble = () => {
      // 1. DOM 요소 생성 및 스타일링
      const bubble = document.createElement('div');
      bubble.className = 'bubble-sprite';

      const size = bubbleMinSize + Math.random() * (bubbleMaxSize - bubbleMinSize);
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * (containerWidth - size)}px`;
      bubble.style.bottom = '0px';
      bubble.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
      bubble.style.position = 'absolute';

      bubbleContainer.appendChild(bubble);

      let y = 0;
      const intervalSpeed = bubbleRiseMinSpeed + Math.random() * (bubbleRiseMaxSpeed - bubbleRiseMinSpeed);

      // 2. 기포 상승 애니메이션 (setInterval)
      const riseInterval = setInterval(() => {
        y += 2; // 매 틱마다 2px씩 상승
        bubble.style.bottom = `${y}px`;

        // 3. 제거 조건 (상단 경계를 벗어나면)
        if (y > containerHeight) {
          clearInterval(riseInterval);
          bubble.remove();
        }
      }, intervalSpeed);

      // 안전을 위해 interval ID를 요소에 저장
      (bubble as any).riseInterval = riseInterval;
    };

    // 4. 기포 생성 간격 설정
    const generationInterval = setInterval(createBubble, bubbleFrequency);

    // 5. 클린업 (컴포넌트 언마운트/뷰 변경 시 정리)
    return () => {
      clearInterval(generationInterval);

      // 현재 남아있는 모든 기포의 interval 정리 및 DOM에서 제거
      const existingBubbles = Array.from(bubbleContainer.children) as HTMLElement[];
      existingBubbles.forEach(b => {
        if ((b as any).riseInterval) clearInterval((b as any).riseInterval);
        b.remove();
      });
    };

  }, [currentView, fishList]);

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }
  if (isLoading) return <div className="p-4">컬렉션 정보 로딩 중...</div>;
  if (error) return <div className="p-4" style={{ color: "red" }}>오류: {error}</div>;

  return (
    <div className="retro-layout p-4 space-y-4 pb-20 max-w-screen-xl mx-auto" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
      <menu role="tablist">
        <li role="tab" aria-selected={currentView === 'aquarium'}>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('aquarium'); }}>수족관</a>
        </li>
        <li role="tab" aria-selected={currentView === 'book'}>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('book'); }}>도감</a>
        </li>
      </menu>

      {/* 메인 윈도우 */}
      <div className="window" role="tabpanel" style={{ width: "100%" }}>
        <div className="window-body">

          {/* 수족관 뷰 */}
          {currentView === 'aquarium' && (
            <>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                내 수족관: 총 {fishList.reduce((acc, cur) => acc + cur.current_count, 0)}마리 헤엄치는 중
              </div>

              <div
                className="sunken-panel"
                style={{ width: "100%", height: "400px", backgroundImage: "var(--fg-aquarium), var(--bg-aquarium)", backgroundRepeat: "repeat-x, repeat", backgroundPosition: "bottom, center", position: "relative", overflow: "hidden" }}
                ref={fishTankRef}
              >
                <div
                  ref={bubbleContainerRef}
                  style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                />
                {/* 수조 내부 */}
                {aquariumInstances.map(({ id, fish }) => {
                  const finalSize = fish.size * BASE_SPRITE_SIZE;
                  return (
                    <div
                      key={id}
                      onClick={() => handleFishClick(fish)}
                      style={{
                        position: "absolute",
                        width: `${finalSize}px`,
                        height: `${finalSize}px`,
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    >
                      {renderFishSprite(fish)}
                    </div>
                  );
                })}
              </div>
              <style>{`
        .bubble-sprite {
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
            transition: opacity 0.3s;
        }
      `}</style>
            </>
          )}

          {/* 도감 뷰 */}
          {currentView === 'book' && (
            <>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                수집 진행도: {stats.current} / {stats.total} ({((stats.current / stats.total) * 100).toFixed(1)}%)
              </div>

              <div className="sunken-panel" style={{ height: "400px", overflowY: "scroll", padding: "10px", background: "#fff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                  {fishList.map((fish) => (
                    <div
                      key={fish.fish_id}
                      className="window"
                      onClick={() => fish.is_owned && handleFishClick(fish)}
                      style={{
                        cursor: fish.is_owned ? "pointer" : "default",
                        opacity: fish.is_owned ? 1 : 0.5,
                        backgroundColor: fish.is_owned ? "#fff" : "#eee"
                      }}
                    >
                      <div className="window-body" style={{ textAlign: "center", padding: "5px" }}>
                        <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "5px", objectFit: "contain" }}>
                          {fish.is_owned && fish.fish_name !== '???' && FISH_ICONS[fish.fish_id] ? (
                            renderFishSprite(fish, 2)
                          ) : (
                            <span style={{ fontSize: "30px" }}>❓</span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {fish.fish_name}
                        </div>
                        <div style={{ fontSize: "10px", marginTop: "2px", color: getGradeColor(fish.grade) }}>
                          {fish.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* [모달] 물고기 상세 정보 */}
      {isDetailOpen && selectedFish && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '300px' }}>
            <div className="title-bar">
              <div className="title-bar-text">상세 정보</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsDetailOpen(false)} />
              </div>
            </div>
            <div className="window-body text-center">
              <div className="sunken-panel" style={{ width: "100px", height: "100px", margin: "0 auto 10px auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                {renderFishSprite(selectedFish, 2)}
              </div>
              <h4 style={{ margin: "5px 0" }}>{selectedFish.fish_name}</h4>
              <div style={{ marginBottom: "10px" }}>{getRarityBadge(selectedFish.grade)}</div>
              <fieldset>
                <legend>정보</legend>
                <p style={{ fontSize: "12px", margin: "4px 0" }}>보유 수량: {selectedFish.current_count}마리</p>
              </fieldset>
              <div style={{ marginTop: "15px" }}>
                <button onClick={() => setIsDetailOpen(false)}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}