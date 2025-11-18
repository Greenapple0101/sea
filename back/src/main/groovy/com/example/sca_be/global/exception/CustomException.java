package com.example.sca_be.global.exception;

import org.springframework.http.HttpStatus;

public class CustomException extends RuntimeException {
    private final ErrorCode errorCode;
    private final HttpStatus httpStatus;

    //기본
    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = determineHttpStatus(errorCode);
    }

    //http 메소드 바꾸기
    public CustomException(ErrorCode errorCode, HttpStatus httpStatus) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    //추가 메세지 붙일 때
    public CustomException(ErrorCode errorCode, String additionalMessage) {
        super(errorCode.getMessage() + " " + additionalMessage);
        this.errorCode = errorCode;
        this.httpStatus = determineHttpStatus(errorCode);
    }

    //errorCode를 HttpStatus로 자동 변환
    private HttpStatus determineHttpStatus(ErrorCode errorCode) {
        switch (errorCode) {
            // 401 Unauthorized
            case UNAUTHORIZED:
            case INVALID_CREDENTIALS:
            case TOKEN_EXPIRED:
                return HttpStatus.UNAUTHORIZED;

            // 403 Forbidden
            case FORBIDDEN:
            case CLASS_ACCESS_DENIED:
            case ASSIGNMENT_ACCESS_DENIED:
                return HttpStatus.FORBIDDEN;

            // 404 Not Found
            case CLASS_NOT_FOUND:
            case QUEST_NOT_FOUND:
            case USER_NOT_FOUND:
            case STUDENT_NOT_FOUND:
            case TEACHER_NOT_FOUND:
            case RAID_NOT_FOUND:
            case GACHA_NOT_FOUND:
            case INVALID_INVITE_CODE:
            case ASSIGNMENT_NOT_FOUND:
                return HttpStatus.NOT_FOUND;

            // 409 Conflict
            case DUPLICATE_USERNAME:
            case DUPLICATE_EMAIL:
            case DUPLICATE_NICKNAME:
            case ALREADY_SUBMITTED:
            case ALREADY_JOINED:
                return HttpStatus.CONFLICT;

            // 500 Internal Server Error
            case INTERNAL_SERVER_ERROR:
            case DATABASE_ERROR:
            case FILE_UPLOAD_ERROR:
                return HttpStatus.INTERNAL_SERVER_ERROR;

            // 나머지는 400 Bad Request
            default:
                return HttpStatus.BAD_REQUEST;
        }
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
