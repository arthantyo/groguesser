import { fredoka } from "@/utils/fonts";
import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
interface TimerProps {
  totalTime: number; // milliseconds
  onFinish: () => void;
  reset?: boolean;
  running?: boolean;
}

export interface TimerHandle {
  reset: () => void;
}

const Timer = forwardRef<TimerHandle, TimerProps>(
  ({ running = true, totalTime, onFinish, reset }, ref) => {
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const finishedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      reset() {
        setTimeLeft(totalTime);
        finishedRef.current = false;
      },
    }));

    // Reset when props change
    useEffect(() => {
      if (reset) {
        setTimeLeft(totalTime);
        finishedRef.current = false;
      }
    }, [reset, totalTime]);

    // Timer ticking
    useEffect(() => {
      if (!running || finishedRef.current) return; // pause when not running

      if (timeLeft <= 0) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          setTimeout(() => onFinish(), 0);
        }
        return;
      }

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (!finishedRef.current) {
              finishedRef.current = true;
              setTimeout(() => onFinish(), 0);
            }
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [timeLeft, running, onFinish]);

    const totalSeconds = Math.ceil(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
      <div className="absolute z-20 transform -translate-x-1/2 select-none top-4 left-1/2">
        <div
          className={`relative w-28 h-10 rounded-2xl bg-black/40 backdrop-blur-md border-2 flex items-center justify-center
        border-green-500 overflow-hidden
        ${minutes === 0 ? "border-green-600" : "border-green-500"} ${
            fredoka.className
          }`}
        >
          <span className="font-bold text-white">
            {`${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`}
          </span>
        </div>
      </div>
    );
  }
);

export default Timer;
