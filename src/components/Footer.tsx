import './Footer.css';

const Footer: React.FC = () => {
  return (
    <p className='app-footer'>
               Version: {(process.env.REACT_APP_GIT_SHA || "").substring(0, 7) }
               </p>
  );
};

export default Footer;
