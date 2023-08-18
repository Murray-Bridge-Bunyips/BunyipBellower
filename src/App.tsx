/**
 *    Primary application configuration to manage all operations of the application.
 *    Manages Firebase integrations, and provides operation to the app.
 *    @author Lucas Bubner, 2023
 */

import "./css/App.css";

// Firebase imports and configuration
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, useAuthStateChanged } from "./Firebase";
import { onValue, ref } from "firebase/database";

// Import application login and chatroom windows
import Chat from "./chat/Chat";
import Login from "./chat/Login";

function App() {
    const [user] = useAuthState(auth);
    useAuthStateChanged();

    // April Fool's joke alert upon application load
    useEffect(() => {
        const time = new Date(Date.now());
        if (time.getMonth() + 1 === 4 && time.getDate() === 1 && user) {
            alert(
                "WARNING: This chat app has been noted by authorities as being in use by major War Criminals, proceed with extreme caution and report any suspicious actvity to // TODO: Contact Info"
            );
        }
    }, [user]);

    // Check user connectivity to the application
    const [online, setOnline] = useState<boolean>(false);
    const [longConnect, setlongConnect] = useState<boolean>(false);
    useEffect(() => {
        const unsubscribe = onValue(ref(db, ".info/connected"), (snapshot) => {
            setOnline(snapshot.val());
            setlongConnect(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!online) {
            document.title = "Establishing connection...";
            setTimeout(() => {
                setlongConnect(true);
            }, 5000);
        } else {
            document.title = "Bunyip Bellower";
        }
    }, [online]);

    return online ? (
        <div className="App">{user ? <Chat /> : <Login />}</div>
    ) : (
        <>
            <div className="offline">
                <img id="loadingimg" src="/logo192.png" alt="Bunyip Bellower Logo" onError={() => {
                    (document.getElementById("loadingimg") as HTMLElement).style.display = "none";
                    (document.getElementById("second-loader") as HTMLElement).style.display = "block";
                }} />
                <div id="second-loader" style={{ display: "none" }}>
                    <h1>Bunyip Bellower</h1>
                    <p className="conn">Connecting</p>
                </div>
            </div>
            {longConnect && (
                <p className="disc">
                    <br />
                    This seems to be taking a while. <br /> Please check your internet connection.
                </p>
            )}
        </>
    );
}

export default App;
