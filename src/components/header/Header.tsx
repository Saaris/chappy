import {NavLink} from 'react-router'
import { useUserStore } from '../../frontenddata/userStore';
import './Header.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

   
    


const Header = () => {
    const username = useUserStore((state) => state.username) || "guest";
    const isLoggedIn = !!username && username !== "guest";

            return (
                     <div className='header'>
                            
                            {/* <h2>Welcome {username ? username : "guest"}</h2> */}
                            <nav className='navbar'>
                                    {/* <NavLink to='/'>Home</NavLink> */}
                                    {/* <NavLink to='/register'>Register</NavLink> */}
                                    <div className="user-icon-container">
                                        <NavLink to={isLoggedIn ? '/login' : '/login'}>
                                            <FontAwesomeIcon icon={faUser} className="user-icon" />
                                            <span className={`user-hover-text`}>
                                                {isLoggedIn ? 'logout' : 'Register/login'}
                                            </span>
                                        </NavLink>
                                    </div>
                                    <NavLink to='/'></NavLink>
                            </nav>
                    </div>
            );
};

export default Header;