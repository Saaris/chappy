import { NavLink } from 'react-router';
import { useNavigate } from 'react-router';
import { useUserStore } from '../../frontenddata/userStore';
import { useProfileStore } from '../../frontenddata/profileStore';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { handleDeleteUser } from '../../frontenddata/userActions';
import { useLocation } from 'react-router';
import { useEffect } from 'react';
import chatLogo from '../../../public/chatLogo.png';

const Header = () => {
    const username = useUserStore((state) => state.username) || "guest";
    const isLoggedIn = !!username && username !== "guest";// kontrollerar om användaren är inloggad (inte guest)
    const logout = useUserStore((state) => state.logout);// logga ut från userStore
    const isProfileOpen = useProfileStore((state) => state.isProfileOpen);
    const openProfile = useProfileStore((state) => state.openProfile);
    const closeProfile = useProfileStore((state) => state.closeProfile);

    const navigate = useNavigate();

    // Stäng profil popup när användaren ändras eller vid första inladdning
    useEffect(() => {
        closeProfile();
    }, [username, closeProfile]);

    const handleProfileClick = () => {
        openProfile();
    };

    const handleLogout = () => {
        closeProfile(); 
        logout();
        navigate('/loginPage');
    };


    const handleDeleteUserClick = async () => {
        await handleDeleteUser(
            username, //anv som ska tas bort
            username, //nuvarande användare
            logout,
            () => {} // navigera inte direkt
        );
        setTimeout(() => {
            closeProfile();
            navigate('/loginPage');
        }, 1000); 
    }

    const handleLogin = () => {
        navigate('/loginPage');
        closeProfile();
    };
    const location = useLocation();
    const isLoginPage = location.pathname === 'loginPage'; 

    return (
        <div className='header-container'>
            <nav className='navbar'>
                <img 
                    src={chatLogo}
                    alt='chat logo'
                    className='chat-logo'
                />

                <div 
                    className="user-icon-container" 
                    data-tooltip={isLoggedIn ? 'user profile management' : 'login as user'}
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