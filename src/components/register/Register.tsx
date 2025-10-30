import './Register.css'
// import { RegisterSchema } from '../../frontenddata/zodSchema.ts';
import type { User } from "../../frontenddata/types.ts";
import { useState } from 'react';
import { LS_KEY } from '../../frontenddata/key.ts';



const Register = () => {

   const [formData, setFormData] = useState<User>({ username: '', password: '' });
   const [confirmPassword, setConfirmPassword] = useState('');

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

      if (data && data.success) {
         alert("Registrering lyckades!");
         // eller visa ett meddelande i din komponent
      } else {
         alert("Registrering misslyckades!");
      }
   }


    return <div className="register-column">
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
				</div>
			</div>
}
export default Register