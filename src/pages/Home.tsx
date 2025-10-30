import logo from '../assets/logo.png'


const Home = () => {
   
    const username = "guest"; //loggedInUsername || "guest";

    return (
        <div>
            <h1>Start chatting with</h1>
            <img src={logo} alt="chat logo" />
            <h2>Welcome {username}</h2>
        </div>
    );
};

export default Home;