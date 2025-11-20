import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { StudentListItem } from "../common/StudentListItem";
import { get } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";

interface StudentInfo {
  student_id: number;
  name: string;
  pending_quests: number;
  coral: number;
  research_data: number;
}

interface StudentListResponse {
  class_id: number;
  class_name: string;
  student_count: number;
  students: StudentInfo[];
}

export function StudentListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const locationState = location.state as { classId?: number } | null;
  const { user } = useAuth();
  
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classInfo, setClassInfo] = useState<{ className: string; studentCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      // URL 파라미터, location.state, user.classes, 또는 첫 번째 반 중 우선순위로 classId 결정
      let classId: number | null = null;
      
      if (id) {
        classId = Number(id);
      } else if (locationState?.classId) {
        classId = locationState.classId;
      } else if (user && 'classes' in user && user.classes && user.classes.length > 0) {
        // user.classes에서 첫 번째 반 ID 사용
        classId = Number(user.classes[0]);
      } else {
        // classId가 없으면 반 목록에서 첫 번째 반 가져오기
        try {
          const classesResponse = await get('/api/v1/classes');
          const classesJson = await classesResponse.json();
          if (classesResponse.ok && classesJson.data?.classes?.length > 0) {
            classId = classesJson.data.classes[0].class_id ?? classesJson.data.classes[0].classId;
          }
        } catch (err) {
          console.error('반 목록 조회 실패:', err);
        }
      }

      if (classId === null) {
        setError('반을 선택해주세요.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('학생 목록 조회 시작, 반 ID:', classId);
        const response = await get(`/api/v1/classes/${classId}/students`);
        const json = await response.json();
        console.log('학생 목록 응답:', json);
        
        if (response.ok) {
          const data: StudentListResponse = json.data;
          setStudents(data.students ?? []);
          setClassInfo({
            className: data.class_name ?? '',
            studentCount: data.student_count ?? 0
          });
        } else {
          const errorMessage = json?.message ?? '학생 목록을 불러오지 못했습니다.';
          console.error('학생 목록 조회 실패:', errorMessage, json);
          setError(errorMessage);
          setStudents([]);
          setClassInfo(null);
        }
      } catch (err: any) {
        const errorMessage = err.message ?? '학생 목록을 불러오지 못했습니다.';
        console.error('학생 목록 조회 에러:', err);
        setError(errorMessage);
        setStudents([]);
        setClassInfo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [id, locationState, user]);



  const getAvatar = (name: string) => {
    if (!name || name.length === 0) return '?';
    return name.charAt(0);
  };


  return (
    <>
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>학생 목록</h1>
              {classInfo ? (
                <p className="text-gray-600 mt-1">{classInfo.className} - 총 {classInfo.studentCount}명</p>
              ) : (
                <p className="text-gray-600 mt-1">학생 목록을 불러오는 중...</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-gray-600">학생 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                새로고침
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">학생이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {students.map((student) => (
                <StudentListItem
                  key={student.student_id}
                  id={student.student_id}
                  name={student.name}
                  avatar={getAvatar(student.name)}
                  pendingQuests={student.pending_quests}
                  coral={student.coral ?? 0}
                  research_data={student.research_data ?? 0}
                />
              ))}
            </div>
          )}
        </div>
    </>
  );
}