import  { useState } from 'react';
import { AlignRight, X } from 'lucide-react';
import logo from '/nhancit.png'
import './Navbar.css'
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { text: "HOME", href: "https://nhancit.com/" },
    { text: "ABOUT US", href: "/about" },
    { text: "EXPERTISE", href: "/expertise" },
    { text: "TOOLS", href: "/tools" },
    { text: "PROJECTS", href: "/projects" },
    { text: "BLOG", href: "/blog" },
    { text: "CONTACT US", href: "/contact" }
  ];

  return (
    <nav className="w-full">
      <div className="max-w-7xl mx-auto px-9">
        <div className="flex justify-between items-center h-25">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center">
              <a href="https://nhancit.com/"><img width={250} src={logo} alt="" /></a>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <a
                key={item.text}
                href={item.href}
                className="text-white relative group transition-colors duration-500  font-medium"
              >
                <span className="relative">
                  {item.text}
                  <span id='hrmenu' className="absolute  inset-x-0 top-6 bottom-0 h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-50 transition-transform duration-500 ease-in-out origin-left"></span>
                </span>
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-orange-500 transition-colors duration-500"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <AlignRight size={36} strokeWidth={0.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.text}
              href={item.href}
              className="text-white hover:text-orange-500 transition-colors duration-500 block px-3 py-2 text-base font-medium"
            >
              {item.text}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
//