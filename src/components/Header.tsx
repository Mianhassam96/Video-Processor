import { Video } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] py-12 px-4 mb-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <Video className="w-12 h-12 text-white mr-3 animate-pulse" />
          <h1 className="text-5xl font-bold text-white tracking-tight">
            MutiMian
          </h1>
        </div>
        <p className="text-xl text-purple-100 max-w-2xl mx-auto">
          Transform your videos with powerful tools and seamless sharing
        </p>
        <div className="h-1 w-24 bg-white/30 mx-auto rounded-full" />
      </div>
    </header>
  );
};

export default Header;