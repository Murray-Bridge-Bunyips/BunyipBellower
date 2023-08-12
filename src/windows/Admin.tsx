/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */

import {useEffect, useRef, useState} from "react";
import {auth, clearDatabases, db, toCommas, toDots, updateUser, uploadSysMsg, UserData} from "../Firebase";
import {onValue, ref, remove, set} from "firebase/database";
import Popup from "reactjs-popup";
import {PopupActions} from "reactjs-popup/dist/types";
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
            };
        } else {
            data = {
                read: false,
                write: false,
                admin: false,
            };
        }

        // Commit to the database
        await set(ref(db, `users/${toCommas(email)}`), data)
            .then(() => {
                alert("Operation completed.");
            })
            .catch((err) => alert(err));
    }

    // Send a system message from the current administrator account
    async function sysMessage() {
        const message = prompt("Enter message text that will displayed to all users as a system message.");
        if (!message) return;

        const confirm = window.confirm(
            `Are you sure you want to send this message? This message can not be retracted!\n\n${message}`
        );
        if (!confirm) return;

        await uploadSysMsg(message).then(() => {
            alert("Operation completed.");
        });
    }

    // Manage the permissions of a selected user using prompts
    // I would do a popup that has checkboxes and it would commit the results after, but I decided that I don't care
    // prettier-ignore
    async function editUser(email: string) {
        if (userData[email].admin) {
            if (!userData[email].read || !userData[email].write) {
                // We know this user is an administrator, and therefore we will grant permissions without confirmation
                await updateUser(email, {
                    read: true,
                    write: true,
                });
                alert("We noticed a discrepancy in this administrator's read and write permissions. This has been corrected.");
            } else {
                alert("You cannot edit an administator's permissions as they will always be allowed full access.");
            }
            return;
        }

        // email variable is comma seperated, when displaying to user ensure to pass through toDots()
        if (!window.confirm(
            "You are viewing the permissions of: " + toDots(email) +
            "\n\nTheir current permissions are:" +
            "\nRead: " + userData[email].read.toString().toUpperCase() +
            "\nWrite: " + userData[email].write.toString().toUpperCase() +
            "\n\nIf you wish to edit these permissions or delete this user, press OK, otherwise press Cancel.")) {
            return;
        }

        let updatedata: { read?: boolean, write?: boolean } = {};
        if (auth.currentUser?.email !== toDots(email)) {
            if (window.confirm(`Current READ permission of user '${toDots(email)}' is set to: ${userData[email].read.toString().toUpperCase()}\n\n${userData[email].read ? "REMOVE" : "GRANT"} read permission?\n\nIf you wish to delete this user or cancel this operation, press Cancel on both permissions.`)) {
                updatedata.read = !userData[email].read;
            }
        }

        if (window.confirm(`Current WRITE permission of user '${toDots(email)}' is set to: ${userData[email].write.toString().toUpperCase()}\n\n${userData[email].write ? "REMOVE" : "GRANT"} write permission?\n\nIf you wish to delete this user or cancel this operation, press Cancel on both permissions.`)) {
            updatedata.write = !userData[email].write;
        }

        // Update permissions now
        if (Object.keys(updatedata).length > 0) {
            await updateUser(email, updatedata).then(() => {
                alert("Operation completed.");
            });
        } else {
            if (!window.confirm(`You have not updated any permissions.\n\nIf you wish to delete the user '${toDots(email)}' PRESS OK NOW.\n\nOtherwise, press Cancel to exit.`)) return;
            if (!window.confirm(`WARNING!\n\nYOU ARE ABOUT TO DELETE THIS USER: ${toDots(email)}\nTO COMPLETE THIS TRANSACTION, PRESS OK NOW.`)) {
                alert("Operation cancelled. No data was changed.");
                return;
            }
            // We've made sure that we want to be deleting this person, so goodbye user...
            await remove(ref(db, `users/${toCommas(email)}`)).then(() => {
                alert("Operation completed.");
            })
        }
    }

    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();

    return (
        <Popup
            ref={tref}
            trigger={<button className="bbqitem">1500 Megabyte App-Managing Heavy Duty Super-Admin Super Panel</button>}
            nested
        >
            <>
                <div className="outer"/>
                <div className="inner">
                    {isAdmin ? (
                        <div className="authorised">
                            <span className="close" onClick={tclose}>
                                &times;
                            </span>
                            <div className="title">
                                <h4>Application Administration Control Panel</h4>
                                <p className="portalreference">
                                    "Prolonged exposure to this module is not part of the test."
                                </p>
                            </div>
                            <div className="users">
                                <ul>
                                    {Object.entries(userData).map(([email, user]) => {
                                        return (
                                            // If we can't get a key from their uid, we can settle for their email instead.
                                            // This prevents React from complaining about invalid key props
                                            <li key={user.uid ? user.uid : email}>
                                                <button onClick={() => editUser(email)}>{toDots(email)}</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <br/>
                            <button onClick={() => addUser()} className="new">
                                Add a new user
                            </button>
                            <button className="sysmsg" onClick={() => sysMessage()}>
                                Send a system message
                            </button>
                            <span className="cleardb" onClick={() => clearDatabases()}>
                                <b>CLEAR DATABASES</b>
                            </span>
                        </div>
                    ) : (
                        <>
                            <span className="close override" onClick={tclose}>
                                &times;
                            </span>
                            <p>
                                Insufficient permissions to access the admin module.
                            </p>
                        </>
                    )}
                </div>
            </>
        </Popup>
    );
}

export default Admin;
