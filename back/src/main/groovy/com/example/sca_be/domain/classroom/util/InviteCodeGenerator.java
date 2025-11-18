package com.example.sca_be.domain.classroom.util;

import java.security.SecureRandom;

public class InviteCodeGenerator {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom random = new SecureRandom();

    /**
     * 8자리 초대 코드를 생성합니다.
     * 알파벳 대문자와 숫자로 구성됩니다.
     *
     * @return 8자리 초대 코드
     */
    public static String generate() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);

        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }

        return code.toString();
    }
}
