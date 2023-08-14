/**
 *    Chat module to handle message rendering and management
 *    Will be shown to the user once login is verified.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { auth, db, getData, MessageData, toCommas, currentChannel } from "../Firebase";
import { createRef, useEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import Message from "./Message";
import Navbar from "../layout/Navbar";
import MessageBar from "./MessageBar";
import Channels from "../layout/Channels";
import "../css/Chat.css";

function Chat() {
    const [messages, setMessageData] = useState<{ [muid: string]: MessageData }>({});
    const [paginationIndex, setPaginationIndex] = useState<number>(1);
    const [authorised, setAuthorised] = useState(false);

    /** Global setting, manage how many messages should be rendered at once for all users. */
    const PAGINATION_LIMIT: number = 50;

    const pdummy = createRef<HTMLDivElement>();

    function updatePagination() {
        setPaginationIndex((prev) => prev + 1);
        pdummy.current?.scrollIntoView({ behavior: "auto" });
    }

    useEffect(() => {
        if (!auth.currentUser) return;
        // Block unauthorised users from accessing the application
        getData("users", toCommas(auth.currentUser.email!)).then((userData) => {
            if (!userData.read) {
                try {
                    alert(
                        `Access denied to ${
                            auth.currentUser!.email
                        }. You do not have sufficient permissions to view this chat.`
                    );
                } catch (e) {
                    // Any errors from the alert will be from the non-presence of auth.currentUser.email, meaning we have signed out.
                    // We can safely ignore and swallow the error. The cake is delicious and moist.
                    console.debug(e);
                }
                setAuthorised(false);
                auth.signOut();
            } else {
                setAuthorised(true);
            }
        });
    }, []);

    const lastSeenTimestampRef = useRef(Date.now());
    const [newMessage, setNewMessage] = useState(false);

    // Crappy hack to force a React update as it refuses to rerender when it should
    const [channel, setChannel] = useState(currentChannel);
    useEffect(() => {
        const interval = setInterval(() => {
            // Forcefully update the state with the imported variable to ensure a rerender is triggered
            setChannel(currentChannel);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Grand collection function that continually checks the message database for new/changed messages
    useEffect(() => {
        const unsubscribe = onValue(ref(db, `messages/${channel}/`), (snapshot) => {
            setMessageData(snapshot.val());
        });
        return () => unsubscribe();
    }, [channel]);

    // Set custom properties on a dummy object allow messages to appear fluidly
    const dummy = createRef<HTMLDivElement>();
    const lastMessage = useRef<number>();

    // Monitor Firebase for new changes update the new message hook. Notifications will also proc if:
    // a) The message has just been added to Firebase
    // b) The viewport is not currently visible and the user is in another tab
    // c) The message that was added to Firebase has a timestamp that is greater than the last seen timestamp for the user
    // This also ensures that the user gets scrolled down and notified only once.
    useEffect(() => {
        // Check if the messages array is here and we're ready to control elements
        if (dummy.current && messages && Object.keys(messages).length > 0) {
            // Get information about the last messages
            const lastMessageObject = Object.values(messages)[Object.values(messages).length - 1];
            const lastMessageTimestamp = lastMessageObject.createdAt;
            // Check if the last message has not been seen yet
            if (lastMessage.current !== lastMessageTimestamp) {
                dummy.current.scrollIntoView({ behavior: "auto" });
                if (lastMessageTimestamp > lastSeenTimestampRef.current) {
                    // Enable notifications if they are not on the page
                    setNewMessage(true);
                }
                lastMessage.current = lastMessageTimestamp;
            }
        }
    }, [messages, dummy]);

    // Proc the scroll-to-bottom at least once after we initially load in, so the user isn't
    // stuck at the top of the page upon entering if the useEffect above this doesn't work
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "auto",
            });
        }, 1000);
    }, []);

    // Set the state of the hidden variable depending on whether the user is on the chat app or not.
    // We don't want to notify that there's a new message if they're already on the chat app.
    const [hidden, setHidden] = useState(false);
    useEffect(() => {
        document.addEventListener("visibilitychange", () => {
            setHidden(document.hidden);
        });
        return () => {
            document.removeEventListener("visibilitychange", () => {
                setHidden(document.hidden);
            });
        };
    }, []);

    // Clear the hidden state and reset the timestamp to the latest message every time a new message
    // is received. This is done to know if the user has looked at the latest message or not.
    useEffect(() => {
        if (!hidden && messages && Object.keys(messages).length > 0) {
            lastSeenTimestampRef.current = Object.values(messages)[Object.values(messages).length - 1].createdAt;
            setNewMessage(false);
        }
    }, [hidden, messages]);

    // Change the title and favicon in the event that both:
    // a) A confirmed new message that conforms to the new message hook criteria exists
    // b) The user is not currently on the page and cannot see the current messages
    useEffect(() => {
        const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (newMessage && hidden) {
            document.title = "NEW MESSAGE!";
            if (favicon) favicon.href = "alert.ico";
        } else {
            document.title = "Bunyip Bellower";
            if (favicon) favicon.href = "favicon.ico";
        }
    }, [newMessage, hidden]);

    return (
        <>
            {authorised && (
                <>
                    {/* Navbar element with profile information */}
                    <Navbar />
                    <div className="chat">
                        {/* Menu element for changing channels */}
                        <Channels />
                        {/* Allow space for Navbar to fit */}
                        <br /> <br /> <br /> <br /> <br />
                        {/* Load more button to support pagination */}
                        {messages && Object.keys(messages).length > paginationIndex * PAGINATION_LIMIT ? (
                            <button className="moreitems" onClick={() => updatePagination()} />
                        ) : (
                            <>
                                <p className="top">
                                    Welcome to the Bunyip Bellower! <br /> This is the start of the <b>{channel}</b>{" "}
                                    channel.
                                </p>
                                <hr />
                            </>
                        )}
                        {/* Leading dummy for pagination support */}
                        <div id="paginationdummy" ref={pdummy}></div>
                        {/* Display all messages currently in Firebase */}
                        {messages &&
                            Object.keys(messages).length > 0 &&
                            Object.entries(messages)
                                .slice(paginationIndex * -PAGINATION_LIMIT)
                                .map(([muid, msg]) => <Message message={msg} key={muid} />)}
                        {/* Dummy element for fluid interface */}
                        <div id="dummy" ref={dummy}></div>
                        <br /> <br /> <br />
                        {/* Message bar with end-user options to add files and message */}
                        <MessageBar />
                    </div>
                </>
            )}
        </>
    );
}

export default Chat;
