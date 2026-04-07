import React, { useMemo, useState, useEffect } from 'react';

interface WatermarkProps {
  text: string;
  seed?: number;
}

const Watermark: React.FC<WatermarkProps> = ({ text, seed = 0 }) => {

  const [tick, setTick] = useState(0);
  const [time, setTime] = useState("");

  // cập nhật mỗi 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setTime(new Date().toLocaleTimeString("vi-VN"));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const watermarkItems = useMemo(() => {

    const items = [];
    const count = 6;

    for (let i = 0; i < count; i++) {

      const dynamicSeed = seed + tick;

      const top =
        ((Math.sin(dynamicSeed + i) + 1) * 40 + (i * 10)) % 90;

      const left =
        ((Math.cos(dynamicSeed * i + i) + 1) * 40 + (i * 5)) % 85;

      items.push({
        top: `${top}%`,
        left: `${left}%`,
        rotation: -20 - (i * 5)
      });

    }

    return items;

  }, [seed, tick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">

      {watermarkItems.map((item, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            transform: `rotate(${item.rotation}deg)`,
            transition: 'all 0.8s ease-in-out'
          }}
          className="text-slate-500/[0.08] text-sm sm:text-lg font-bold uppercase tracking-widest"
        >
          {text}
          <br/>
          {time}
        </div>
      ))}

    </div>
  );
};

export default Watermark;
