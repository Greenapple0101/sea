package com.example.sca_be.global.common;

//API 버전 관리용
public final class ApiVersion {

    private ApiVersion() {
        // 인스턴스화 방지
    }

    public static final String V1 = "/api/v1";

    public static final String AUTH = V1 + "/auth";

    public static final String CLASSES = V1 + "/classes";

    public static final String RAIDS = V1 + "/raids";

    public static final String STUDENTS = V1 + "/students";
}