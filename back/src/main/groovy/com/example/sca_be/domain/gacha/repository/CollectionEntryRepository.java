package com.example.sca_be.domain.gacha.repository;

import com.example.sca_be.domain.gacha.entity.Collection;
import com.example.sca_be.domain.gacha.entity.CollectionEntry;
import com.example.sca_be.domain.gacha.entity.Fish;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollectionEntryRepository extends JpaRepository<CollectionEntry, Integer> {
    Optional<CollectionEntry> findByCollectionAndFish(Collection collection, Fish fish);
}
