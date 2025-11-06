import {NavLink} from 'react-router'
import { useNavigate } from 'react-router';
import { useUserStore } from '../../frontenddata/userStore';
import { useProfileStore } from '../../frontenddata/profileStore';
import './Header.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
    

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
        closeProfile();
    };

    const handleDeleteUser = () => {
        navigate('/login');
        handleDeleteUser();
        closeProfile();
    };

    const handleLogin = () => {
        navigate('/login');
        closeProfile();
    };

    return (
        <div className='header'>
            <nav className='navbar'>
                <div className="user-icon-container">
                    <FontAwesomeIcon 
                        icon={faUser} 
                        className={`user-icon${!isLoggedIn ? ' disabled' : ''}`} 
                        onClick={handleProfileClick}
                    />
                    {isLoggedIn && (
                        <span className={`user-hover-text`}>
                            Logout
                        </span>
                    )}
                    {isProfileOpen && (
                        <div className="profile-popup">
                            {isLoggedIn ? (
                                <>
                                    <button onClick={handleLogout}>Logga ut</button>
                                    <button onClick={handleDeleteUser}><FontAwesomeIcon icon={faXmark} /> Ta bort användare</button>
                                    <button onClick={closeProfile}>Stäng</button>
                                </>
                            ) : (
                                <button onClick={handleLogin}>Logga in</button>
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