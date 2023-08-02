/**
 *    Authentication module through Google Firebase.
 *    Will be shown to the user if userdata is not present upon visiting.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { signInWithGoogle } from "./Firebase";
import "./Login.css";

function Login() {
    return (
        <>
            <div className="bg-wrapper">
                <ul className="circles">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <img style={{ borderRadius: "15px" }} src="/anim.svg" alt="Background animation" />
            </div>
            <img className="clubimg" src="/clubimgblur.png" alt="Murray Bridge Bunyips club" />
            <div className="login center">
                <div className="login-inner">
                    <h4>Welcome to the</h4>
                    <h2>Bunyips Chatapp</h2>
                    {/* Use Semantic Versioning (semver) here to indicate the current application version */}
                    <i>Version v1.1.0</i>
                    <br /> <br />
                    <button onClick={signInWithGoogle} className="googlebtn">
                        Sign in with Google
                    </button>
                    <br /> <br />
                    <h6>
                        <b>Application developed by</b> <br />
                        Lucas Bubner <a href="https://github.com/hololb/"> @hololb</a> <br />
                        Lachlan Paul <a href="https://github.com/BanjoTheBot/"> @BanjoTheBot</a> <br />
                    </h6>
                    <br />
                    <footer>
                        Copyright (c) 2023 Lucas Bubner <br />
                        <a href="https://github.com/hololb/BunyipsChatapp/">Source code</a>
                    </footer>
                </div>
            </div>
        </>
    );
}

export default Login;
