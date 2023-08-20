/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */

import { useEffect, useRef, useState } from "react";
import { auth, clearDatabases, db, toCommas, toDots, updateUser, uploadSysMsg, UserData, getData, changeAutomodThreshold } from "../Firebase";
import { onValue, ref, remove, set } from "firebase/database";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import "../css/Admin.css";
import "../css/CommonPopup.css";

function Admin() {
    const [userData, setUserData] = useState<{ [email: string]: UserData }>({});

    // Ensure that a user's UID using this module is on the admin collection
    // The admin attribute can only be altered by the Firebase owner.
    const [isAdmin, setIsAdmin] = useState(false);

    // Get data for all users that we can access
    useEffect(() => {
        const unsubscribe = onValue(ref(db, "users/"), (snapshot) => {
            setUserData(snapshot.val());
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (Object.keys(userData).length > 0) setIsAdmin(userData[toCommas(auth.currentUser?.email!)].admin);
    }, [userData]);

    // Add a user to the list of total users
    async function addUser() {
        const email = prompt("Enter the email address of the user you want to add.");
        if (!email) return;

        // Ensure we don't override any existing users
        if (userData[auth.currentUser?.email!]) {
            alert("This user already exists on the userlist!");
            return;
        }

        // Add proper user permissions if required
        // We do not have to explicitly set photoURL, displayName, or UID as that will be handled by Firebase.js
        let data;
        if (window.confirm("Grant " + email + " permissions to read and write?")) {
            data = {
                read: true,
                write: true,
                admin: false,
                upload: false
            };
        } else {
            data = {
                read: false,
                write: false,
                admin: false,
                upload: false
            };
        }

        if (window.confirm("Grant " + email + " permission to upload files?")) {
            data["upload"] = true;
        }

        // Commit to the database
        await set(ref(db, `users/${toCommas(email)}`), data)
            .then(() => {
                alert("Operation completed.");
            })
            .catch((err) => alert(err));
    }

    async function changeThreshold() {
        let currentThreshold = await getData("settings", "automod_threshold").then((res) => res);
        if (currentThreshold === null) currentThreshold = 0.5;
        const newThreshold = prompt(`Current AutoMod threshold is: ${currentThreshold}\n\nEnter new threshold (0.0 - 1.0):\n\nThe default value is 0.5, meaning if a message is 50% likely to be profane, it will be held for review. 0.0 will disable AutoMod.\n\nThis change will only apply to new messages.`);
        if (!newThreshold) return;
        if (isNaN(Number(newThreshold)) || Number(newThreshold) < 0) {
            alert("Invalid threshold entered.");
            return;
        }
        await changeAutomodThreshold(Number(newThreshold));
    }

    // Send a system message from the current administrator account
    async function sysMessage() {
        const message = prompt("Enter message text that will be posted to all channels as a special system message.\n\nThis message will bypass AutoMod but respect personal filters.");
        if (!message) return;

        const confirm = window.confirm(
            `Are you sure you want to send this message? This message can not be retracted!\n\n${message}`
        );
        if (!confirm) return;

        await uploadSysMsg(message).then(() => {
            alert("Operation completed.");
        });
    }

    async function change(user: UserData, target: string) {
        if (user.admin) {
            if (!user.read || !user.write || !user.upload) {
                await updateUser(user.email, {
                    read: true,
                    write: true,
                    upload: true
                });
                alert("We have noticed a discrepancy in this administrator's permissions. This has been corrected.");
                return;
            }
            alert("You cannot edit this user's permissions as they are a database-defined administrator.");
            return;
        }
        switch (target) {
            case "r":
                if (window.confirm(`${user.read ? "Revoke" : "Grant"} read permissions for ${toDots(user.email)}?`))
                await updateUser(user.email, {
                    read: !user.read,
                    write: !user.read === false ? false : user.write,
                    upload: !user.read === false ? false : user.upload
                });
                break;
            case "w":
                if (window.confirm(`${user.write ? "Revoke" : "Grant"} write permissions for ${toDots(user.email)}?`))
                await updateUser(user.email, {
                    read: !user.write === true ? true : user.read,
                    write: !user.write,
                    upload: !user.write === false ? false : user.upload
                });
                break;
            case "u":
                if (window.confirm(`${user.upload ? "Revoke" : "Grant"} upload permissions for ${toDots(user.email)}?`))
                await updateUser(user.email, {
                    read: !user.upload === true ? true : user.read,
                    write: !user.upload === true ? true : user.write,
                    upload: !user.upload
                });
                break;
            case "d":
                if (window.confirm(`delete ${toDots(user.email)} from the userlist?`))
                await remove(ref(db, `users/${toCommas(user.email)}`)).then(() => {
                    alert("Operation completed.");
                });
                break;
        }
    }

    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();

    return (
        <Popup
            ref={tref}
            trigger={<button className="bbqitem">Application control panel</button>}
            nested
        >
            <>
                <div className="outer" />
                <div className="inner">
                    {isAdmin ? (
                        <div className="authorised">
                            <span className="close" onClick={tclose}>
                                &times;
                            </span>
                            <div className="title">
                                <h4>Control Panel</h4>
                                <p className="portalreference">
                                    Previously known as the 1500-Megabyte App Managing Heavy Duty Super Admin Super Panel
                                </p>
                            </div>
                            <div className="users">
                                <h3 className="text-center">Users</h3>
                                <hr />
                                <ul>
                                    {Object.entries(userData).map(([email, user]) => {
                                        user.email = email;
                                        return (
                                            // If we can't get a key from their uid, we can settle for their email instead.
                                            // This prevents React from complaining about invalid key props
                                            <li key={user.uid ? user.uid : email}>
                                                <span style={{ color: user.admin ? "#ff5757" : "#fff", fontWeight: user.admin ? "bold" : "normal" }}>{toDots(email)}</span>
                                                <button onClick={() => change(user, "r")} style={{ backgroundColor: user.read ? "green" : "red" }}>R</button>
                                                <button onClick={() => change(user, "w")} style={{ backgroundColor: user.write ? "green" : "red" }}>W</button>
                                                <button onClick={() => change(user, "u")} style={{ backgroundColor: user.upload ? "green" : "red" }}>U</button>
                                                <button onClick={() => change(user, "d")} className="del">D</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <br />
                            <div className="settings">
                                <h3 className="text-center">Settings</h3>
                                <hr />
                                <button onClick={() => addUser()} className="new">
                                    Add a new user
                                </button>
                                <button className="thresh" onClick={() => changeThreshold()}>
                                    Change AutoMod threshold
                                </button>
                                <button className="sysmsg" onClick={() => sysMessage()}>
                                    Send a system message
                                </button>
                                <button className="cleardb" onClick={() => clearDatabases()}>
                                    <b>Clear databases</b>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <span className="close closer override" onClick={tclose}>
                                &times;
                            </span>
                            <h5>Insufficient permissions.</h5>
                            <p>You do not have permission to access the application control panel.</p>
                        </>
                    )}
                </div>
            </>
        </Popup>
    );
}

export default Admin;
