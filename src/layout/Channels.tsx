/**
 *    Menu element which shows all channels the user has access to and allows them to open them.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "../css/Channels.css";
import { useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { setCurrentChannel, db, removeChannel, currentChannel } from "../Firebase";

function Channels() {
    const [channels, setChannels] = useState<Array<string>>([]);
    useEffect(() => {
        const unsubscribe = onValue(ref(db, "messages"), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setChannels(Object.keys(data));
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <center>
            <img src="/logo192.png" alt="logo" className="logo" />
            <button className={`buttons${currentChannel === "main" ? " active" : ""}`} onClick={() => setCurrentChannel("main")}>
                Main channel
            </button>
            <hr />
            <h5>Channels</h5>
            <form onSubmit={(e) => {
                e.preventDefault();
                const possibleTargets = document.getElementsByClassName("channelName") as HTMLCollectionOf<HTMLInputElement>;
                let newName;
                if (!possibleTargets[0].value && possibleTargets.length > 1) {
                    newName = possibleTargets[1];
                } else {
                    newName = possibleTargets[0];
                }
                try {
                    if (newName.value.length > 24) {
                        alert("Channel name too long!");
                        return;
                    }
                    try {
                        setCurrentChannel(newName.value);
                    } catch (e) {
                        alert(e);
                    }
                } finally {
                    newName.value = "";
                }
            }}>
                <input type="text" className="channelName" placeholder="Enter a channel name" maxLength={24} />
            </form>
            {channels.map((channel) => { 
                if (channel === "main") return;
                return (
                    <div className="channelpair" key={channel}>
                        <button className={`buttons${currentChannel === channel ? " active" : ""}`} onClick={() => setCurrentChannel(channel)}>
                            {channel}
                        </button>
                        <button onClick={() => { if (window.confirm(`Confirm removal of ${channel}?`)) removeChannel(channel);}} className="oblbutton"></button>
                    </div>
                );
            })}
        </center>
    );
}

export default Channels;
