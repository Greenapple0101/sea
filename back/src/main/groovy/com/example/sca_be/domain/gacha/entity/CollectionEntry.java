package com.example.sca_be.domain.gacha.entity;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "collection_entries",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"collection_id", "fish_id"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CollectionEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "entry_id")
    private Integer entryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id")
    private Collection collection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fish_id")
    private Fish fish;

    @Column(name = "fish_count", nullable = false)
    private Integer fishCount = 1;

    @Builder
    public CollectionEntry(Collection collection, Fish fish, Integer fishCount) {
        this.collection = collection;
        this.fish = fish;
        this.fishCount = (fishCount != null) ? fishCount : 1;
    }

    public void addFishCount(int amount) {
        this.fishCount += amount;
    }
}