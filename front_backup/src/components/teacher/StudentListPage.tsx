import { useNavigate } from "react-router-dom";
import { StudentListItem } from "../common/StudentListItem";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AppContext"
import { get } from "../../utils/api";
import { Loader2 } from "lucide-react";

interface ApiStudent {
  student_id: number;
  name: string;
  pending_quests: number;
  coral: number;
  research_data: number;
}

interface StudentListData {
  class_id: number;
  class_name: string;
  student_count: number;
  students: ApiStudent[];
}

export function StudentListPage() {
  const navigate = useNavigate();
  const { currentClassId, access_token } = useAuth();

  const [listData, setListData] = useState<StudentListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentClassId || !access_token) {
      setError("반 정보를 불러올 수 없습니다. (인증 오류)");
      setIsLoading(false);
      return;
    }

    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await get(
          `/api/v1/classes/${currentClassId}/students`
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "학생 목록을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        if (data.success) {
          setListData(data.data);
        } else {
          throw new Error(data.message || "데이터 포맷 오류");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [currentClassId, access_token]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        학생 목록을 불러오는 중...
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return <div className="flex-1 p-6 text-red-600">오류: {error}</div>;
  }

  // 데이터가 없을 때
  if (!listData) {
    return <div className="flex-1 p-6">학생 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-white flex">

      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>학생 목록</h1>
              <p className="text-gray-600 mt-1">
                {listData.class_name} - 총 {listData.student_count}명
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {listData.students.length > 0 ? (
              listData.students.map((student) => (
                <StudentListItem
                  key={student.student_id}
                  id={student.student_id}
                  name={student.name}
                  pendingQuests={student.pending_quests}
                  coral={student.coral}
                  research_data={student.research_data}
                />
              ))
            ) : (
              <p>반에 등록된 학생이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}