import { useEffect } from "react";

// Enable horizontal scroll with mouse wheel for MUI tab (PC - without shift+scroll)

export function useHorizontalWheelScroll(
  selector: string = ".MuiTabs-scroller",
  speed = 0.3
) {
  useEffect(() => {
    const scroller = document.querySelector(selector);
    if (!scroller) return;
    const handleWheel = (event: Event) => {
      const wheelEvent = event as WheelEvent;
      if (wheelEvent.deltaY !== 0) {
        wheelEvent.preventDefault();
        scroller.scrollLeft += wheelEvent.deltaY * speed;
      }
    };
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      scroller.removeEventListener("wheel", handleWheel);
    };
  }, [selector, speed]);
}
