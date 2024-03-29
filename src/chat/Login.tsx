/**
 *    Authentication module through Google Firebase.
 *    Will be shown to the user if userdata is not present upon visiting.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { signInWithGoogle, signInWithGitHub } from "../Firebase";
import "../css/Login.css";

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
            <img className="clubimg" src="/clubimgblur.png" alt="Murray Bridge Bunyip club" />
            <div className="login center">
                <div className="login-inner">
                    <h4>Welcome to the</h4>
                    <h2>Bunyip Bellower</h2>
                    <b className="small">DEVELOPER-ONLY RESTRICTED</b>
                    <br /> <br />
                    <button onClick={signInWithGoogle} className="googlebtn">
                        Sign in with Google
                    </button>
                    &nbsp; &nbsp;
                    <button onClick={signInWithGitHub} className="githubbtn">
                        Sign in with GitHub
                    </button>
                    <br /> <br />
                    <h6>
                        <b>Application developed by</b> <br />
                        Lucas Bubner <a href="https://github.com/bubner/"> @bubner</a> <br />
                        Lachlan Paul <a href="https://github.com/lachlanPaul/"> @lachlanPaul</a> <br />
                    </h6>
                    <br />
                    <footer>
                        Copyright (c) Lucas Bubner, Lachlan Paul, 2023 <br />
                        <a href="https://github.com/Murray-Bridge-Bunyips/BunyipBellower">Source code</a>
                    </footer>
                </div>
            </div>
        </>
    );
}

export default Login;
