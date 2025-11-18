import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from "../../contexts/AppContext";
import { get } from "../../utils/api";

type FishGrade = 'COMMON' | 'RARE' | 'LEGENDARY';

interface AquariumFish {
  entry_id: number;
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  fish_count: number;
}

interface AquariumResponse {
  collection_id: number;
  student_id: number;
  total_collected: number;
  collected_fish: AquariumFish[];
}

interface EncyclopediaFish {
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  is_collected: boolean;
  fish_count: number;
}

interface EncyclopediaResponse {
  total_fish: number;
  collected_count: number;
  collection_rate: number;
  fish_list: EncyclopediaFish[];
}

interface SelectedFishInfo {
  id: number;
  name: string;
  grade: FishGrade;
  count: number;
}

export function StudentCollection() {
  const { user, isAuthenticated, userType } = useAuth();
  const [selectedFish, setSelectedFish] = useState<SelectedFishInfo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'aquarium' | 'book'>('aquarium');
  const [aquariumData, setAquariumData] = useState<AquariumResponse | null>(null);
  const [encyclopediaData, setEncyclopediaData] = useState<EncyclopediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const maxCapacity = 20; // TODO: 백엔드에서 용량 정보를 제공하면 교체

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      setLoading(false);
      return;
    }

    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        const [aquariumRes, encyclopediaRes] = await Promise.all([
          get('/api/v1/collection/aquarium'),
          get('/api/v1/collection/encyclopedia')
        ]);
        const aquariumJson = await aquariumRes.json();
        const encyclopediaJson = await encyclopediaRes.json();

        if (!aquariumRes.ok) {
          throw new Error(aquariumJson?.message ?? '수족관 정보를 불러오지 못했습니다.');
        }
        if (!encyclopediaRes.ok) {
          throw new Error(encyclopediaJson?.message ?? '도감 정보를 불러오지 못했습니다.');
        }

        setAquariumData(aquariumJson.data ?? null);
        setEncyclopediaData(encyclopediaJson.data ?? null);
      } catch (err: any) {
        setError(err.message ?? '도감 정보를 불러오지 못했습니다.');
        setAquariumData(null);
        setEncyclopediaData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [isAuthenticated, userType]);

  const ownedFish = aquariumData?.collected_fish ?? [];
  const totalOwnedCount = ownedFish.reduce((sum, fish) => sum + (fish.fish_count ?? 0), 0);
  const encyclopediaFish = encyclopediaData?.fish_list ?? [];

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-4">로그인 정보 로딩 중...</div>;
  }

  const getRarityBadge = (grade: FishGrade) => {
    switch (grade) {
      case 'COMMON':
        return <Badge className="bg-gray-400">커먼</Badge>;
      case 'RARE':
        return <Badge className="bg-gray-600">레어</Badge>;
      case 'LEGENDARY':
        return <Badge className="bg-black">레전드</Badge>;
    }
  };

  const gradeColorClass = (grade: FishGrade, owned: boolean) => {
    if (!owned) {
      return 'bg-gray-200 border-gray-200';
    }
    switch (grade) {
      case 'LEGENDARY':
        return 'bg-gray-800 border-gray-700';
      case 'RARE':
        return 'bg-gray-600 border-gray-500';
      default:
        return 'bg-gray-400 border-gray-300';
    }
  };

  const handleFishClick = (fish: SelectedFishInfo) => {
    setSelectedFish(fish);
    setIsDetailOpen(true);
  };

  const handleDeleteFish = () => {
    if (!selectedFish) return;

    // 실제로는 API 호출
    console.log('Deleting fish:', selectedFish.id);
    alert('물고기가 삭제되었습니다.');
    setIsDeleteWarningOpen(false);
    setIsDetailOpen(false);
  };

  const isNearCapacity = totalOwnedCount >= maxCapacity * 0.8;
  const isFullCapacity = totalOwnedCount >= maxCapacity;

  const aquariumSummary = useMemo(() => {
    return {
      species: ownedFish.length,
      total: totalOwnedCount
    };
  }, [ownedFish.length, totalOwnedCount]);

  const encyclopediaSummary = useMemo(() => {
    if (!encyclopediaData) {
      return { collected: 0, total: 0 };
    }
    return {
      collected: encyclopediaData.collected_count ?? 0,
      total: encyclopediaData.total_fish ?? 0
    };
  }, [encyclopediaData]);

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 페이지입니다.</div>;
  }

  if (loading) {
    return <div className="p-6">도감 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-black">도감</h1>
        {currentView === 'aquarium' && (
          <p className="text-sm text-gray-600">
            수집한 물고기: {aquariumSummary.species}종 / 총 {aquariumSummary.total}마리
          </p>
        )}
        {currentView === 'book' && (
          <p className="text-sm text-gray-600">
            물고기 도감: {encyclopediaSummary.collected}종 / {encyclopediaSummary.total}종
          </p>
        )}
      </div>

      {/* 용량 경고 */}
      {isNearCapacity && (
        <Card className="border-2 border-gray-400">
          <CardContent className="p-4">
            <p className="text-center text-black">
              {isFullCapacity
                ? '⚠️ 수족관이 가득 찼습니다! 일부 물고기를 삭제해주세요.'
                : '⚠️ 수족관 용량이 부족합니다. 곧 정리가 필요합니다.'
              }
            </p>
            <p className="text-center text-sm text-gray-600 mt-1">
              현재: {totalOwnedCount}/{maxCapacity}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 보기 모드 선택 */}
      <Tabs value={currentView} onValueChange={(value: string) => setCurrentView(value as 'aquarium' | 'book')}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="aquarium" className="text-black">수족관</TabsTrigger>
          <TabsTrigger value="book" className="text-black">도감</TabsTrigger>
        </TabsList>

        {/* 수족관 보기 */}
        <TabsContent value="aquarium" className="space-y-4">
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="text-black text-center">내 수족관</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 수족관 배경 */}
              <div className="w-full h-64 bg-gray-100 border-2 border-gray-300 rounded p-4 relative overflow-hidden">
                <div className="grid grid-cols-4 gap-2 h-full">
                  {ownedFish.map((fish) => (
                    Array.from({ length: fish.fish_count }, (_, index) => (
                      <div
                        key={`${fish.fish_id}-${index}`}
                        onClick={() =>
                          handleFishClick({
                            id: fish.fish_id,
                            name: fish.fish_name,
                            grade: fish.grade,
                            count: fish.fish_count
                          })
                        }
                        className={`w-12 h-12 rounded flex items-center justify-center cursor-pointer border ${gradeColorClass(fish.grade, true)}`}
                      >
                        <span className="text-white text-xs">물고기</span>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 도감 보기 */}
        <TabsContent value="book" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {encyclopediaFish.map((fish) => (
              <Card
                key={fish.fish_id}
                className={`border-2 cursor-pointer ${fish.is_collected ? 'border-gray-300' : 'border-gray-200'
                  }`}
                onClick={() =>
                  fish.is_collected &&
                  handleFishClick({
                    id: fish.fish_id,
                    name: fish.fish_name,
                    grade: fish.grade,
                    count: fish.fish_count
                  })
                }
              >
                <CardContent className="p-3">
                  <div className={`w-full h-20 rounded mb-2 flex items-center justify-center ${gradeColorClass(fish.grade, fish.is_collected)}`}>
                    <span className={fish.is_collected ? 'text-white' : 'text-gray-400'}>
                      {fish.is_collected ? '물고기' : '???'}
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <p className={`font-medium ${fish.is_collected ? 'text-black' : 'text-gray-400'}`}>
                      {fish.is_collected ? fish.fish_name : '???'}
                    </p>
                    {fish.is_collected && (
                      <>
                        {getRarityBadge(fish.grade)}
                        <p className="text-xs text-gray-600">{fish.fish_count}마리</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>

      {/* 물고기 상세 정보 모달 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">{selectedFish?.name ?? '물고기'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 물고기 이미지 */}
            <div className={`w-32 h-32 rounded mx-auto flex items-center justify-center ${selectedFish ? gradeColorClass(selectedFish.grade, true) : 'bg-gray-200'
              }`}>
              <span className="text-white">물고기</span>
            </div>

            {/* 물고기 정보 */}
            <div className="text-center space-y-2">
              {selectedFish && getRarityBadge(selectedFish.grade)}
              <p className="text-black">보유 수량: {selectedFish?.count ?? 0}마리</p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-2">
              {selectedFish && selectedFish.count > 1 && (
                <Button
                  onClick={() => setIsDeleteWarningOpen(true)}
                  className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
                >
                  삭제
                </Button>
              )}
              <Button
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 bg-white text-black border border-gray-300"
              >
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={isDeleteWarningOpen} onOpenChange={setIsDeleteWarningOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">물고기 삭제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-black">
              {selectedFish?.name ?? '물고기'} 1마리를 삭제하시겠습니까?
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={handleDeleteFish}
                className="flex-1 bg-gray-600 text-white"
              >
                삭제
              </Button>
              <Button
                onClick={() => setIsDeleteWarningOpen(false)}
                className="flex-1 bg-white text-black border border-gray-300"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}