import { SPRITE_SIZE } from '../styles/images';
import shark_anim from '../styles/encyclopedia/Shark.png';
import octopus_anim from '../styles/encyclopedia/Octopus.png';
import turtle_anim from '../styles/encyclopedia/Turtle.png';
import eel_anim from '../styles/encyclopedia/ElectricEel.png';

export const getSpritePosition = (columnIndex: number, rowIndex: number): string => {
    const xOffset = -(columnIndex * SPRITE_SIZE);
    const yOffset = -(rowIndex * SPRITE_SIZE);

    return `${xOffset}px ${yOffset}px`;
};

export const FISH_ICONS: { [key: number]: { column: number, row: number, isAnimated?: boolean, animation?: { url: string, frames: number, duration?: number } } } = {
    // COMMON (7개) - 각각 독립적인 스프라이트 위치
    // 1: Tropical Fish
    1: { column: 7, row: 0 },
    // 2: Goldfish
    2: { column: 8, row: 1 },
    // 3: Guppy
    3: { column: 4, row: 0 },
    // 4: Neon Tetra
    4: { column: 3, row: 1 },
    // 5: Clownfish
    5: { column: 0, row: 1 },
    // 6: Seahorse
    6: { column: 1, row: 0 },
    // 7: Pufferfish
    7: { column: 2, row: 1 },

    // RARE (4개) - 각각 독립적인 애니메이션
    // 8: Stingray - 독립 애니메이션 (Electric Eel 애니메이션 사용)
    8: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: eel_anim, 
            frames: 6,
            duration: 0.8
        }
    },
    // 9: Shark - 독립 애니메이션
    9: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: shark_anim, 
            frames: 4,
            duration: 0.6
        }
    },
    // 10: Orca - 독립 애니메이션
    10: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: octopus_anim, 
            frames: 6,
            duration: 0.8
        }
    },
    // 11: Turtle - 독립 애니메이션
    11: {
        column: 0,
        row: 0,
        isAnimated: true,
        animation: {
            url: turtle_anim, 
            frames: 6,
            duration: 0.8
        }
    }
    // LEGENDARY (2개) - 빈칸으로 표시 (fish_id 12-13, 매핑 없음)
};