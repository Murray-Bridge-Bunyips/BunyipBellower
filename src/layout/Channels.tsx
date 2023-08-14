/**
 *    Menu element which shows all channels the user has access to and allows them to open them.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "../css/Channels.css";
import { Fragment, useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { setCurrentChannel, db, removeChannel } from "../Firebase";

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
        <div className="menu">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <center>
                <form onSubmit={(e) => { e.preventDefault(); setCurrentChannel((document.getElementById("channelName") as HTMLInputElement).value); (document.getElementById("channelName") as HTMLInputElement).value = ""; }}>
                    <input type="text" id="channelName" placeholder="Enter a channel name" />
                </form>
                {channels.map((channel) => (
                    <Fragment key={channel}>
                        <button className="buttons" onClick={() => setCurrentChannel(channel)}>
                            {channel}
                        </button>
                        <button onClick={() => { if (window.confirm(`Confirm removal of ${channel}?`)) removeChannel(channel);}}>
                            obliterate {channel}
                        </button>
                    </Fragment>
                ))}
            </center>
        </div>
    );
}

export default Channels;
