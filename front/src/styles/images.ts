import loadingFishGif from './loading_fish.gif';
import loadingBirdGif from './loading_bird.gif';
import fishAll from './encyclopedia/fish_all.png';
import coral from './encyclopedia/forage_all.png';

export const SPRITE_SIZE = 16;

export const SPRITE_COLUMNS = 10;
export const SPRITE_ROWS = 10;

export const SPRITE_SHEET_URL = fishAll;
export const SPRITE_coral = coral;

export const IMAGES = {
    loadingFish: loadingFishGif,
    loadingBird: loadingBirdGif,

    // 기본 이미지 (매핑된 이미지가 없을 때 사용)
    FishIcon_Default: "https://placehold.co/150x150/png?text=Unknown",
};

export type ImageKeys = keyof typeof IMAGES;