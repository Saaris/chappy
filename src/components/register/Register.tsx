import './Register.css'
// import { RegisterSchema } from '../../frontenddata/zodSchema.ts';
import type { UserRegister } from "../../frontenddata/types.ts";
import { useState } from 'react';
import { LocalStorage_KEY } from '../../frontenddata/key.ts';
import { useUserStore } from '../../frontenddata/userStore';
import { useNavigate } from 'react-router';



const Register = () => {

	const navigate = useNavigate();
	useUserStore.getState().setGuest();

   const [formData, setFormData] = useState<UserRegister>({ username: '', password: '', accessLevel: 'user' });
   const [confirmPassword, setConfirmPassword] = useState('');
   const [errorMsg, setErrorMsg] = useState('')

   const handleSubmitReg = async () => {

      // const result = RegisterSchema.safeParse(formData);
      // if (!result.success) {
      //    // Visa valideringsfel
      //    return;
      // }

      if (formData.password !== confirmPassword) {
         // Visa felmeddelande: Lösenorden matchar inte
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
		setErrorMsg('')
			const jwt: string = data.token
			localStorage.setItem(LocalStorage_KEY, jwt) //JWT-token från backend sparas i webbläsarens localStorage för att användas vid framtida requests.
			console.log('registreringen lyckades')
			navigate('/chatPage'); 
         useUserStore.getState().setUsername(formData.username); //Sparar användarnamnet i Zustand-store.
         useUserStore.getState().setToken(jwt); //Sparar JWT-token i Zustand-store.

		} else {
			localStorage.removeItem(LocalStorage_KEY)
			setErrorMsg('Registrering misslyckades!')
		}
		
	}
    return <div className="register-column">
		     {errorMsg && <p className="error-message">{errorMsg}</p>}
				<p> Create new user </p>
				<div className='register-form'>
					<label> Username </label>
					<input type="text" placeholder="username"
					onChange={event => setFormData({ ...formData, username: event.target.value })}
					value={formData.username}
						
						/>

					<label> Password </label>
					<input type="password" placeholder="password"
					onChange={event => setFormData({ ...formData, password: event.target.value })}
					value={formData.password}
						/>
					<label> Confirm password </label>
					<input
					type="password"
					placeholder="confirm password"
					onChange={event => setConfirmPassword(event.target.value)}
					value={confirmPassword}
					/>
				
				<button onClick={handleSubmitReg} > Sign up </button>
				<button onClick={() => {
					navigate('/chatPage');
					}}>Continue as a guest</button>
				</div>
			</div>
}
export default Register