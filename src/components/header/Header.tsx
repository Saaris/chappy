import { NavLink } from 'react-router';
import { useNavigate } from 'react-router';
import { useUserStore } from '../../frontenddata/userStore';
import { useProfileStore } from '../../frontenddata/profileStore';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { handleDeleteUser } from '../../frontenddata/userActions';
import { useLocation } from 'react-router'

const Header = () => {
    const username = useUserStore((state) => state.username) || "guest";
    const isLoggedIn = !!username && username !== "guest";// kontrollerar om användaren är inloggad (inte guest)
    const logout = useUserStore((state) => state.logout);// logga ut från userStore
    const isProfileOpen = useProfileStore((state) => state.isProfileOpen);
    const openProfile = useProfileStore((state) => state.openProfile);
    const closeProfile = useProfileStore((state) => state.closeProfile);
    const setProfileUserId = useProfileStore((state) => state.setProfileUserId);// sätta användar-ID för profil

    const navigate = useNavigate();

    const handleProfileClick = () => {
        setProfileUserId(username);
        openProfile();
    };

    const handleLogout = () => {
        logout();
        
    };


    const handleDeleteUserClick = async () => {
        await handleDeleteUser(
            username, //anv som ska tas bort
            username, //nuvarande användare
            logout,
            navigate
        );
        closeProfile();
    };

    const handleLogin = () => {
        navigate('/login');
        closeProfile();
    };
    const location = useLocation();
    const isLoginPage = location.pathname === '/login'; // kolla om anv är på login-sidan

    return (
        <div className='header-container'>
            <nav className='navbar'>
                <div 
                    className="user-icon-container" 
                    data-tooltip={isLoggedIn ? 'logout' : 'login as user'}
                    onClick={!isLoginPage ? (isLoggedIn ? handleProfileClick : handleLogin) : undefined}
                >
                    <FontAwesomeIcon 
                        icon={faUser} 
                        className={`user-icon${(!isLoggedIn || isLoginPage) ? 'disabled' : ''}`}
                    />
                    
                    {isProfileOpen && isLoggedIn && (
                        <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
                            <button 
                                className='logout-btn'
                                onClick={(e) => { e.stopPropagation(); handleLogout(); }}>Logout</button>
                            <button className='remove-btn' onClick={(e) => { e.stopPropagation(); handleDeleteUserClick(); }}> Remove this user<FontAwesomeIcon icon={faXmark} /> </button>
                            <button
                                className='close-btn' onClick={(e) => { e.stopPropagation(); closeProfile(); }}>Close</button>
                        </div>
                    )}
                </div>
                <NavLink to='/'></NavLink>
            </nav>
        </div>
    );
};

export default Header;