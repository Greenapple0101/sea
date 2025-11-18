package com.example.sca_be.global.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

//모든 api 응답은 해당 방식을 따를 것.
@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // null 값은 JSON에서 제외
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String errorCode;

    // ===== 성공 응답 팩토리 메서드 =====

    //데이터 없이 성공 응답만
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(true, null, null, null);
    }

    //메세지 포함하는 성공응답
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null, null);
    }

    //데이터 포함하는 성공응답
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data, null);
    }

    //메세지, 데이터 둘다 포함
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    //에러 코드와 메세지
    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return new ApiResponse<>(false, message, null, errorCode);
    }

    //에러코드, 메세지, 추가 데이터
    public static <T> ApiResponse<T> error(String errorCode, String message, T data) {
        return new ApiResponse<>(false, message, data, errorCode);
    }
}




