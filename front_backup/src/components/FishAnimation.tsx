import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const FRAME_SIZE = 48;

interface AnimatedFishProps {
    spriteUrl: string;
    totalFrames: number;
    scale: number;
    duration?: number;
}

// 애니메이션 keyframes 동적 생성 함수
const createSwimAnimation = (totalFrames: number) => keyframes`
    to {
        /* background-position-x: - (프레임 수 * 프레임 크기)로 이동 */
        background-position-x: -${totalFrames * FRAME_SIZE}px; 
    }
`;

const AnimatedSprite = styled.div<{ $scale: number, $totalFrames: number, $duration: number, $spriteUrl: string }>`
    /* 1. 개별 프레임 크기 설정 */
    width: ${FRAME_SIZE}px;
    height: ${FRAME_SIZE}px;
    
    /* 2. 애니메이션 이미지 경로 지정 */
    background-image: url(${(props) => props.$spriteUrl});
    
    /* 3. 확대/축소 및 픽셀 아트 설정 */
    transform: scale(${(props) => props.$scale});
    image-rendering: pixelated; 

/* 4. 애니메이션 속성 동적 적용 (steps와 duration) */
    ${(props) => {
        // totalFrames와 duration에 따라 고유한 애니메이션 속성 정의
        const swimAnimation = createSwimAnimation(props.$totalFrames);
        return css`
            animation: ${swimAnimation} ${props.$duration}s steps(${props.$totalFrames}) infinite;
        `;
    }}
`;

export const FishAnimation: React.FC<AnimatedFishProps> = ({
    spriteUrl,
    totalFrames,
    scale,
    duration = 0.5
}) => {

    return (
        <AnimatedSprite
            $scale={scale}
            $totalFrames={totalFrames}
            $duration={duration}
            $spriteUrl={spriteUrl}
            role="img"
            aria-label={`Animated fish sprite with ${totalFrames} frames`}
        />
    );
};