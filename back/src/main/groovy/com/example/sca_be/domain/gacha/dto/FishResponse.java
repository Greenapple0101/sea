package com.example.sca_be.domain.gacha.dto;

import com.example.sca_be.domain.gacha.entity.Fish;
import com.example.sca_be.domain.gacha.entity.FishGrade;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FishResponse {
    private Integer fish_id;
    private String fish_name;
    private FishGrade grade;
    private Float probability;
    private String image_url;

    public FishResponse(Fish fish) {
        this.fish_id = fish.getFishId();
        this.fish_name = fish.getFishName();
        this.grade = fish.getGrade();
        this.probability = fish.getProbability();
        this.image_url = fish.getImageUrl();
    }
}

