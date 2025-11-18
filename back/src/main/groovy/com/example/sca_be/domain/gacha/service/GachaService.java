package com.example.sca_be.domain.gacha.service;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.auth.repository.StudentRepository;
import com.example.sca_be.domain.gacha.dto.GachaDrawResponse;
import com.example.sca_be.domain.gacha.dto.GachaInfoResponse;
import com.example.sca_be.domain.gacha.entity.Collection;
import com.example.sca_be.domain.gacha.entity.CollectionEntry;
import com.example.sca_be.domain.gacha.entity.Fish;
import com.example.sca_be.domain.gacha.entity.FishGrade;
import com.example.sca_be.domain.gacha.repository.CollectionEntryRepository;
import com.example.sca_be.domain.gacha.repository.CollectionRepository;
import com.example.sca_be.domain.gacha.repository.FishRepository;
import com.example.sca_be.global.exception.CustomException;
import com.example.sca_be.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GachaService {

    private final StudentRepository studentRepository;
    private final FishRepository fishRepository;
    private final CollectionRepository collectionRepository;
    private final CollectionEntryRepository collectionEntryRepository;

    private static final int GACHA_COST = 10;
    private final Random random = new Random();

    /**
     * 가챠 정보 조회
     */
    public GachaInfoResponse getGachaInfo(Integer studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));

        // 등급별 확률 계산
        List<Fish> allFish = fishRepository.findAll();
        Map<FishGrade, Double> gradeProbabilityMap = allFish.stream()
                .collect(Collectors.groupingBy(
                        Fish::getGrade,
                        Collectors.summingDouble(fish -> fish.getProbability().doubleValue())
                ));

        // 확률표 생성
        List<GachaInfoResponse.ProbabilityInfo> probabilityTable = new ArrayList<>();
        for (FishGrade grade : FishGrade.values()) {
            double ratePercent = gradeProbabilityMap.getOrDefault(grade, 0.0) * 100.0;
            String displayName = getGradeDisplayName(grade);
            probabilityTable.add(GachaInfoResponse.ProbabilityInfo.builder()
                    .grade(grade.name())
                    .displayName(displayName)
                    .ratePercent(ratePercent)
                    .build());
        }

        return GachaInfoResponse.builder()
                .studentCoral(student.getCoral())
                .gachaCost(GACHA_COST)
                .probabilityTable(probabilityTable)
                .build();
    }

    /**
     * 등급 표시 이름 반환
     */
    private String getGradeDisplayName(FishGrade grade) {
        switch (grade) {
            case COMMON:
                return "커먼";
            case RARE:
                return "레어";
            case LEGENDARY:
                return "레전드";
            default:
                return grade.name();
        }
    }

    /**
     * 가챠 뽑기
     * 방안 1: 단순 확률 기반 추첨
     * - 모든 Fish의 probability를 누적하여 랜덤 추첨
     */
    @Transactional
    public GachaDrawResponse drawGacha(Integer studentId, com.example.sca_be.domain.gacha.dto.GachaDrawRequest request) {
        // 1. 학생 조회
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));

        // 2. 코랄 확인 및 차감
        if (!student.hasSufficientCoral(GACHA_COST)) {
            throw new CustomException(ErrorCode.INSUFFICIENT_CORAL);
        }
        student.deductCoral(GACHA_COST);

        // 3. 물고기 추첨
        Fish drawnFish = drawRandomFish();

        // 4. 컬렉션 조회 또는 생성
        Collection collection = collectionRepository.findByStudent(student)
                .orElseGet(() -> {
                    Collection newCollection = Collection.builder()
                            .student(student)
                            .build();
                    return collectionRepository.save(newCollection);
                });

        // 5. 물고기 추가 또는 수량 증가
        CollectionEntry entry = collectionEntryRepository
                .findByCollectionAndFish(collection, drawnFish)
                .orElse(null);

        boolean isNew = (entry == null);
        int currentCount;

        if (isNew) {
            // 신규 물고기
            entry = CollectionEntry.builder()
                    .collection(collection)
                    .fish(drawnFish)
                    .fishCount(1)
                    .build();
            collectionEntryRepository.save(entry);
            currentCount = 1;
        } else {
            // 중복 물고기
            entry.addFishCount(1);
            currentCount = entry.getFishCount();
        }

        // 6. 응답 생성
        return GachaDrawResponse.builder()
                .drawnFish(GachaDrawResponse.DrawnFishInfo.builder()
                        .fishId(drawnFish.getFishId())
                        .fishName(drawnFish.getFishName())
                        .grade(drawnFish.getGrade())
                        .isNew(isNew)
                        .currentCount(currentCount)
                        .build())
                .coralSpent(GACHA_COST)
                .remainingCoral(student.getCoral())
                .build();
    }

    /**
     * 확률 기반 물고기 추첨
     * - 모든 물고기의 probability를 누적하여 랜덤 추첨
     */
    private Fish drawRandomFish() {
        List<Fish> allFish = fishRepository.findAll();

        if (allFish.isEmpty()) {
            throw new CustomException(ErrorCode.NO_FISH_AVAILABLE);
        }

        // 누적 확률 계산
        double randomValue = random.nextDouble(); // 0.0 ~ 1.0
        double cumulativeProbability = 0.0;

        for (Fish fish : allFish) {
            cumulativeProbability += fish.getProbability();
            if (randomValue < cumulativeProbability) {
                return fish;
            }
        }

        // 예외 상황: 확률 합이 1.0이 아닐 경우 마지막 물고기 반환
        return allFish.get(allFish.size() - 1);
    }
}
