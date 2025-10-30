import './Register.css'

const Register = () => {


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