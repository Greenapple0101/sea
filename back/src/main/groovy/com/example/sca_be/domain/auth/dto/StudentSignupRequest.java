package com.example.sca_be.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSignupRequest {

    @NotBlank(message = "아이디는 필수입니다.")
    @Size(max = 50, message = "아이디는 50자 이하여야 합니다.")
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "실명은 필수입니다.")
    @Size(max = 50, message = "실명은 50자 이하여야 합니다.")
    @JsonProperty("real_name")
    private String realName;

    @NotBlank(message = "초대 코드는 필수입니다.")
    @Size(max = 20, message = "초대 코드는 20자 이하여야 합니다.")
    @JsonProperty("invite_code")
    private String inviteCode;

    @Email(message = "올바른 이메일 형식이어야 합니다.")
    @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
    private String email;

    @Size(max = 50, message = "닉네임은 50자 이하여야 합니다.")
    private String nickname;
}