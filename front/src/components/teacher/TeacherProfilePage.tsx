import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Sidebar } from "./Sidebar";
import { Save, User, Mail } from "lucide-react";
import { useState } from "react";

export function TeacherProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "김선생",
    email: "teacher@sca.com",
    password: ""
  });

  const handleSave = () => {
    setIsEditing(false);
    // 실제로는 API 호출로 데이터 저장
    alert("회원정보가 수정되었습니다.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 변경사항 되돌리기
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">회원정보 수정</h1>
              <p className="text-gray-600 mt-1">개인정보를 수정할 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl">
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <User className="w-5 h-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 기본 정보 폼 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-medium">이름</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black font-medium">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={profile.password}
                    onChange={(e) => setProfile({...profile, password: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                    placeholder={isEditing ? "비밀번호를 입력하세요" : "••••••••"}
                  />
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-black hover:bg-gray-800 text-white rounded-lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    정보 수정
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      저장하기
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      취소
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
