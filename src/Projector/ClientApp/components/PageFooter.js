import { Link } from 'react-router';
import Translate from '~/components/Translate';

export default () => (
  <footer className="main-footer">
    <div className="footer-logo"> <Link to="/"> CreoWeb </Link> </div>
    <div className="footer-links">
      <Link to="/"> CreoWeb </Link>
      <Link to="/Login"><Translate message="HOME.LOGIN_BUTTON" /></Link>
      <Link to="/Signup"><Translate message="HOME.SIGNUP_BUTTON" /></Link>
    </div>
  </footer>
);