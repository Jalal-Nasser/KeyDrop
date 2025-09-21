'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CountdownTimerProps {
  initialMinutes: number;
  onExpire: () => void;
}

export function CountdownTimer({ initialMinutes, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      router.push('/shop');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire, router]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">
            Please complete your order within{' '}
            <span className="font-bold">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
            . After this time, your cart will be cleared and you'll be redirected.
          </p>
        </div>
      </div>
    </div>
  );
}
