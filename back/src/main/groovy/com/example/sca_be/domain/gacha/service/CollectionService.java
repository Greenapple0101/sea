package com.example.sca_be.domain.gacha.service;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.auth.repository.StudentRepository;
import com.example.sca_be.domain.gacha.dto.AquariumResponse;
import com.example.sca_be.domain.gacha.dto.EncyclopediaResponse;
import com.example.sca_be.domain.gacha.entity.Collection;
import com.example.sca_be.domain.gacha.entity.CollectionEntry;
import com.example.sca_be.domain.gacha.entity.Fish;
import com.example.sca_be.domain.gacha.repository.CollectionRepository;
import com.example.sca_be.domain.gacha.repository.FishRepository;
import com.example.sca_be.global.exception.CustomException;
import com.example.sca_be.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionService {

    private final StudentRepository studentRepository;
    private final CollectionRepository collectionRepository;
    private final FishRepository fishRepository;

    /**
     * 내 수족관 조회 (획득한 물고기 목록)
     */
    public AquariumResponse getAquarium(Integer studentId) {
        // 1. 학생 조회
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));

        // 2. 컬렉션 조회
        Collection collection = collectionRepository.findByStudent(student)
                .orElseGet(() -> {
                    // 컬렉션이 없으면 빈 컬렉션 반환
                    return Collection.builder()
                            .student(student)
                            .build();
                });

        // 3. 획득한 물고기 목록 변환
        List<AquariumResponse.CollectedFishInfo> collectedFish = collection.getCollectionEntries().stream()
                .map(entry -> AquariumResponse.CollectedFishInfo.builder()
                        .entryId(entry.getEntryId())
                        .fishId(entry.getFish().getFishId())
                        .fishName(entry.getFish().getFishName())
                        .grade(entry.getFish().getGrade())
                        .fishCount(entry.getFishCount())
                        .build())
                .collect(Collectors.toList());

        // 4. 응답 생성
        return AquariumResponse.builder()
                .collectionId(collection.getCollectionId())
                .studentId(student.getMemberId())
                .totalCollected(collectedFish.size())
                .collectedFish(collectedFish)
                .build();
    }

    /**
     * 도감 조회 (전체 물고기 목록)
     */
    public EncyclopediaResponse getEncyclopedia(Integer studentId) {
        // 1. 학생 조회
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));

        // 2. 전체 물고기 목록 조회
        List<Fish> allFish = fishRepository.findAll();

        // 3. 학생의 컬렉션 조회
        Collection collection = collectionRepository.findByStudent(student)
                .orElse(null);

        // 4. 컬렉션 엔트리를 Map으로 변환 (Fish ID -> CollectionEntry)
        Map<Integer, CollectionEntry> collectedFishMap = (collection != null)
                ? collection.getCollectionEntries().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getFish().getFishId(),
                        entry -> entry
                ))
                : Map.of();

        // 5. 전체 물고기 목록을 도감 정보로 변환
        List<EncyclopediaResponse.FishInfo> fishList = allFish.stream()
                .map(fish -> {
                    CollectionEntry entry = collectedFishMap.get(fish.getFishId());
                    boolean isCollected = (entry != null);

                    return EncyclopediaResponse.FishInfo.builder()
                            .fishId(fish.getFishId())
                            .fishName(isCollected ? fish.getFishName() : "???")
                            .grade(fish.getGrade())
                            .isCollected(isCollected)
                            .fishCount(isCollected ? entry.getFishCount() : 0)
                            .build();
                })
                .collect(Collectors.toList());

        // 6. 수집률 계산
        int totalFish = allFish.size();
        int collectedCount = collectedFishMap.size();
        double collectionRate = (totalFish > 0) ? (collectedCount * 100.0 / totalFish) : 0.0;

        // 7. 응답 생성
        return EncyclopediaResponse.builder()
                .totalFish(totalFish)
                .collectedCount(collectedCount)
                .collectionRate(collectionRate)
                .fishList(fishList)
                .build();
    }
}
