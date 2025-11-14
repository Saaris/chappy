import './Login.css'
import type { UserRegister } from "../../../frontenddata/types.ts";
import { useState } from 'react';
import { LocalStorage_KEY } from '../../../frontenddata/key.ts';
import { useUserStore } from '../../../frontenddata/userStore.ts';
import { useNavigate } from 'react-router';
import { getRegisterErrorMessage, RegisterSchema, validateAndGetError } from '../../../frontenddata/zodSchema.ts';



const Register = () => {

	const navigate = useNavigate();
	

   const [formData, setFormData] = useState<UserRegister>({ username: '', password: '', accessLevel: 'user', confirmPassword: '' });
   const [regErrorMsg, setRegErrorMsg] = useState('');
   const [regSuccessMsg, setRegSuccessMsg] = useState('');

   const handleSubmitReg = async () => {
	useUserStore.getState().setGuest();

    const validation = validateAndGetError(RegisterSchema, formData, getRegisterErrorMessage);

if (!validation.success) {
  setRegErrorMsg(validation.error);
  return;
}

      const response = await fetch('/api/users', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(formData)
      });
      let data;
      try {
         data = await response.json();
      } catch {
         data = null;
      }

      if (data && (data.success || data.user)) {
		setRegErrorMsg('')
			const jwt: string = data.token
			localStorage.setItem(LocalStorage_KEY, jwt) //JWT-token från backend sparas i webbläsarens localStorage för att användas vid framtida requests.
			setRegSuccessMsg('Register succed, now you can sign in!') 

			 setFormData({ username: '', password: '', accessLevel: 'user', confirmPassword: '' }); //töm formuläret
			useUserStore.getState().setUsername(formData.username); //Sparar användarnamnet i Zustand-store.
			useUserStore.getState().setToken(jwt); //Sparar JWT-token i Zustand-store.

			} else {
				localStorage.removeItem(LocalStorage_KEY)
				setRegErrorMsg('Register failed!')
			}
			
}
    return <div className="auth-column">
		    
				<p className='create-title'> Create new user </p>
				<form className='auth-form'>
					<label> Username </label>
					<input type="text" 
					placeholder="username"
					autoComplete="username"
					onChange={event => setFormData({ ...formData, username: event.target.value })}
					value={formData.username}
						
						/>

					<label> New password </label>
					<input type="password" placeholder="password"
					autoComplete="new-password"
					onChange={event => setFormData({ ...formData, password: event.target.value })}
					value={formData.password}
					
						/>
					<label> Confirm new password </label>
					<input
					type="password"
					placeholder="confirm password"
					autoComplete="new-password"
					onChange={event => setFormData({ ...formData, confirmPassword: event.target.value })}
					value={formData.confirmPassword}
					/>
				 {regErrorMsg && <p className="error-message">{regErrorMsg}</p>}
				 {regSuccessMsg && <p className="success-message">{regSuccessMsg}</p>}
				<button className='signup-button' onClick={handleSubmitReg}
				onKeyDown={e => { if (e.key === "Enter") handleSubmitReg(); }} > Sign up </button>
				<p className='or'>or</p>
				<button className='guest-button' onClick={() => {
					navigate('/chatPage');
					}}
					onKeyDown={e => { if (e.key === "Enter") navigate('/chatpage'); }}>Continue as a guest</button>
				</form>
			</div>
}
export default Register