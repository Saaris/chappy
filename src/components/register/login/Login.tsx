import { LoginSchema } from "../../../frontenddata/zodSchema.ts";
import type { UserLogin } from "../../../frontenddata/types.ts";
import './Login.css'
import Register from './Register.tsx';
import { useState } from "react";
import { useNavigate } from 'react-router';
import { LocalStorage_KEY } from '../../../frontenddata/key.ts';
import { useUserStore } from "../../../frontenddata/userStore.ts";


const Login = () => {
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
			setLoginErrorMsg('Felaktigt användarnamn eller lösenord!')
			return
		}


		const data = await response.json()

		if (data && data.success) {
			useUserStore.getState().setUsername(formData.username);
			const jwt: string = data.token;
			localStorage.setItem(LocalStorage_KEY, jwt);
			
			console.log('Inloggningen lyckades');
			navigate('/chatPage'); 
		} else {
			localStorage.removeItem(LocalStorage_KEY);
		
		}
	}


return (
	<div className="auth-page">
		<Register />
		
		<div className="auth-column">
			
			<p>Login to Chappy</p>
			<div className="auth-form">
				<label>Username</label>
				<input type="text" placeholder="username"
					onChange={event => setFormData({ ...formData, username: event.target.value })}
					value={formData.username}
				/>
				<label>Password</label>
				<input type="password" placeholder="password"
					onChange={event => setFormData({ ...formData, password: event.target.value })}
					value={formData.password}
				/>
				{loginErrorMsg && <span> {loginErrorMsg} </span>}
				<button onClick={handleLogin}>Login</button>
			</div>
		</div>
		{/* <div className="register-column">
			
		</div> */}
	</div>
);
}
export default Login