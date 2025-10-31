import {NavLink} from 'react-router'
import './Header.css'




const Header = () => {
    

    return (
         <div className='header'>
            <nav className='navbar'>
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/register'>Register</NavLink>
                <NavLink to='/login'>Login</NavLink>
                <NavLink to='/chatPage'>Chat</NavLink>
                
            </nav>
        </div>
    );
};

export default Header;