import { useEffect, useRef } from 'react';

const BattleLog = ({ messages }: { messages: string[] }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="font-mangat h-36 overflow-y-auto text-xs leading-loose">
      {messages.map((msg, index) => {
        if (msg.startsWith('⚔️')) {
          return (
            <div key={index} className="text-center font-bold">
              {msg}
            </div>
          );
        }
        if (msg.startsWith('🔵') || msg.startsWith('🟡')) {
          const icon = msg.substring(0, 2);
          const text = msg.substring(2);
          return (
            <div key={index} className="text-center">
              <span>{icon}</span>
              <span className="ml-1">{text}</span>
            </div>
          );
        }
        return (
          <div key={index} className="text-center">
            {msg}
          </div>
        );
      })}
      <div ref={logEndRef} />
    </div>
  );
};

export default BattleLog;
