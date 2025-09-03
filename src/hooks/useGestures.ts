import { useRef, useEffect, useCallback } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  threshold?: number;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export const useGestures = (config: GestureConfig) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const startTouch = useRef<TouchPosition | null>(null);
  const lastTap = useRef<number>(0);
  const initialDistance = useRef<number>(0);
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onDoubleTap,
    threshold = 50
  } = config;

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    
    if (e.touches.length === 1) {
      startTouch.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    } else if (e.touches.length === 2 && onPinch) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
    }
  }, [getDistance, onPinch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;
      onPinch(scale);
    }
  }, [getDistance, onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startTouch.current || e.touches.length > 0) return;

    const touch = e.changedTouches[0];
    const endTime = Date.now();
    const timeDiff = endTime - startTouch.current.time;
    
    // Double tap detection
    if (onDoubleTap && timeDiff < 300) {
      const tapInterval = endTime - lastTap.current;
      if (tapInterval < 500) {
        onDoubleTap();
        lastTap.current = 0;
        return;
      }
      lastTap.current = endTime;
    }

    // Swipe detection
    if (timeDiff < 500) {
      const deltaX = touch.clientX - startTouch.current.x;
      const deltaY = touch.clientY - startTouch.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > threshold || absDeltaY > threshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    }

    startTouch.current = null;
    initialDistance.current = 0;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, threshold]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Passive listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
};