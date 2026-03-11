import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-8 py-3.5 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]">
      {/* Logo/Brand */}
      <div className="text-[22px] font-black font-['Segoe_UI',sans-serif] tracking-wide cursor-pointer" onClick={() => scrollToSection('home')}>
        <span className="text-[#FF3B30]">UZIMA</span>
        <span className="text-[#111]">NODE</span>
      </div>

      {/* Desktop Nav Links */}
      <div className="flex gap-7 items-center">
        <button 
          onClick={() => scrollToSection('home')}
          className="bg-transparent border-none no-underline text-[#444] text-[15px] font-semibold font-['Segoe_UI',sans-serif] transition-colors duration-200 hover:text-[#FF3B30] cursor-pointer"
        >
          Home
        </button>
        <button 
          onClick={() => scrollToSection('about')}
          className="bg-transparent border-none no-underline text-[#444] text-[15px] font-semibold font-['Segoe_UI',sans-serif] transition-colors duration-200 hover:text-[#FF3B30] cursor-pointer"
        >
          About
        </button>
        <button 
          onClick={() => scrollToSection('services')}
          className="bg-transparent border-none no-underline text-[#444] text-[15px] font-semibold font-['Segoe_UI',sans-serif] transition-colors duration-200 hover:text-[#FF3B30] cursor-pointer"
        >
          Services
        </button>
      </div>

      {/* Auth Buttons */}
      <div className="flex gap-3 items-center">
        <button 
          className="px-6 py-2.5 rounded-[10px] border-2 border-[#FF3B30] bg-transparent text-[#FF3B30] text-sm font-bold cursor-pointer font-['Segoe_UI',sans-serif] transition-all duration-200 ease-in-out hover:bg-[#FF3B30] hover:text-white"
          onClick={handleLogin}
        >
          Login
        </button>
        <button 
          className="px-6 py-2.5 rounded-[10px] border-2 border-[#FF3B30] bg-[#FF3B30] text-white text-sm font-bold cursor-pointer font-['Segoe_UI',sans-serif] transition-all duration-200 ease-in-out hover:bg-[#e63329]"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
