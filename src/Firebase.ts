/**
 *    Firebase configuration module for access to authentication and message storage.
 *    Contains utility methods for accessing user data and authorising internal application functions.
 *    @author Lucas Bubner, 2023
 */

// https://firebase.google.com/docs/web/setup#available-libraries
import { useEffect } from "react";
import { getApp, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import {
    child,
    get,
    getDatabase,
    onDisconnect,
    onValue,
    push,
    ref,
    remove,
    serverTimestamp,
    set,
    update,
} from "firebase/database";
import { deleteObject, getStorage, listAll, ref as sref } from "firebase/storage";
import { getFileURL } from "./chat/Message";

let app;

try {
    app = getApp();
} catch (error) {
    const firebaseConfig = {
        // Exposure of these Firebase API configurations are not a security risk,
        // and as such will not be put into a system environment variable.
        apiKey: "AIzaSyClq6xUOEayOkAYXx0OJbiiFU1D2PFvXq4",
        authDomain: "bunyipbellower.firebaseapp.com",
        projectId: "bunyipbellower",
        databaseURL: "https://bunyipbellower-default-rtdb.asia-southeast1.firebasedatabase.app",
        storageBucket: "bunyipbellower.appspot.com",
        messagingSenderId: "1021407241018",
        appId: "1:1021407241018:web:381d79b51804b683166603",
    };
    app = initializeApp(firebaseConfig);
}

// Initialise Firebase authentication and databases
const storage = getStorage(app);
const auth = getAuth(app);
const db = getDatabase(app);

// Store what channel the user is currently in
export let currentChannel = "main";

export function setCurrentChannel(channel: string): void {
    currentChannel = channel;
}

export async function removeChannel(channel: string): Promise<void> {
    return await remove(ref(db, `messages/${channel}`));
}

// Define structure of user data from Firebase
export interface UserData {
    email: string; // Primary key
    admin: boolean;
    read: boolean;
    write: boolean;
    online:
        | boolean
        | {
              lastseen: number;
          };
    uid: string | undefined;
    name: string | undefined;
    pfp: string | undefined;
}

// Define the structure of a message object
export interface MessageData {
    muid: string; // Primary key
    createdAt: number;
    displayName: string;
    email: string;
    id: string;
    isMsg: boolean;
    isRetracted: boolean;
    photoURL: string;
    text: string;
    uid: string;
}

// Internal function to handle database errors when retrieving or sending standard information
function errorHandler(err: any): void {
    // Error handler incase Black Mesa decides to do another experiment
    console.error(err);

    // Reload the page and tell the user something went wrong
    if (err.code === "PERMISSION_DENIED") {
        alert(
            "An error occurred while performing this action as one of your permission nodes is currently out of sync with the application. A page reload is required."
        );
    } else {
        alert(
            "Sorry! An error occurred attempting to perform the operation you were requesting. Error message:\n\n" +
                err +
                "\n\nYour window will be reloaded in 5 seconds."
        );
    }

    // Reload the page in 5 seconds and try again
    setTimeout(() => window.location.reload(), 5000);
}

// Monitor a user's presence in the database's online users section
export async function startMonitoring(email: string): Promise<void> {
    const onlineStatus = ref(db, `users/${toCommas(email)}/online`);

    // Set user presence as online when the user is here
    await set(onlineStatus, true);

    // Leave callback functions for Firebase to handle when the user disconnects
    await onDisconnect(ref(db, `users/${toCommas(email)}/online/lastseen`)).set(serverTimestamp());

    // Add a listener to the online status for this user changes during the lifetime of the app
    // If it changes, then this is clearly incorrect and we should change it back at once.
    // This is to prevent onDisconnect firing while there are still active sessions for that one user
    onValue(onlineStatus, async (snapshot) => {
        if (snapshot.val() !== true) {
            console.debug("User presence was set incorrectly. Correcting...");
            // Reset the status to online again
            await set(onlineStatus, true);
        }
    });

    // Attach an event listener to the blur event to tell if the user is idle
    // This is an attempt to fix the problem presented when a user is still technically connected
    // but shown as online while they are clearly not.
    const visChange = async () => {
        if (document.hasFocus()) {
            await set(onlineStatus, true);
            clearTimeout(offlineTimeout);
        } else {
            offlineTimeout = setTimeout(() => {
                // If the user is off the tab for more than 5 minutes,
                // then we can assume that they are no longer here.
                set(ref(db, `users/${toCommas(email)}/online/lastseen`), serverTimestamp());
            }, 5 * 60000);
        }
    };
    let offlineTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener("blur", visChange);
    window.addEventListener("focus", visChange);
}

// Handle signing out while also properly updating user presence
export async function signOut(): Promise<void> {
    if (!window.confirm("Sign out account: " + auth.currentUser?.email + "?")) return;

    const onlineStatus = ref(db, `users/${toCommas(auth.currentUser?.email!)}/online`);
    // Manually update user presence to be offline
    await set(onlineStatus, false);

    // Update last seen timestamp
    await set(ref(db, `users/${toCommas(auth.currentUser?.email!)}/online/lastseen`), serverTimestamp());
    await auth.signOut();

    // Refresh the page to clear the event listeners
    window.location.reload();
}

// Ensure all user's presences are actually valid by changing all currently online users presences to offline
// The startMonitoring callback will ensure that online users are left online, and falsely online users are not.
export async function validateUsers(): Promise<void> {
    const userData = await get(ref(db, "users"));
    userData.forEach((child) => {
        if (child.val().online === true) {
            // Set online value of child to offline if they are currently set to online
            set(ref(db, `users/${child.key}/online`), serverTimestamp());
        }
    });
}

// Provide Google sign in functionality and automatically registers a user into the auth instance
export function signInWithGoogle(): void {
    signInWithPopup(auth, new GoogleAuthProvider()).catch((error) => {
        console.error(`Google OAuth Failure: ${error.message}`);
    });
}

// Change dots to commas, db names that are supported
export function toCommas(str: string): string {
    return str.replace(/\./g, ",");
}

// Change commas back to dots, for proper reading
export function toDots(str: string): string {
    return str.replace(/,/g, ".");
}

// Check if a user has logged in before and give them base permissions if they haven't
export function useAuthStateChanged(): void {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Check if the user already exists in the "users" node
                onValue(ref(db, `users/${toCommas(user.email!)}`), (snapshot) => {
                    if (snapshot.exists()) {
                        // Ensure the user metadata exists and is up to date with the latest snapshot
                        // Checks and updates UID
                        if (snapshot.child("uid").val() !== user.uid) {
                            set(ref(db, `users/${toCommas(user.email!)}/uid`), user.uid);
                        }

                        // Checks and updates displayName
                        if (snapshot.child("name").val() !== user.displayName) {
                            set(ref(db, `users/${toCommas(user.email!)}/name`), user.displayName);
                        }

                        // Checks and updates photoURL
                        if (snapshot.child("pfp").val() !== user.photoURL) {
                            set(ref(db, `users/${toCommas(user.email!)}/pfp`), user.photoURL);
                        }
                    } else {
                        // If there are no snapshots for the user, create a new one with no permissions.
                        set(ref(db, `users/${toCommas(user.email!)}`), {
                            uid: user.uid,
                            name: user.displayName,
                            pfp: user.photoURL,
                            read: false,
                            write: false,
                            admin: false,
                        });

                        // Reload the window as the data collection methods may have already fired
                        window.location.reload();
                    }
                });
            }
        });

        return () => unsubscribe();
    }, []);
}

// Function to check if a message is over the character limit
export function isMessageOverLimit(message: string): boolean {
    return message.length > 4000;
}

// Function to add a message to Firebase
export async function uploadMsg(formVal: string): Promise<void> {
    // Prevent adding blank messages into Firebase
    if (!formVal) return;

    // Stop requests that have too many characters (> 4000)
    if (isMessageOverLimit(formVal)) {
        alert("Message exceeds the maximum length of 4000 characters. Please shorten your message.");
        return;
    }

    // Add to Firebase with UID, content, and user info
    const msgID = push(child(ref(db), "messages")).key;
    await set(ref(db, `messages/${currentChannel}/` + msgID), {
        isMsg: true,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        displayName: auth.currentUser?.displayName,
        text: formVal,
        photoURL: auth.currentUser?.photoURL,
        createdAt: serverTimestamp(),
    }).catch((error) => errorHandler(error));
}

export async function uploadFileMsg(url: string, type: string): Promise<void> {
    const msgID = push(child(ref(db), "messages")).key;
    await set(ref(db, `messages/${currentChannel}/` + msgID), {
        isMsg: false,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        displayName: auth.currentUser?.displayName,
        text: type + ":" + url,
        photoURL: auth.currentUser?.photoURL,
        createdAt: serverTimestamp(),
    }).catch((error) => errorHandler(error));
}

export async function updateMsg(id: string, content: object): Promise<void> {
    await update(ref(db, `messages/${currentChannel}/` + id), content);
}

export async function deleteMsg(id: string): Promise<void> {
    // Get the message reference from Firebase
    getData("messages/main", id).then(async (data: MessageData) => {
        if (!data.isMsg) {
            // Check if the document contains a file, if so, we'll have to delete from Firebase storage too
            const fileRef = sref(storage, getFileURL(data.text));
            await deleteObject(fileRef).catch((err) => errorHandler(err));
        }
        // Now we can safely delete the message as we've deleted any other objects related to it
        await remove(ref(db, `messages/${currentChannel}/` + id));
    });
}

// Sends a small system message that appears in the chat with no visible metadata. These messages are not retractable or single deletable.
export async function uploadSysMsg(message: string): Promise<void> {
    if (!message) return;
    // Message limits can be ignored, as these messages are administrator controlled.
    // Keep uid and email attached to display name to ensure validity and traceback for each system message.
    const msgID = push(child(ref(db), "messages")).key;
    await set(ref(db, `messages/${currentChannel}/` + msgID), {
        isMsg: true,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        displayName: `SYSTEM MESSAGE FROM ${auth.currentUser?.email?.toUpperCase()}`,
        text: message,
        photoURL: "sys",
        createdAt: serverTimestamp(),
    }).catch((error) => errorHandler(error));
}

export async function getData(endpoint: string, id: string): Promise<any> {
    // This function will return whatever it receives from the endpoint and id, therefore it can return any sort of data
    // whether it be an entire object node or just a value inside of a singular node.
    let datavalue = null;
    await get(child(ref(db), `${endpoint}/${id}`))
        .then((snapshot) => {
            if (snapshot.exists()) datavalue = snapshot.val();
        })
        .catch((err) => errorHandler(err));
    return datavalue;
}

export async function updateUser(email: string, changes: Object): Promise<void> {
    await update(ref(db, "users/" + email), changes);
}

export async function clearDatabases(): Promise<void> {
    // User confirmations
    if (!window.confirm("WARNING: You are about to delete all database messages. Are you sure you want to continue?"))
        return;

    const nums = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    // prettier-ignore
    if (window.prompt(`Please enter these four numbers in order to complete the database transaction: ${nums}`) !== nums.toString()) {
        alert("Operation cancelled. No data was changed.");
        return;
    }

    // Delete all Firebase Storage files
    await listAll(sref(storage, "files")).then((listResults) => {
        const promises = listResults.items.map((item) => {
            return deleteObject(item);
        });
        Promise.all(promises);
    });

    // Delete all Firebase Realtime Database messages
    await remove(ref(db, "messages")).then(() => {
        alert("Operation completed. A reload is required.");
        window.location.reload();
    });
}

export { auth, db, storage };
