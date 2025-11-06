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
    const isLoggedIn = !!username && username !== "guest";
    const logout = useUserStore((state) => state.logout);
    const isProfileOpen = useProfileStore((state) => state.isProfileOpen);
    const openProfile = useProfileStore((state) => state.openProfile);
    const closeProfile = useProfileStore((state) => state.closeProfile);
    const setProfileUserId = useProfileStore((state) => state.setProfileUserId);

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
            username,
            username,
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
    const isLoginPage = location.pathname === '/login';

    return (
        <div className='header'>
            <nav className='navbar'>
                <div className="user-icon-container">
                    <FontAwesomeIcon 
                        icon={faUser} 
                        className={`user-icon${(!isLoggedIn || isLoginPage) ? 'disabled' : ''}`} 
                        onClick={! isLoginPage ? handleProfileClick : undefined}
                    />
                    
                    {isProfileOpen && (
                        <div className="profile-popup">
                            {isLoggedIn ? (
                                <>
                                    <button 
                                    className='logout-btn'
                                    onClick={handleLogout}>Logout</button>
                                    <button className='remove-btn' onClick={handleDeleteUserClick}> Remove this user<FontAwesomeIcon icon={faXmark} /> </button>
                                    <button
                                    className='close-btn' onClick={closeProfile}>Close</button>
                                </>
                            ) : (
                                <button className='login-btn' onClick={handleLogin}>Logga in</button>
                                
                            )}
                        </div>
                    )}
                </div>
                <NavLink to='/'></NavLink>
            </nav>
        </div>
    );
};

export default Header;