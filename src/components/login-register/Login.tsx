import type { UserLogin } from "../../frontenddata/types.ts";
import '../login-register/Login.css'
import { useState } from "react";
import { useNavigate } from 'react-router';
import { LocalStorage_KEY } from '../../frontenddata/key.ts';
import { useUserStore } from  '../../frontenddata/userStore.ts'
import { LoginSchema } from "../../frontenddata/zodSchema.ts";


const Login = ({ setShowRegister }: { showRegister: boolean, setShowRegister: (v: boolean) => void }) => {
	const navigate = useNavigate();
	const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');
	const [formData, setFormData] = useState<UserLogin>({ username: '', password: '' });

	const handleLogin = async () => {
		setLoginErrorMsg('')
		const result = LoginSchema.safeParse(formData);
		if (!result.success) {
			setLoginErrorMsg('Could not login! Check username and password.');
			return;
		}
		useUserStore.getState().setUsername(formData.username);

		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		})
		if( response.status !== 200 ) {
			setLoginErrorMsg('Wrong username or password!')
			return
		}

		const data = await response.json()

		if (data && data.success) {
			useUserStore.getState().setUsername(data.username);
			useUserStore.getState().setUserId(data.userId);
			const jwt: string = data.token;
			localStorage.setItem(LocalStorage_KEY, jwt);
			navigate('/chatPage'); 
		} else {
			localStorage.removeItem(LocalStorage_KEY);
		}
	}

	return (
		<div className="auth-column">
			<p className='create-title'>Login to start chat</p>
			<form className="auth-form">
				<label>Username</label>
				<input type="text" placeholder="username"
					autoComplete="username"
					onChange={event => setFormData({ ...formData, username: event.target.value })}
					value={formData.username}
				/>
				<label>Password</label>
				<input type="password"
						placeholder="password"
						autoComplete="current-password"
						onChange={event => setFormData({ ...formData, password: event.target.value })}
						value={formData.password}
					/>
				<span className="login-error-message" style={{ minHeight: "1.5em", display: "block" }}>
					{loginErrorMsg || "\u00A0"}
					</span>
				<button 
				className='login-button' onClick={handleLogin}
				onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}>Login</button>
			
			<p className="register-link-text">
				Not a registered user?{' '}
				<span className="register-link" onClick={() => setShowRegister(true)} role="button" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowRegister(true); }}>
					Register here!
				</span>
			</p>
			<p className='or'>or</p>
			<button className='guest-button' onClick={() => {
					navigate('/chatPage');
				}}
					onKeyDown={e => { if (e.key === "Enter") navigate('/chatpage'); }}>Continue as a guest</button>
			</form>	
		</div>
	)
}
export default Login