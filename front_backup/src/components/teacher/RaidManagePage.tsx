import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { 
  ArrowLeft, 
  Sword,
  Play,
  Square,
  Users,
  Trophy,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "../ui/progress";
import { useState } from "react";

export function RaidManagePage() {
  const navigate = useNavigate();
  const [selectedRaid, setSelectedRaid] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const raids = [
    { 
      id: 1, 
      name: "전교생 독서 마라톤", 
      bossHp: 42,
      ultimateGauge: 65,
      participants: 24, 
      status: "진행중",
      reward: "아이스크림 파티"
    },
    { 
      id: 2, 
      name: "과학 실험 프로젝트", 
      bossHp: 60,
      ultimateGauge: 40,
      participants: 8, 
      status: "진행중",
      reward: "과학관 견학"
    },
    { 
      id: 3, 
      name: "수학 경시대회", 
      bossHp: 100,
      ultimateGauge: 0,
      participants: 0, 
      status: "대기중",
      reward: "문화상품권"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('teacher-dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sword className="w-6 h-6 text-red-500" />
            <h1>레이드 관리</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Active Raids */}
        <Card>
          <CardHeader>
            <CardTitle>전체 레이드 목록</CardTitle>
            <CardDescription>레이드를 시작하거나 종료할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {raids.map((raid) => (
              <Card key={raid.id} className={`border-2 ${
                raid.status === "진행중" ? "border-red-200 bg-red-50" : "border-gray-200"
              }`}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4>{raid.name}</h4>
                        <Badge variant={raid.status === "진행중" ? "destructive" : "secondary"}>
                          {raid.status}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {/* Boss HP */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>보스 HP</span>
                            <span className="text-red-600">{raid.bossHp}%</span>
                          </div>
                          <Progress value={raid.bossHp} className="h-2" />
                        </div>
                        
                        {/* Ultimate Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>필살기 게이지</span>
                            <span className="text-yellow-600">{raid.ultimateGauge}%</span>
                          </div>
                          <Progress value={raid.ultimateGauge} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{raid.participants}명 참여</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Trophy className="w-4 h-4" />
                            <span>보상: {raid.reward}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reward Text Input */}
                  <div className="space-y-2">
                    <label className="text-sm">보상 내용 (학생들에게 표시됨)</label>
                    <Input 
                      placeholder="예: 아이스크림 파티"
                      defaultValue={raid.reward}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    {raid.status === "대기중" ? (
                      <Button 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        레이드 시작
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            alert(`${raid.name} 상세 정보\n보스 HP: ${raid.bossHp}%\n필살기 게이지: ${raid.ultimateGauge}%\n참여자: ${raid.participants}명\n보상: ${raid.reward}`);
                          }}
                        >
                          상세 보기
                        </Button>
                        <Button 
                          className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          레이드 종료
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 space-y-2">
            <h4>레이드 관리 안내</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>레이드 시작:</strong> 학생들이 참여할 수 있도록 레이드를 활성화합니다</li>
              <li><strong>보상 설정:</strong> 보상 내용을 입력하면 학생들에게 표시됩니다</li>
              <li><strong>레이드 종료:</strong> 레이드를 종료하고 참여자들에게 보상을 지급합니다</li>
              <li><strong>보스 HP:</strong> 학생들의 기여로 감소합니다</li>
              <li><strong>필살기 게이지:</strong> 학생들의 경험치로 충전됩니다</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 레이드 상세 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-red-500" />
              {selectedRaid?.name} 상세 정보
            </DialogTitle>
          </DialogHeader>
          
          {selectedRaid && (
            <div className="space-y-6">
              {/* 레이드 상태 */}
              <div className="flex items-center gap-2">
                <Badge variant={selectedRaid.status === "진행중" ? "destructive" : "secondary"}>
                  {selectedRaid.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {selectedRaid.status === "진행중" ? "현재 진행 중" : "대기 중"}
                </span>
              </div>

              {/* 보스 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">보스 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>보스 HP</span>
                      <span className="text-red-600 font-semibold">{selectedRaid.bossHp}%</span>
                    </div>
                    <Progress value={selectedRaid.bossHp} className="h-3" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>필살기 게이지</span>
                      <span className="text-yellow-600 font-semibold">{selectedRaid.ultimateGauge}%</span>
                    </div>
                    <Progress value={selectedRaid.ultimateGauge} className="h-3" />
                  </div>
                </div>
              </div>

              {/* 참여자 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">참여 현황</h3>
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-900">
                    {selectedRaid.participants}명 참여
                  </span>
                </div>
              </div>

              {/* 보상 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">보상 정보</h3>
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-900">
                    {selectedRaid.reward}
                  </span>
                </div>
              </div>

              {/* 레이드 통계 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">레이드 통계</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedRaid.bossHp}%</div>
                    <div className="text-sm text-gray-600">남은 HP</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedRaid.ultimateGauge}%</div>
                    <div className="text-sm text-gray-600">필살기 게이지</div>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  닫기
                </Button>
                {selectedRaid.status === "진행중" && (
                  <Button 
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    레이드 종료
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}