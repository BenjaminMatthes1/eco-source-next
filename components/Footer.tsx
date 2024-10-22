// components/Footer.tsx
const Footer: React.FC = () => {
    return (
      <footer className="footer p-4 bg-base-200 text-base-content">
        <div className="items-center grid-flow-col">
          <p>© {new Date().getFullYear()} Eco-Source. All rights reserved.</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  