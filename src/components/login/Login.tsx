import { LoginSchema } from "../../frontenddata/zodSchema";
import type { User } from "../../frontenddata/types.ts";
import './Login.css'
import { useState } from "react";
import { LS_KEY } from '../../frontenddata/key.ts';

const Login = () => {

	const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');
	const formData: User = { username: "Göran", password: "hemligt123" };

	
	const result = LoginSchema.safeParse(formData);

	if (!result.success) {
	 
	  console.log(result.error.issues);
	} else {
	  
	}


	const handleLogin = async () => {
		setLoginErrorMsg('')

		// TODO: gör login-knappen disabled tills denna funktion är färdig
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		})
		if( response.status !== 200 ) {
			// Något gick fel - login misslyckades
			// TODO: visa stylat meddelande för användaren
			// Snyggare om felmeddelandet inte flyttar på resten av formuläret - använd margin och position:absolute.
			setLoginErrorMsg('Felaktigt användarnamn eller lösenord!')
			return
		}

		// Servern skickar tillbaka ett objekt: { success: boolean, token?: string }
		// TODO: validera med Zod att data variabeln matchar objektet
		const data = await response.json()

		if( data.success ) {
			const jwt: string = data.token
			localStorage.setItem(LS_KEY, jwt)
			// TODO: visa för användaren att man är inloggad
			console.log('Inloggningen lyckades')

		} else {
			localStorage.removeItem(LS_KEY)
			// Visa meddelande för användaren?
		}
	}


return <div className="login-column">
				<p> Login to Chappy </p>
				<div className="login-form">
				<label> Username</label>
				<input type="text" placeholder="användarnamn"
					
					/>

				<label> Password </label>
				<input type="password" placeholder=""
				
					/>
					{loginErrorMsg && <span> {loginErrorMsg} </span>}

				<button onClick={handleLogin} > Logga in </button>
				</div>
			</div>
}
export default Login