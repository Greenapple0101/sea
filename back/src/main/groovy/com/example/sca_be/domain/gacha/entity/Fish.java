package com.example.sca_be.domain.gacha.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

//마스터 데이터여서 빌더가 없음(런타임 중에 엔터티 생성하는게 아님)
@Entity
@Table(name = "fish")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Fish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fish_id")
    private Integer fishId;

    @Column(name = "fish_name", nullable = false, length = 100)
    private String fishName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FishGrade grade;

    @Column(name = "probability", nullable = false)
    private Float probability;

    @OneToMany(mappedBy = "fish")
    private List<CollectionEntry> collectionEntries = new ArrayList<>();
}
