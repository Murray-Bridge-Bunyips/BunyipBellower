/**
 *    Hamburger menu part of the Navbar containing various options.
 *    @author Lachlan Paul, 2023
 */

import { useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import Admin from "./Admin";
// I could go for a
import "../css/BBQ.css"; // bacon burger
import "../css/CommonPopup.css";
import { filterChange } from "../chat/MessageBar";
import MDTable from "./MDTable";
import About from "./About";
import ChannelWindow from "./ChannelWindow";

function BBQ() {
    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();

    return (
        <Popup ref={tref} trigger={<svg className="bbqbtn" />} nested>
            <>
                <div className="outer" onClick={tclose} />
                <div className="inner">
                    <h2 className="text-center" style={{ width: "400px" }}>
                        Options
                    </h2>
                    <hr />
                    <div className="buttonarea">
                        <About />
                    </div>
                    <hr />
                    <div className="buttonarea">
                        <Admin />
                    </div>
                    <hr />
                    <div className="buttonarea">
                        <button
                            onClick={() => {
                                document.title = "light mode on";
                                const elems = document.querySelectorAll("*") as NodeListOf<HTMLElement>;
                                for (const elem of elems) {
                                    elem.style.backgroundColor = "white";
                                    elem.style.display = "none";
                                }
                                setTimeout(() => {
                                    window.location.reload();
                                }, 3000);
                            }}
                        >
                            Enable light mode
                        </button>
                    </div>
                    <hr />
                    <div className="buttonarea">
                        <MDTable />
                    </div>
                    <hr />
                    <div id="mobilebuttons">
                        <br />
                        <h5 className="text-center">Mobile options</h5>
                        <hr />
                        <div className="buttonarea">
                            <ChannelWindow />
                        </div>
                        <hr />
                        <div className="buttonarea">
                            <button onClick={() => (document.getElementById("remote-open") as HTMLElement).click()}>
                                See active users
                            </button>
                        </div>
                        <hr />
                        <div className="buttonarea">
                            <button onClick={filterChange}>Change filter preference (currently {!localStorage.getItem("filter") ? "on" : "off"})</button>
                        </div>
                        <hr />
                    </div>
                </div>
            </>
        </Popup>
    );
}

// i dont like this formatting either ask lucas why he did it like this
// "barbeque bacon burger" - lucas

export default BBQ;

/* 
    "I could go for a BBQ bacon burger,
    and a large order of fries,
    and an orange soda with no ice, and a piece of hot apple pie."

    Man, I miss Burger Tank!
 */
