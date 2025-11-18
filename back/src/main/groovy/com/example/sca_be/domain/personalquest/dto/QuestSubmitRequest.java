package com.example.sca_be.domain.personalquest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QuestSubmitRequest {
    private String content;

    @JsonProperty("attachment_url")
    private String attachmentUrl;
}
