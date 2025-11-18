import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth, StudentUser } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";

interface Fish {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legend';
  image: string;
}

type FishGrade = 'COMMON' | 'RARE' | 'LEGENDARY';

export function StudentGacha() {
  const { user, isAuthenticated, userType, updateUser } = useAuth();

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isProbabilityOpen, setIsProbabilityOpen] = useState(false);
  const [resultFish, setResultFish] = useState<Fish | null>(null);
  const [currentCoral, setCurrentCoral] = useState<number>(0);
  const [gachaCost, setGachaCost] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [probabilityTable, setProbabilityTable] = useState<Array<{
    grade: string;
    displayName: string;
    ratePercent: number;
  }>>([]);

  // FishGrade를 rarity로 변환
  const gradeToRarity = (grade: FishGrade): 'common' | 'rare' | 'legend' => {
    switch (grade) {
      case 'COMMON':
        return 'common';
      case 'RARE':
        return 'rare';
      case 'LEGENDARY':
        return 'legend';
    }
  };

  // 가챠 정보 가져오기
  useEffect(() => {
    const fetchGachaInfo = async () => {
      if (!isAuthenticated || userType !== 'student') return;

      try {
        setIsLoading(true);
        const response = await get('/api/v1/gacha/info');
        
        if (!response.ok) {
          throw new Error('가챠 정보를 가져오는데 실패했습니다.');
        }

        const result = await response.json();
        const gachaInfo = result.data;
        
        setCurrentCoral(gachaInfo.student_coral ?? 0);
        setGachaCost(gachaInfo.gacha_cost ?? 10);
        
        // 확률표 설정
        if (gachaInfo.probability_table && Array.isArray(gachaInfo.probability_table)) {
          // 백엔드에서 받은 데이터를 안전하게 매핑
          const mappedTable = gachaInfo.probability_table.map((item: any) => ({
            grade: item.grade || '',
            displayName: item.display_name || item.displayName || '',
            ratePercent: item.rate_percent != null ? Number(item.rate_percent) : (item.ratePercent != null ? Number(item.ratePercent) : 0)
          }));
          setProbabilityTable(mappedTable);
        }
      } catch (error) {
        console.error('Failed to fetch gacha info:', error);
        // 기본값 사용
        const currentUser = user as StudentUser;
        if (currentUser) {
          setCurrentCoral(currentUser.coral ?? 0);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGachaInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userType]);

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-4">로그인 정보 로딩 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 페이지입니다.</div>;
  }

  const hasEnoughCoral = currentCoral >= gachaCost;

  const drawGacha = async () => {
    if (!hasEnoughCoral) {
      alert('코랄이 부족합니다!');
      return;
    }

    if (isDrawing) return; // 중복 요청 방지

    try {
      setIsDrawing(true);
      
      const response = await post('/api/v1/gacha/draw', {});
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error_code === 'INSUFFICIENT_CORAL') {
          alert('코랄이 부족합니다!');
        } else {
          alert(errorData.message || '가챠 뽑기에 실패했습니다.');
        }
        return;
      }

      const result = await response.json();
      const drawResult = result.data;
      
      // 뽑은 물고기 정보 설정
      const drawnFish: Fish = {
        id: String(drawResult.drawn_fish.fish_id),
        name: drawResult.drawn_fish.fish_name,
        rarity: gradeToRarity(drawResult.drawn_fish.grade),
        image: `fish${drawResult.drawn_fish.fish_id}`
      };

      setResultFish(drawnFish);
      setIsResultOpen(true);

      // 코랄 정보 업데이트
      const newCoral = drawResult.remaining_coral ?? 0;
      setCurrentCoral(newCoral);
      
      // 사용자 정보도 업데이트
      updateUser({ coral: newCoral });

      console.log('Gacha result:', drawResult);
    } catch (error) {
      console.error('Failed to draw gacha:', error);
      alert('가챠 뽑기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDrawing(false);
    }
  };

  const getRarityBadge = (rarity: Fish['rarity']) => {
    switch (rarity) {
      case 'common':
        return <Badge className="bg-gray-400">커먼</Badge>;
      case 'rare':
        return <Badge className="bg-gray-600">레어</Badge>;
      case 'legend':
        return <Badge className="bg-black">레전드</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-6 bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-xl font-medium text-black mb-2">가챠 머신</h1>
        <p className="text-gray-600">새로운 물고기를 획득해보세요!</p>
      </div>

      {/* 가챠 머신 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          {/* 가챠 머신 이미지 */}
          <div className="w-full h-48 bg-gray-200 rounded mb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <span className="text-gray-600">가챠 머신</span>
            </div>
          </div>

          {/* 현재 코랄 */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">보유 코랄</p>
            <p className="text-2xl font-medium text-black">{currentCoral}</p>
          </div>

          {/* 필요 코랄 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">필요한 코랄</p>
            <p className="text-lg text-black">{gachaCost}</p>
          </div>

          {/* 가챠 버튼 */}
          <Button
            onClick={drawGacha}
            disabled={!hasEnoughCoral || isDrawing || isLoading}
            className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? '로딩 중...' : isDrawing ? '뽑는 중...' : !hasEnoughCoral ? '코랄 부족' : '가챠 뽑기'}
          </Button>
        </CardContent>
      </Card>

      {/* 보상 가이드 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={() => setIsProbabilityOpen(true)}
          className="bg-gray-600 text-white hover:bg-gray-700 px-6 py-2"
        >
          보상 가이드
        </Button>
      </div>

      {/* 가챠 결과 모달 */}
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black text-center">가챠 결과!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {/* 물고기 이미지 */}
            <div className={`w-32 h-32 rounded mx-auto flex items-center justify-center ${resultFish?.rarity === 'legend' ? 'bg-gray-800' :
              resultFish?.rarity === 'rare' ? 'bg-gray-600' : 'bg-gray-400'
              }`}>
              <span className="text-white">물고기</span>
            </div>

            {/* 물고기 정보 */}
            <div>
              <h3 className="text-lg font-medium text-black">{resultFish?.name}</h3>
              {resultFish && getRarityBadge(resultFish.rarity)}
            </div>

            {/* 희귀도에 따른 효과 설명 */}
            {resultFish?.rarity === 'legend' && (
              <p className="text-sm text-gray-600">✨ 전설급 물고기를 획득했습니다! ✨</p>
            )}
            {resultFish?.rarity === 'rare' && (
              <p className="text-sm text-gray-600">⭐ 희귀한 물고기를 획득했습니다!</p>
            )}

            <Button
              onClick={() => setIsResultOpen(false)}
              className="w-full bg-black text-white"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 확률표 모달 */}
      <Dialog open={isProbabilityOpen} onOpenChange={setIsProbabilityOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black text-center">보상 가이드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">가챠에서 획득할 수 있는 물고기의 확률입니다</p>
            </div>

            <div className="space-y-3">
              {probabilityTable.length > 0 ? (
                probabilityTable.map((item) => {
                  const colorClass = item.grade === 'LEGENDARY' ? 'bg-black' :
                                    item.grade === 'RARE' ? 'bg-gray-600' : 'bg-gray-400';
                  return (
                    <div key={item.grade} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded ${colorClass}`}></div>
                        <span className="text-black font-medium text-lg">{item.displayName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-black font-bold text-xl">
                          {item.ratePercent != null ? item.ratePercent.toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-600">확률 정보를 불러오는 중...</div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 가챠 팁</h4>
              <p className="text-xs text-blue-600">
                • 코랄 10개로 가챠 1회 뽑기 가능<br />
                • 레전드 등급은 10% 확률로 매우 희귀합니다<br />
              </p>
            </div>

            <Button
              onClick={() => setIsProbabilityOpen(false)}
              className="w-full bg-gray-600 text-white hover:bg-gray-700"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}