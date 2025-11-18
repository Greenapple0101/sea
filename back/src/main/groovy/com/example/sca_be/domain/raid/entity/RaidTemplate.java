package com.example.sca_be.domain.raid.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RaidTemplate {
    ZELUS_INDUSTRY("젤라스 인디스트리 (원앙어선)", "침묵의 바다를 떠돌며 구시대의 유실 기술을 불법적으로 인양하여 독점하려는 거대 용병 기업. SCA의 기술 집약체 '코어 피쉬'를 포획하려 한다."),
    KRAKEN("크라켄 (변종 이상 개체)", "Cascade Fail 당시 방출된 불안정한 에너지와 나노머신에 의해 유전 정보가 뒤틀린 해양 생물. 활성화되는 아쿠아리스 에너지를 파괴하기 위해 거점을 집공한다.");

    private final String displayName;
    private final String description;
}
