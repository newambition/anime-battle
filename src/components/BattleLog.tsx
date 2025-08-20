import { useEffect, useRef } from 'react';

const BattleLog = ({ messages }: { messages: string[] }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-box text-ab-text h-34 w-full overflow-y-auto text-sm leading-relaxed">
      {messages.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default BattleLog;
