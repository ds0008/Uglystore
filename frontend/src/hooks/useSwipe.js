import { useRef, useCallback } from "react";

export default function useSwipe({ onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onDoubleTap, onLongPress, threshold = 50 }) {
  const touchStart = useRef(null);
  const touchTime = useRef(0);
  const lastTap = useRef(0);
  const longPressTimer = useRef(null);

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    touchTime.current = Date.now();

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        touchStart.current = null;
      }, 500);
    }

    const now = Date.now();
    if (now - lastTap.current < 300 && onDoubleTap) {
      onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [onDoubleTap, onLongPress]);

  const onTouchEnd = useCallback((e) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const elapsed = Date.now() - touchTime.current;

    if (elapsed > 500) { touchStart.current = null; return; }

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDy > absDx && absDy > threshold) {
      if (dy < 0 && onSwipeUp) onSwipeUp();
      else if (dy > 0 && onSwipeDown) onSwipeDown();
    } else if (absDx > absDy && absDx > threshold) {
      if (dx > 0 && onSwipeRight) onSwipeRight();
      else if (dx < 0 && onSwipeLeft) onSwipeLeft();
    }

    touchStart.current = null;
  }, [onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, threshold]);

  const onTouchMove = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  return { onTouchStart, onTouchEnd, onTouchMove };
}
