package com.example.sca_be.domain.gacha.service;

import com.example.sca_be.domain.gacha.dto.FishCreateRequest;
import com.example.sca_be.domain.gacha.dto.FishResponse;
import com.example.sca_be.domain.gacha.dto.FishUpdateRequest;
import com.example.sca_be.domain.gacha.entity.Fish;
import com.example.sca_be.domain.gacha.repository.FishRepository;
import com.example.sca_be.global.exception.CustomException;
import com.example.sca_be.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FishService {

    private final FishRepository fishRepository;

    public List<FishResponse> getAllFish() {
        List<Fish> fishList = fishRepository.findAll();
        return fishList.stream()
                .map(FishResponse::new)
                .collect(Collectors.toList());
    }

    public FishResponse getFishById(Integer fishId) {
        Fish fish = fishRepository.findById(fishId)
                .orElseThrow(() -> new CustomException(ErrorCode.FISH_NOT_FOUND));
        return new FishResponse(fish);
    }

    @Transactional
    public FishResponse createFish(FishCreateRequest request) {
        // 중복 이름 체크
        fishRepository.findAll().stream()
                .filter(f -> f.getFishName().equals(request.getFish_name()))
                .findFirst()
                .ifPresent(f -> {
                    throw new CustomException(ErrorCode.DUPLICATE_FISH_NAME);
                });

        Fish fish = Fish.builder()
                .fishName(request.getFish_name())
                .grade(request.getGrade())
                .probability(request.getProbability())
                .imageUrl(request.getImage_url())
                .build();

        Fish savedFish = fishRepository.save(fish);
        return new FishResponse(savedFish);
    }

    @Transactional
    public FishResponse updateFish(Integer fishId, FishUpdateRequest request) {
        Fish fish = fishRepository.findById(fishId)
                .orElseThrow(() -> new CustomException(ErrorCode.FISH_NOT_FOUND));

        // 중복 이름 체크 (자기 자신 제외)
        fishRepository.findAll().stream()
                .filter(f -> f.getFishName().equals(request.getFish_name()))
                .filter(f -> !f.getFishId().equals(fishId))
                .findFirst()
                .ifPresent(f -> {
                    throw new CustomException(ErrorCode.DUPLICATE_FISH_NAME);
                });

        fish.update(
                request.getFish_name(),
                request.getGrade(),
                request.getProbability(),
                request.getImage_url()
        );

        return new FishResponse(fish);
    }

    @Transactional
    public void deleteFish(Integer fishId) {
        Fish fish = fishRepository.findById(fishId)
                .orElseThrow(() -> new CustomException(ErrorCode.FISH_NOT_FOUND));
        fishRepository.delete(fish);
    }
}

