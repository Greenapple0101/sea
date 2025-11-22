import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Plus, X, Info, Sparkles } from "lucide-react";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function QuestCreatePageNew() {
  const [groups, setGroups] = useState(["전체", "숙제", "시험"]);
  const [newGroup, setNewGroup] = useState("");
  const [showRewardGuide, setShowRewardGuide] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);

  const addGroup = () => {
    if (newGroup.trim()) {
      setGroups([...groups, newGroup.trim()]);
      setNewGroup("");
    }
  };

  const removeGroup = (index: number) => {
    if (index >= 3) { // Don't remove default groups
      setGroups(groups.filter((_, i) => i !== index));
    }
  };

  return (
    <>
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <h1>퀘스트 등록</h1>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-3xl">
          <div className="space-y-6">
            {/* Quest Target */}
            <div className="space-y-2">
              <Label>퀘스트 대상 명칭</Label>
              <div className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                <span className="font-bold text-lg">중등 1반</span>
              </div>
            </div>

            {/* Quest Content */}
            <div className="space-y-2">
              <Label>퀘스트 내용</Label>
              <Textarea 
                placeholder="퀘스트 설명을 입력하세요"
                className="border-2 border-gray-300 rounded-lg min-h-32"
                rows={5}
              />
            </div>

            {/* Quest Groups */}
            <div className="space-y-2">
              <Label>퀘스트 그룹</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {groups.map((group, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 border-2 border-gray-300"
                    >
                      <span>{group}</span>
                      {index >= 3 && (
                        <button
                          onClick={() => removeGroup(index)}
                          className="hover:bg-gray-100 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="새 그룹 추가"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                  <Button 
                    onClick={addGroup}
                    variant="outline"
                    className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label>퀘스트 기한</Label>
              <Input 
                type="datetime-local"
                className="border-2 border-gray-300 rounded-lg"
              />
            </div>

            {/* Reward */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>보상 등록</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRewardGuide(true)}
                  className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  <Info className="w-4 h-4 mr-2" />
                  보상 가이드
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">코랄</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">탐사데이터</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI 보상 추천받기
              </Button>
            </div>

            {/* Auto Approve */}
            <Card className="border-2 border-gray-300 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>자동 승인</Label>
                    <p className="text-sm text-gray-600">학생이 완료 신청 시 자동으로 승인합니다</p>
                  </div>
                  <Switch 
                    checked={autoApprove}
                    onCheckedChange={setAutoApprove}
                    className="border-2 border-gray-300"
                  />
                </div>
                {autoApprove && (
                  <div className="space-y-2 border-t-2 border-gray-300 pt-4">
                    <Label className="text-sm">자동 승인 시 코멘트</Label>
                    <Textarea 
                      placeholder="예: 잘했어요! 계속 이렇게 해주세요."
                      className="border-2 border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Button 
              className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12"
            >
              퀘스트 등록
            </Button>
          </div>
        </div>
      </div>

      {/* Reward Guide Dialog */}
      <Dialog open={showRewardGuide} onOpenChange={setShowRewardGuide}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle>보상 가이드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-black mb-2">퀘스트 난이도별 보상</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <span className="font-medium">쉬움:</span> 코랄 20 / 탐사데이터 400~500</li>
                <li>• <span className="font-medium">보통:</span> 코랄 30 / 탐사데이터 600~700</li>
                <li>• <span className="font-medium">어려움:</span> 코랄 40 / 탐사데이터 800~900</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              * AI 추천 기능을 사용하면 학생의 현재 수준과 이전 퀘스트 이력을 분석하여 적정 보상을 제안합니다.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}