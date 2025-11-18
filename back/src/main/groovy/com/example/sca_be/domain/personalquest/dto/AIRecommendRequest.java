package com.example.sca_be.domain.personalquest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class AIRecommendRequest {
    @JsonProperty("quest_title")
    private String questTitle;

    @JsonProperty("quest_content")
    private String questContent;

    private Integer difficulty;

    @JsonProperty("student_ids")
    private List<Integer> studentIds;
}
