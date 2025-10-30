
import {NavLink} from 'react-router'

const Header = () => {

    return (
         <div className='header'>
         
            <nav className='navbar'>
                <NavLink to='register'>Register</NavLink>
                <NavLink to='login'>Login</NavLink>
            </nav>
        </div>
    );
};

export default Header;