import React from 'react';
import styled from 'styled-components';
import { SPRITE_SHEET_URL, SPRITE_SIZE } from '../styles/images';
import { getSpritePosition, FISH_ICONS } from '../utils/sprite-helpers';

interface FishIconProps {
  fishId: number;
  scale: number;
}

const Sprite = styled.div<{ $position: string, $scale: number }>`
  /* 1. 스프라이트 시트 경로와 기본 크기 설정 */
  width: ${SPRITE_SIZE}px;
  height: ${SPRITE_SIZE}px;
  background-image: url(${SPRITE_SHEET_URL});
  
  /* 2. 브라우저 필터링 방지 (도트 깨짐 방지 필수) */
  image-rendering: pixelated; 
  
  /* 3. 확대/축소 및 위치 설정 */
  transform: scale(${(props) => props.$scale}); 
  transform-origin: top left;
  
  /* 4. 도우미 함수로 계산된 배경 위치 적용 */
  background-position: ${(props) => props.$position};
  
  /* 5. 확대 때문에 커진 실제 영역을 조정 (선택 사항) */
  margin-right: ${(props) => (props.$scale - 1) * SPRITE_SIZE}px; 
  margin-bottom: ${(props) => (props.$scale - 1) * SPRITE_SIZE}px;
`;

export const FishIcon: React.FC<FishIconProps> = ({ fishId, scale }) => {
  const iconData = FISH_ICONS[fishId];

  if (!iconData) {
    return <div aria-label={`Fish ID ${fishId} not found`} style={{ width: scale * SPRITE_SIZE, height: scale * SPRITE_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❓</div>;
  }

  // 원하는 물고기의 CSS background-position을 계산
  const position = getSpritePosition(iconData.column, iconData.row);

  return (
    <Sprite
      $position={position}
      $scale={scale}
      role="img"
      aria-label={`Fish ID ${fishId} icon`}
    />
  );
};