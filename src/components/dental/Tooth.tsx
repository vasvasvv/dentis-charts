import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ToothRecord } from '@/types/dental';

interface ToothProps {
  number: number;
  isUpper: boolean;
  record?: ToothRecord;
  isSelected: boolean;
  onClick: () => void;
  alignBottom?: boolean;
}

// Specific mapping for lower teeth (right side: 25-32)
const LOWER_RIGHT_MAPPING: Record<number, number> = {
  32: 24,
  31: 23,
  30: 22,
  29: 22,
  28: 21,
  27: 20,
  26: 19,
  25: 18,
};

// Mapping for left side (17-24) - mirrors right side
const LOWER_LEFT_MAPPING: Record<number, number> = {
  17: 24,
  18: 23,
  19: 22,
  20: 22,
  21: 21,
  22: 20,
  23: 19,
  24: 18,
};

// Get the image number and whether it should be mirrored
function getToothImage(toothNumber: number, isUpper: boolean): { imageNumber: number; mirrored: boolean } {
  if (isUpper) {
    if (toothNumber >= 1 && toothNumber <= 8) {
      return { imageNumber: toothNumber, mirrored: false };
    } else {
      return { imageNumber: 17 - toothNumber, mirrored: true };
    }
  } else {
    if (toothNumber >= 25 && toothNumber <= 32) {
      return { imageNumber: LOWER_RIGHT_MAPPING[toothNumber], mirrored: false };
    } else {
      return { imageNumber: LOWER_LEFT_MAPPING[toothNumber], mirrored: true };
    }
  }
}

export function Tooth({ number, isUpper, record, isSelected, onClick, alignBottom = false }: ToothProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasIssue = !!(record && (record.description || record.notes || record.files.length > 0));
  
  const { imageNumber, mirrored } = getToothImage(number, isUpper);
  const imagePath = `/teeth/${imageNumber}.png`;

  // Canvas dimensions
  // Canvas dimensions (scaled 1.5x for larger teeth)
  const canvasWidth = 48; // 32 * 1.5
  const canvasHeight = 84; // 56 * 1.5

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas immediately
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Create an offscreen canvas to detect non-transparent bounds (crop transparent padding)
      const tmp = document.createElement('canvas');
      tmp.width = img.width;
      tmp.height = img.height;
      const tctx = tmp.getContext('2d');
      if (tctx) {
        tctx.drawImage(img, 0, 0);
        const imgData = tctx.getImageData(0, 0, tmp.width, tmp.height).data;
        let minX = tmp.width, minY = tmp.height, maxX = 0, maxY = 0;
        for (let y = 0; y < tmp.height; y++) {
          for (let x = 0; x < tmp.width; x++) {
            const idx = (y * tmp.width + x) * 4;
            if (imgData[idx + 3] > 0) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // If no non-transparent pixel found, fall back to full image
        if (maxX < minX || maxY < minY) {
          minX = 0;
          minY = 0;
          maxX = tmp.width - 1;
          maxY = tmp.height - 1;
        }

        const sx = minX;
        const sy = minY;
        const sw = maxX - minX + 1;
        const sh = maxY - minY + 1;

        // Save context state
        ctx.save();

        // Apply mirroring if needed
        if (mirrored) {
          ctx.translate(canvasWidth, 0);
          ctx.scale(-1, 1);
        }

        // Draw the cropped tooth image scaled to canvas size
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);

        // Restore context
        ctx.restore();
      }
      
      // Apply red overlay only on non-transparent pixels if there's an issue
      if (hasIssue) {
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 0) {
            // Blend with red (destructive color: ~239, 68, 68)
            data[i] = Math.min(255, data[i] * 0.8 + 239 * 0.2);     // R
            data[i + 1] = Math.min(255, data[i + 1] * 0.8 + 68 * 0.2); // G
            data[i + 2] = Math.min(255, data[i + 2] * 0.8 + 68 * 0.2); // B
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      setIsLoaded(true);
    };

    img.onerror = () => {
      console.error(`Failed to load tooth image: ${imagePath}`);
    };

    img.src = imagePath;
  }, [imagePath, mirrored, hasIssue, record?.description, record?.notes, record?.files?.length, record?.templateId]);

  // Handle click only on non-transparent pixels
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    // Only trigger click if pixel is not transparent
    if (pixel[3] > 10) {
      onClick();
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center flex-none w-[18px] md:w-[24px]",
        alignBottom ? "justify-end" : "justify-start"
      )}
    >
      {/* Tooth number - above for upper */}
      {isUpper && (
        <span className="text-[8px] md:text-[10px] font-medium text-muted-foreground leading-none text-center w-full">
          {number}
        </span>
      )}
      
      {/* Tooth canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick}
        className={cn(
          'cursor-pointer transition-transform duration-200 block flex-none',
          'hover:scale-105',
          'w-[18px] md:w-[24px] h-[56px] md:h-[72px]',
          !isLoaded && 'opacity-0'
        )}
        style={{ imageRendering: 'auto' }}
      />
      
      {/* Tooth number - below for lower */}
      {!isUpper && (
        <span className="text-[8px] md:text-[10px] font-medium text-muted-foreground leading-none text-center w-full">
          {number}
        </span>
      )}
    </div>
  );
}
