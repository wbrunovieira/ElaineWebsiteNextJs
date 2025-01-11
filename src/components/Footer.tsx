import {
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaFacebook,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-primary via-primary/90 to-primary/80 text-white py-12 px-6 mt-16">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold tracking-wide uppercase mb-4">
            Follow Us
          </h2>
          <div className="flex justify-center items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 transition"
              aria-label="Instagram"
            >
              <FaInstagram className="text-3xl" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 transition"
              aria-label="TikTok"
            >
              <FaTiktok className="text-3xl" />
            </a>
            <a
              href="https://wa.me/00000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 transition"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="text-3xl" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 transition"
              aria-label="Facebook"
            >
              <FaFacebook className="text-3xl" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-gray-400 md:grid-cols-3 gap-8 mb-8 p-8">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-xl mb-4">
              About Us
            </h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong>Elaine Vieira</strong> is a seasoned
              expert with years of experience in energy
              manipulation, specializing in techniques such
              as dowsing, energy balancing, and spiritual
              harmonization.
            </p>
            <p className="text-sm text-gray-200 leading-relaxed">
              Her mission is to help individuals align their
              energies, rediscover inner peace, and achieve
              holistic well-being through transformative
              practices rooted in ancient wisdom and modern
              understanding.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-xl mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/services"
                  className="text-gray-200 hover:text-white transition"
                >
                  Our Services
                </a>
              </li>

              <li>
                <a
                  href="/contact"
                  className="text-gray-200 hover:text-white transition"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-xl mb-4">
              Contact
            </h3>

            <div className="flex flex-col items-left gap-2">
              <div>Elaine Vieira</div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-lg" />
                <span>Florida - USA</span>
              </div>
              <div>
                <a
                  href="mailto:elaine0301@me.com"
                  className="flex items-center gap-2 text-gray-200 hover:text-white transition"
                  aria-label="Send an email to Elaine Vieira"
                >
                  <FaEnvelope className="text-lg" />
                  elaine0301@me.com
                </a>
              </div>
              <div>
                <a
                  href="tel:+19548952263"
                  className="flex items-center gap-2 text-gray-200 hover:text-white transition"
                  aria-label="Call Elaine Vieira"
                >
                  <FaPhoneAlt className="text-lg" />
                  +1 (954) 895-2263
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start gap-4"></div>
          </div>
        </div>

        <div className="border-t border-gray-400 pt-6 text-center">
          <p className="text-sm text-gray-200">
            © {new Date().getFullYear()} WB Digital
            Solutions. All rights reserved.
          </p>
          <p className="text-sm text-gray-200 mt-2">
            Developed by{' '}
            <a
              href="https://www.wbdigitalsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
            >
              WB Digital Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
