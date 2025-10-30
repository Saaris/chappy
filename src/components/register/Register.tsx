import './Register.css'
import { RegisterSchema } from '../../frontenddata/zodSchema.ts';
import type { User } from "../../frontenddata/types.ts";

const Register = () => {

   const formData: User = { username: "Göran", password: "hemligt123" };

    
    const result = RegisterSchema.safeParse(formData);

    if (!result.success) {
     
	  console.log(result.error.issues);
    } else {
      // Data är OK, skicka till backend
      // t.ex. fetch("/api/users", { method: "POST", body: JSON.stringify(result.data) })
    }

    return <div className="register-column">
				<p> Sign up to Chappy chatapp </p>
				<div className='register-form'>
					<label> Username </label>
					<input type="text" placeholder="användarnamn"
						
						/>

					<label> Password </label>
					<input type="password" placeholder=""
						/>
				
				<button > Sign up </button>
				</div>
			</div>
}
export default Register