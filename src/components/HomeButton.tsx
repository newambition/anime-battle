import { HomeIcon } from 'lucide-react';

const HomeButton = () => {
  return (
    <button className="absolute top-4 right-4 rounded-full bg-white p-2">
      <HomeIcon className="h-6 w-6 text-black" />
    </button>
  );
};

export default HomeButton;
