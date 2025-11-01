import {NavLink} from 'react-router'
import './Header.css'
import logo from '../../assets/logo.png'


   
    


const Header = () => {
    const username = "guest"; //loggedInUsername || "guest";

    return (
         <div className='header'>
            <img src={logo} alt="chat logo" />
            <h2>Welcome {username}</h2>
            <nav className='navbar'>
                {/* <NavLink to='/'>Home</NavLink> */}
                <NavLink to='/register'>Register</NavLink>
                <NavLink to='/login'>Login</NavLink>
                <NavLink to='/'></NavLink>
                
            </nav>
        </div>
    );
};

export default Header;