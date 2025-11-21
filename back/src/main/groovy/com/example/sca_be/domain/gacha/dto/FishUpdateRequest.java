package com.example.sca_be.domain.gacha.dto;

import com.example.sca_be.domain.gacha.entity.FishGrade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FishUpdateRequest {
    @NotBlank(message = "물고기 이름은 필수입니다.")
    private String fish_name;

    @NotNull(message = "등급은 필수입니다.")
    private FishGrade grade;

    @NotNull(message = "확률은 필수입니다.")
    @Positive(message = "확률은 0보다 커야 합니다.")
    private Float probability;

    private String image_url;
}

