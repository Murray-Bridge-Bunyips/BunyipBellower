/**
 *    Navbar element to be shown at the top of the page, containing account and other information
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "../css/Navbar.css";
import { auth, db, signOut, startMonitoring, UserData, validateUsers } from "../Firebase";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import BBQ from "../windows/BBQ";
import Users from "../windows/Users";

function Navbar() {
    // When the module is first loaded, we need to start listening for their online presence
    useEffect(() => {
        // Disconnects are handled automatically by Firebase, and all we need to do
        // is start the initial monitoring sequence.
        startMonitoring(auth.currentUser?.email!);
        // Additionally call the validateUsers function to ensure that all users that
        // are currently online are actually online and not in a state of database limbo
        validateUsers();
    }, []);

    // Show current time in the Navbar
    const [currentTime, setCurrentTime] = useState<string>();
    useEffect(() => {
        const date = new Date();
        const timer = setInterval(() => {
            date.setTime(Date.now());
            setCurrentTime(date.toLocaleTimeString("en-AU", { hour12: true }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    /*
        These functions are called in the Navbar mainly for user presence, as some children
        in this component require the online and offline users information to be available
    */
    const [userData, setUserData] = useState<{ [email: string]: UserData }>({});
    useEffect(() => {
        const unsubscribe = onValue(ref(db, "users/"), (snapshot) => {
            setUserData(snapshot.val());
        });
        return () => unsubscribe();
    }, []);

    // Get all online users for use throughout the navbar and children
    const [onlineUsers, setOnlineUsers] = useState<Array<UserData>>([]);
    const [offlineUsers, setOfflineUsers] = useState<Array<UserData>>([]);
    const [unknownUsers, setUnknownUsers] = useState<Array<string>>([]);
    useEffect(() => {
        const allOnline: Array<UserData> = [];
        const allOffline: Array<UserData> = [];
        const allUnknown: Array<string> = [];
        Object.entries(userData).forEach((user) => {
            if (!user[1].uid || !user[1].online || !user[1].name || !user[1].pfp) {
                allUnknown.push(user[0]);
                return;
            }
            if (user[1].online === true) {
                allOnline.push(user[1]);
            } else {
                allOffline.push(user[1]);
            }
        });
        // Debounce the setting of the state to prevent unnecessary rerenders
        const debounceTimeout = setTimeout(() => {
            setOnlineUsers(allOnline);
            setOfflineUsers(allOffline);
            setUnknownUsers(allUnknown);
        }, 1000);
        return () => clearTimeout(debounceTimeout);
    }, [userData]);

    return (
        <>
            <div className="navbar">
                <img
                    className="navbar-brand"
                    src={auth.currentUser?.photoURL?.toString()}
                    onError={() => {
                        (document.getElementsByClassName("pfp")[0] as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDI4OCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODgiIGhlaWdodD0iMjg4IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIyIDEwOUMyMjIgMTM5LjM2NiAyMDQuNjQ3IDE2NS42OCAxNzkuMzE3IDE3OC41NjVDMjIzLjk4MSAxODcuNzE4IDI2Mi40NDMgMjEzLjg4NiAyODcuNjMzIDI1MEgyODhWMjg4SDBWMjUwSDAuMzY3MTg4QzI1LjU1NzQgMjEzLjg4NiA2NC4wMTkzIDE4Ny43MTggMTA4LjY4MyAxNzguNTY1QzgzLjM1MjggMTY1LjY4IDY2IDEzOS4zNjYgNjYgMTA5QzY2IDY1LjkyMTkgMTAwLjkyMiAzMSAxNDQgMzFDMTg3LjA3OCAzMSAyMjIgNjUuOTIxOSAyMjIgMTA5WiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K";
                    }}
                    referrerPolicy="no-referrer"
                    alt={`Profile of ${auth.currentUser?.displayName}`}
                />
                <p className="navbar-name">{auth.currentUser?.displayName}</p>
                <svg className="sobtn" onClick={async () => await signOut()} />
                <BBQ />
                <Users online={onlineUsers} offline={offlineUsers} unknown={unknownUsers} />
            </div>
            <h4 className="productname">Bunyip Bellower</h4>
            <p className="currenttime">
                {currentTime ? currentTime : "..."}, {userData ? onlineUsers.length + " user(s) online" : "..."}
            </p>
        </>
    );
}

export default Navbar;
