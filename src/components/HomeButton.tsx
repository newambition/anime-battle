import { HomeIcon } from 'lucide-react';

const HomeButton = () => {
  return (
    <button className="absolute top-4 right-4 rounded-full bg-white/40 p-2 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/80 hover:shadow-xl">
      <HomeIcon className="h-6 w-6 text-black" />
    </button>
  );
};

export default HomeButton;
