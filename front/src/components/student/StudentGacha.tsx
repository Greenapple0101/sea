import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { useAuth } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";
import { IMAGES } from '../../styles/images';
import { FishIcon } from '../FishIcon';
import { FishAnimation } from '../FishAnimation';
import { FISH_ICONS } from '../../utils/sprite-helpers';

interface Fish {
  fish_id: number;
  fish_name: string;
  grade: 'COMMON' | 'RARE' | 'LEGENDARY';
  is_new: boolean;
  current_count: number;
  image_url: string;
}

const BASE_SPRITE_SIZE = 24;
const MODAL_SCALE = 3;

export function StudentGacha() {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isProbabilityOpen, setIsProbabilityOpen] = useState(false);
  const [resultFish, setResultFish] = useState<Fish | null>(null);

  const [gachaCost, setGachaCost] = useState(10);
  const [studentCoral, setStudentCoral] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const probabilityTable = [
    { rarity: 'COMMON', name: '커먼', rate: '70%', color: 'bg-gray-400' },
    { rarity: 'RARE', name: '레어', rate: '25%', color: 'bg-blue-500' },
    { rarity: 'LEGENDARY', name: '레전더리', rate: '5%', color: 'bg-yellow-600' },
  ];

  useEffect(() => {
    if (isAuthenticated && userType === 'student' && access_token) {
      const fetchGachaInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await get('/api/v1/gacha/info');

          if (!response.ok) {
            throw new Error('가챠 정보를 불러오는데 실패했습니다.');
          }

          const result = await response.json();

          if (result.success) {
            setStudentCoral(result.data.student_coral);
            setGachaCost(result.data.gacha_cost);
          } else {
            throw new Error(result.message || '데이터 포맷 오류');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
        } finally {
          setIsLoading(false);
        }
      };

      fetchGachaInfo();
    }
  }, [isAuthenticated, userType, access_token]);

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }

  // 가챠 정보 로딩 중
  if (isLoading) {
    return <div className="p-4">가챠 정보 로딩 중...</div>;
  }

  // 에러 발생 시
  if (error) {
    return <div className="p-4 text-red-500">오류: {error}</div>;
  }

  const drawGacha = async () => {
    if (studentCoral < gachaCost) {
      alert('코랄이 부족합니다!');
      return;
    }

    setIsDrawing(true);
    setResultFish(null);

    setTimeout(async () => {
      try {
        const response = await post('/api/v1/gacha/draw', {
          coral: studentCoral
        });

        const result = await response.json();

        // 가챠 뽑기 로직
        if (result.success) {
          // 가챠 성공
          setResultFish(result.data.drawn_fish);
          setStudentCoral(result.data.remaining_coral); // 남은 코랄 업데이트
          setIsResultOpen(true);
          console.log('Gacha result:', result.data);
        } else {
          // 가챠 실패 (예: 코랄 부족)
          if (result.error_code === 'INSUFFICIENT_CORAL') {
            alert('코랄이 부족합니다. (서버 체크)');
            // 서버 값으로 코랄 동기화
            if (result.details && typeof result.details.available === 'number') {
              setStudentCoral(result.details.available);
            }
          } else {
            alert(`오류: ${result.message}`);
          }
        }
      } catch (err) {
        console.error('Gacha draw error:', err);
        alert('가챠 뽑기 중 오류가 발생했습니다.');
      } finally {
        setIsDrawing(false); // 애니메이션 종료
      }
    }, 2500); // 2.5초 지연
  };

  const getRarityBadge = (grade: Fish['grade']) => {
    switch (grade) {
      case 'COMMON':
        return <Badge className="bg-gray-400">커먼</Badge>;
      case 'RARE':
        return <Badge className="bg-blue-500">레어</Badge>;
      case 'LEGENDARY':
        return <Badge className="bg-yellow-600">레전더리</Badge>;
    }
  };

  const getRarityText = (grade: Fish['grade']) => {
    switch (grade) {
      case 'COMMON': return <span style={{ color: "gray", fontWeight: "bold" }}>[커먼]</span>;
      case 'RARE': return <span style={{ color: "blue", fontWeight: "bold" }}>[레어]</span>;
      case 'LEGENDARY': return <span style={{ color: "#ffd700", fontWeight: "bold" }}>[레전더리]</span>;
    }
  };

  const renderGachaFish = (fish: Fish) => {
    const scale = MODAL_SCALE;
    const finalSize = scale * BASE_SPRITE_SIZE;

    const spriteInfo = FISH_ICONS[fish.fish_id];
    const isAnimated = spriteInfo?.isAnimated;
    const animationData = spriteInfo?.animation;

    const IconComponent = isAnimated && animationData ? (
      <FishAnimation
        spriteUrl={animationData.url}
        totalFrames={animationData.frames}
        scale={scale}
        duration={animationData.duration}
      />
    ) : (
      <FishIcon
        fishId={fish.fish_id}
        scale={scale}
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

  return (
    <div className="p-4 space-y-6 max-w-screen-xl mx-auto">

      {/* 가챠 머신 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;가챠 머신</div>
          <div className="title-bar-controls">
            <button aria-label="Help" onClick={() => setIsProbabilityOpen(true)} />
          </div>
        </div>

        <div className="window-body text-center">
          <p style={{ marginBottom: "10px" }}>새로운 물고기를 획득하세요!</p>

          {/* 가챠 머신 시각화 - 슬롯 머신 형태로 변경 */}
          <div className="sunken-panel" style={{
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e0e0e0",
            marginBottom: "15px",
            border: "2px outset #dfdfdf", // 98.css 스타일 테두리
            boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
            position: "relative" // 애니메이션 자식 요소를 위해 relative
          }}>
            {isDrawing ? (
              // 애니메이션 중일 때 로딩 스피너 표시
              <div className="gacha-animation">
                <img
                  src={IMAGES.loadingFish}
                  alt="Gacha Loading..."
                  style={{ height: "100px", objectFit: "cover", imageRendering: "pixelated" }}
                />
              </div>
            ) : (
              // 평소에는 "DRAW" 텍스트 또는 이미지
              <div style={{ fontSize: "2.5em", fontWeight: "bold", color: "#666" }}>DRAW</div>
            )}
          </div>

          {/* 상태 표시창 */}
          <fieldset style={{ marginBottom: "15px" }}>
            <legend>Status</legend>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>보유 코랄</div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>{studentCoral}</div>
              </div>
              <div style={{ width: "2px", background: "#808080" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>필요한 코랄</div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: studentCoral < gachaCost ? "red" : "black" }}>
                  {gachaCost}
                </div>
              </div>
            </div>
          </fieldset>

          {/* 뽑기 버튼 */}
          <button
            onClick={drawGacha}
            disabled={studentCoral < gachaCost || isDrawing}
            style={{ width: "100%", height: "40px", fontWeight: "bold", fontSize: "14px" }}
          >
            {isDrawing ? '뽑는 중...' : (studentCoral < gachaCost ? '코랄 부족' : '가챠 뽑기')}
          </button>

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => setIsProbabilityOpen(true)} style={{ minWidth: "120px" }}>
              보상 가이드
            </button>
          </div>
        </div>
      </div>

      {/* [모달] 가챠 결과 */}
      {isResultOpen && resultFish && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="title-bar">
              <div className="title-bar-text">획득 성공!</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsResultOpen(false)} />
              </div>
            </div>
            <div className="window-body text-center">
              {/* 물고기 이미지 표시 */}
              <div className="sunken-panel" style={{
                width: "120px", height: "120px", margin: "0 auto 15px auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: resultFish.grade === 'LEGENDARY' ? '#fffacd' : '#fff'
              }}>
                {renderGachaFish(resultFish)}
              </div>

              {resultFish.is_new && (
                <div style={{ color: "red", fontWeight: "bold", animation: "blink 1s infinite" }}>NEW!</div>
              )}

              <h3 style={{ margin: "5px 0" }}>{resultFish.fish_name}</h3>
              <div style={{ marginBottom: "10px" }}>{getRarityText(resultFish.grade)}</div>

              <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>
                (현재 보유: {resultFish.current_count}마리)
              </p>

              <button onClick={() => setIsResultOpen(false)} style={{ minWidth: "100px" }}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [모달] 확률표 */}
      {isProbabilityOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="title-bar">
              <div className="title-bar-text">확률표</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsProbabilityOpen(false)} />
              </div>
            </div>
            <div className="window-body">
              <fieldset style={{ marginBottom: "15px" }}>
                <legend>등급별 확률</legend>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {probabilityTable.map((item) => (
                    <li key={item.rarity} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dotted #ccc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "12px", height: "12px", background: item.color, border: "1px solid black" }}></div>
                        <span>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: "bold" }}>{item.rate}</span>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <div className="sunken-panel" style={{ padding: "8px", background: "#fff", fontSize: "12px", marginBottom: "15px" }}>
                <strong>💡 Tip:</strong><br />
                레전더리 물고기는 매우 희귀합니다.<br />
                코랄을 모아 도전해보세요!
              </div>

              <div style={{ textAlign: "center" }}>
                <button onClick={() => setIsProbabilityOpen(false)}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes flash {
          0% { color: blue; }
          50% { color: red; }
          100% { color: blue; }
        }
        .gacha-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #d0d0d0; /* 애니메이션 중 배경색 */
          z-index: 1;
        }
      `}</style>
    </div>
  );
}