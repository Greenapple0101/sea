package com.example.sca_be.domain.classroom.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateClassRequest {

    @NotBlank(message = "반 이름은 필수입니다.")
    @JsonProperty("class_name")
    private String className;

    private String grade;

    private String subject;

    private String description;

}