import { useState } from 'react';
import Register from '../components/login-register/Register.tsx';
import Login from '../components/login-register/Login.tsx';

const LoginPage = () => {
	const [showRegister, setShowRegister] = useState(false);
	return (
		<div className='auth-page'>
			{showRegister ? (
				<Register onRegisterSuccess={() => setShowRegister(false)} />
			) : (
				<Login showRegister={showRegister} setShowRegister={setShowRegister} />
			)}
		</div>
	);
}
export default LoginPage