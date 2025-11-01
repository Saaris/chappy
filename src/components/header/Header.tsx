import {NavLink} from 'react-router'
// import { useUserStore } from '../../frontenddata/userStore';
import './Header.css'
import logo from '../../assets/logo.png'


   
    


const Header = () => {
    // const username = useUserStore((state) => state.username) || "guest";

    return (
         <div className='header'>
            <img src={logo} alt="chat logo" />
            {/* <h2>Welcome {username ? username : "guest"}</h2> */}
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