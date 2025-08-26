'use client';

import { useEffect, useState } from 'react';

interface BouncingImage {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  image: string;
  size: number;
}

interface BouncingImagesProps {
  images: string[];
  count?: number;
}

export default function BouncingImages({ images, count = 5 }: BouncingImagesProps) {
  const [bouncingImages, setBouncingImages] = useState<BouncingImage[]>([]);

  useEffect(() => {
    // 무작위로 이미지 선택
    const selectedImages = images
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    // 초기 위치와 속도 설정
    const initialImages: BouncingImage[] = selectedImages.map((image, index) => ({
      id: index,
      x: Math.random() * (window.innerWidth - 200) + 100, // 100px ~ (화면너비-100px)
      y: Math.random() * (window.innerHeight - 200) + 100, // 100px ~ (화면높이-100px)
      vx: (Math.random() - 0.5) * 10, // x 방향 속도 (더 빠르게)
      vy: (Math.random() - 0.5) * 10, // y 방향 속도 (더 빠르게)
      image,
      size: Math.random() * 40 + 160, // 160px ~ 200px 크기
    }));

    setBouncingImages(initialImages);

    // 애니메이션 루프
    const animate = () => {
      setBouncingImages(prevImages => 
        prevImages.map(img => {
          let newX = img.x + img.vx;
          let newY = img.y + img.vy;
          let newVx = img.vx;
          let newVy = img.vy;

          // 벽에 부딪힐 때 방향 전환 - 이미지 크기의 절반만큼 여백 확보
          const halfSize = img.size / 2;
          if (newX <= halfSize || newX >= window.innerWidth - halfSize) {
            newVx = -newVx;
            newX = Math.max(halfSize, Math.min(window.innerWidth - halfSize, newX));
          }

          if (newY <= halfSize || newY >= window.innerHeight - halfSize) {
            newVy = -newVy;
            newY = Math.max(halfSize, Math.min(window.innerHeight - halfSize, newY));
          }

          return {
            ...img,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        })
      );
    };

    const intervalId = setInterval(animate, 50); // 20fps

    return () => clearInterval(intervalId);
  }, [images, count]);

  return (
    <>
      {bouncingImages.map((img) => (
        <div
          key={img.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: img.x,
            top: img.y,
            width: img.size,
            height: img.size,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img 
            src={img.image} 
            alt="공연 소품"
            className="w-full h-full object-contain"
            onError={(e) => {
              // 이미지 로드 실패 시 대체 텍스트 표시
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span class="text-xs text-gray-500 font-pretendard-medium text-center leading-tight">
                      ${img.image.split('/').pop()?.replace('.png', '')}
                    </span>
                  </div>
                `;
              }
            }}
          />
        </div>
      ))}
    </>
  );
}
