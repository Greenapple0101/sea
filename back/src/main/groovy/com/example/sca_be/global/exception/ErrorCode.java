package com.example.sca_be.global.exception;

public enum ErrorCode {
    // ===== 인증 관련 (401) =====
    UNAUTHORIZED("인증이 필요합니다."),
    INVALID_CREDENTIALS("인증 정보가 올바르지 않습니다."),
    TOKEN_EXPIRED("토큰이 만료되었습니다."),

    // ===== 권한 관련 (403) =====
    FORBIDDEN("접근 권한이 없습니다."),
    CLASS_ACCESS_DENIED("해당 반에 대한 접근 권한이 없습니다."),

    // ===== 리소스 없음 (404) =====
    CLASS_NOT_FOUND("반을 찾을 수 없습니다."),
    QUEST_NOT_FOUND("퀘스트를 찾을 수 없습니다."),
    USER_NOT_FOUND("사용자를 찾을 수 없습니다."),
    STUDENT_NOT_FOUND("학생을 찾을 수 없습니다."),
    TEACHER_NOT_FOUND("선생님을 찾을 수 없습니다."),
    RAID_NOT_FOUND("레이드를 찾을 수 없습니다."),
    GACHA_NOT_FOUND("가챠를 찾을 수 없습니다."),
    FISH_NOT_FOUND("물고기를 찾을 수 없습니다."),
    INVALID_INVITE_CODE("유효하지 않은 반 코드입니다."),

    // ===== 중복/충돌 (409) =====
    DUPLICATE_USERNAME("이미 사용 중인 아이디입니다."),
    DUPLICATE_EMAIL("이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME("이미 사용 중인 닉네임입니다."),
    DUPLICATE_FISH_NAME("이미 존재하는 물고기 이름입니다."),
    ALREADY_SUBMITTED("이미 제출된 퀘스트입니다."),
    ALREADY_JOINED("이미 참여 중인 반입니다."),

    // ===== 비즈니스 로직 오류 (400) =====
    INVALID_INPUT("입력값이 올바르지 않습니다."),
    QUEST_EXPIRED("마감일이 지난 퀘스트입니다."),
    INSUFFICIENT_CORAL("보유 코랄이 부족합니다."),
    INSUFFICIENT_RESEARCH_DATA("연구 자료가 부족합니다."),
    INVALID_QUEST_STATUS("퀘스트 상태가 올바르지 않습니다."),
    CANNOT_MODIFY_APPROVED_QUEST("승인된 퀘스트는 수정할 수 없습니다."),
    GACHA_ALREADY_DRAWN("이미 뽑기를 완료했습니다."),
    INVITE_CODE_GENERATION_FAILED("초대 코드 생성에 실패했습니다."),
    NO_FISH_AVAILABLE("뽑을 수 있는 물고기가 없습니다."),

    // ===== Personal Quest 관련 (400) =====
    TITLE_REQUIRED("제목은 필수입니다."),
    STUDENTS_REQUIRED("최소 1명 이상의 학생을 선택해야 합니다."),
    AI_REWARD_REQUIRED("AI 사용 시 AI 추천 보상 정보가 필요합니다."),
    ASSIGNMENT_NOT_FOUND("해당 할당을 찾을 수 없습니다."),
    ASSIGNMENT_ACCESS_DENIED("해당 퀘스트에 접근 권한이 없습니다."),
    ASSIGNMENT_NOT_SUBMITTED("제출되지 않은 퀘스트는 승인할 수 없습니다."),
    NOT_PROCESSED_YET("아직 처리되지 않은 퀘스트입니다."),

    // ===== 서버 오류 (500) =====
    INTERNAL_SERVER_ERROR("서버 오류가 발생했습니다."),
    DATABASE_ERROR("데이터베이스 오류가 발생했습니다."),
    FILE_UPLOAD_ERROR("파일 업로드 중 오류가 발생했습니다.");

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
