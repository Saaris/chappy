import { LoginSchema } from "../../frontenddata/zodSchema";

const Login = () => {

const formData = { username: "Göran", password: "hemligt123" };

    
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
     
      console.log(result.error.issues);
    } else {
      
    }

return <div className="register-column">
				<h2> Login to Chappy </h2>
				<label> Username</label>
				<input type="text" placeholder="användarnamn"
					
					/>

				<label> Password </label>
				<input type="password" placeholder=""
					/>

				<button > Logga in </button>
			</div>
}
export default Login