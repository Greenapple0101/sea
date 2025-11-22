import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useNavigate } from "react-router-dom";

export function RaidCreatePageNew() {
  const navigate = useNavigate();
  const [storyType, setStoryType] = useState<string>("helix");
  const [difficulty, setDifficulty] = useState<string>("medium");


  return (
    <div className="min-h-screen bg-white flex">

      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <h1>레이드 등록</h1>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-3xl">
          <div className="space-y-6">
            {/* Raid Name */}
            <div className="space-y-2">
              <Label>레이드 이름</Label>
              <Input
                placeholder="예: 중간고사 대비"
                className="border-2 border-gray-300 rounded-lg"
              />
            </div>

            {/* Story Type */}
            <div className="space-y-2">
              <Label>설명 / 스토리</Label>
              <RadioGroup value={storyType} onValueChange={setStoryType}>
                <Card className="border-2 border-gray-300 rounded-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="helix" id="helix" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="helix" className="cursor-pointer">
                          헬릭스 인더스트리 (원양어선)
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          침묵의 바다를 떠돌며 구시대의 유실 기술을 불법적으로 인양하여 독점하려는 거대 용병 기업.
                          SCA의 기술 집약체 '코어-피쉬'를 포획하려 한다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-300 rounded-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="kraken" id="kraken" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="kraken" className="cursor-pointer">
                          크라켄 (변종 이상 개체)
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Cascade Fail 당시 방출된 불안정한 에너지와 나노머신에 의해 유전 정보가 뒤틀린 해양 생물.
                          활성화되는 아쿠아리스 에너지를 파괴하기 위해 거점을 침공한다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>


            {/* Participation Period */}
            <div className="space-y-2">
              <Label>참여 기간</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">시작</Label>
                  <Input
                    type="datetime-local"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">종료</Label>
                  <Input
                    type="datetime-local"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>레이드 목표 수치화 (보스 난이도)</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="border-2 border-gray-300 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-gray-300 rounded-lg">
                  <SelectItem value="low">하 (목표 HP: 1,000)</SelectItem>
                  <SelectItem value="medium">중 (목표 HP: 5,000)</SelectItem>
                  <SelectItem value="high">상 (목표 HP: 10,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rewards */}
            <Card className="border-2 border-gray-300 rounded-lg">
              <CardContent className="p-4 space-y-4">
                <h4>공통 보상</h4>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">코랄</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">특별 보상 (선택)</Label>
                    <Input
                      placeholder="예: 아이스크림 파티"
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                onClick={() => navigate('/teacher/dashboard')}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg h-12"
              >
                레이드 등록
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}