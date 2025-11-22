import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { StudentListItem } from "../common/StudentListItem";
import { get } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";

interface StudentInfo {
  studentId: number;  // 백엔드 응답은 camelCase
  student_id?: number;  // 호환성을 위해 optional로 유지
  name: string;
  pendingQuests: number;  // 백엔드 응답은 camelCase
  pending_quests?: number;  // 호환성을 위해 optional로 유지
  coral: number;
  researchData: number;  // 백엔드 응답은 camelCase
  research_data?: number;  // 호환성을 위해 optional로 유지
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
  const { classId: urlClassId } = useParams<{ classId?: string }>();
  const locationState = location.state as { classId?: number } | null;
  const { user, currentClassId } = useAuth();
  
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classInfo, setClassInfo] = useState<{ className: string; studentCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      // URL 파라미터가 필수! URL에 classId가 없으면 반 관리 페이지로 리다이렉트
      let classId: number | null = null;
      
      console.log('StudentListPage - urlClassId:', urlClassId, 'currentClassId:', currentClassId, 'locationState:', locationState);
      
      if (urlClassId) {
        // 숫자로 변환 시도
        const parsed = Number(urlClassId);
        if (!isNaN(parsed)) {
          classId = parsed;
          console.log('URL에서 숫자 classId 파싱:', urlClassId, '->', classId);
        } else {
          // 숫자가 아니면 반 이름으로 간주하고 반 목록에서 찾기
          console.log('URL에서 반 이름으로 classId 찾기:', urlClassId);
          try {
            const classesResponse = await get('/api/v1/classes');
            const classesJson = await classesResponse.json();
            if (classesResponse.ok && classesJson.data?.classes?.length > 0) {
              const foundClass = classesJson.data.classes.find(
                (c: any) => c.class_name === urlClassId || c.className === urlClassId
              );
              if (foundClass) {
                classId = foundClass.class_id ?? foundClass.classId;
                console.log('반 이름으로 classId 찾음:', urlClassId, '->', classId);
                // URL도 숫자 ID로 업데이트
                navigate(`/teacher/students/${classId}`, { replace: true });
              } else {
                setError(`반 "${urlClassId}"을 찾을 수 없습니다.`);
                setStudents([]);
                setClassInfo(null);
                setLoading(false);
                return;
              }
            }
          } catch (err) {
            console.error('반 목록 조회 실패:', err);
            setError('반 정보를 불러오지 못했습니다.');
            setStudents([]);
            setClassInfo(null);
            setLoading(false);
            return;
          }
        }
      } else {
        // URL에 classId가 없으면 반 관리 페이지로 리다이렉트
        console.log('URL에 classId가 없습니다. 반 관리 페이지로 리다이렉트');
        if (currentClassId) {
          // currentClassId가 있으면 그것을 사용하여 URL 업데이트
          navigate(`/teacher/students/${currentClassId}`, { replace: true });
        } else {
          // currentClassId도 없으면 반 관리 페이지로 이동
          navigate('/teacher/class', { replace: true });
        }
        return;
      }

      if (classId === null) {
        console.log('classId가 null입니다. 반 관리 페이지로 리다이렉트');
        navigate('/teacher/class', { replace: true });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('학생 목록 조회 시작, 반 ID:', classId, '타입:', typeof classId);
        
        // 학생 목록과 승인 대기 퀘스트를 병렬로 가져오기
        const [studentsResponse, pendingQuestsResponse] = await Promise.all([
          get(`/api/v1/classes/${classId}/students`),
          get('/api/v1/quests/personal/pending').catch(() => null) // 실패해도 계속 진행
        ]);
        
        const studentsJson = await studentsResponse.json();
        console.log('학생 목록 응답:', studentsJson);
        console.log('응답 데이터:', studentsJson.data);
        console.log('학생 수:', studentsJson.data?.student_count, '학생 목록:', studentsJson.data?.students);
        
        if (studentsResponse.ok) {
          const data: StudentListResponse = studentsJson.data;
          console.log('학생 목록 데이터:', {
            classId: data.class_id,
            className: data.class_name,
            studentCount: data.student_count,
            studentsCount: data.students?.length ?? 0,
            students: data.students
          });
          
          // 승인 대기 퀘스트 개수 계산
          let pendingQuestsMap: Map<number, number> = new Map();
          if (pendingQuestsResponse && pendingQuestsResponse.ok) {
            try {
              const pendingJson = await pendingQuestsResponse.json();
              if (pendingJson.data?.assignments) {
                // 각 학생별로 승인 대기 퀘스트 개수 세기
                pendingJson.data.assignments.forEach((quest: any) => {
                  const studentId = quest.student_id;
                  if (studentId) {
                    pendingQuestsMap.set(studentId, (pendingQuestsMap.get(studentId) || 0) + 1);
                  }
                });
              }
            } catch (err) {
              console.error('승인 대기 퀘스트 처리 실패:', err);
            }
          }
          
          // 학생 목록에 실제 승인 대기 퀘스트 개수 업데이트
          const studentsWithPendingQuests = (data.students ?? []).map(student => {
            const studentId = student.studentId ?? student.student_id;
            const actualPendingQuests = pendingQuestsMap.get(studentId ?? 0) ?? 0;
            return {
              ...student,
              pendingQuests: actualPendingQuests,
              pending_quests: actualPendingQuests
            };
          });
          
          // 요청한 classId와 응답의 classId가 일치하는지 확인
          if (data.class_id && data.class_id !== classId) {
            console.error('경고: 요청한 classId와 응답의 classId가 다릅니다!', {
              requested: classId,
              received: data.class_id
            });
          }
          
          setStudents(studentsWithPendingQuests);
          // student_count가 0이지만 students 배열에 데이터가 있으면 students.length 사용
          const actualStudentCount = data.student_count > 0 
            ? data.student_count 
            : (data.students?.length ?? 0);
          
          setClassInfo({
            className: data.class_name ?? '',
            studentCount: actualStudentCount
          });
        } else {
          const errorMessage = studentsJson?.message ?? '학생 목록을 불러오지 못했습니다.';
          console.error('학생 목록 조회 실패:', errorMessage, studentsJson);
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
  }, [urlClassId, locationState, user, navigate]);



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
              {students.map((student) => {
                // 백엔드 응답이 camelCase이므로 둘 다 지원
                const studentId = student.studentId ?? student.student_id ?? 0;
                const pendingQuests = student.pendingQuests ?? student.pending_quests ?? 0;
                const researchData = student.researchData ?? student.research_data ?? 0;
                
                return (
                  <StudentListItem
                    key={studentId}
                    id={studentId}
                    name={student.name}
                    avatar={getAvatar(student.name)}
                    pendingQuests={pendingQuests}
                    coral={student.coral ?? 0}
                    research_data={researchData}
                    classId={urlClassId ? Number(urlClassId) : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
    </>
  );
}