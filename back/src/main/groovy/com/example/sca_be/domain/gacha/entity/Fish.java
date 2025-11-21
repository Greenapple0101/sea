package com.example.sca_be.domain.gacha.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fish")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
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

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @OneToMany(mappedBy = "fish")
    private List<CollectionEntry> collectionEntries = new ArrayList<>();

    public void update(String fishName, FishGrade grade, Float probability, String imageUrl) {
        this.fishName = fishName;
        this.grade = grade;
        this.probability = probability;
        this.imageUrl = imageUrl;
    }
}
