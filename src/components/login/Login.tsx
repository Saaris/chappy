import { LoginSchema } from "../../frontenddata/zodSchema";
import type { User } from "../../frontenddata/types.ts";
import './Login.css'

const Login = () => {

const formData: User = { username: "Göran", password: "hemligt123" };

    
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
     
      console.log(result.error.issues);
    } else {
      
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

				<button > Logga in </button>
				</div>
			</div>
}
export default Login