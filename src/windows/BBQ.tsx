/**
 *    Hamburger menu part of the Navbar containing various options.
 *    @author Lachlan Paul, 2023
 */

import {useRef} from "react";
import Popup from "reactjs-popup";
import {PopupActions} from "reactjs-popup/dist/types";
import Admin from "./Admin";
// I could go for a
import "../css/BBQ.css"; // bacon burger
import "../css/CommonPopup.css";
import MDTable from "./MDTable";
import About from "./About";

function BBQ() {
    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();

    return (
        <Popup ref={tref} trigger={<svg className="bbqbtn"/>} nested>
            <>
                <div className="outer" onClick={tclose}/>
                <div className="inner inwin">
                    <div className="buttonarea">
                        <About/>
                    </div>
                    <hr/>
                    <div className="buttonarea">
                        <Admin/>
                    </div>
                    <hr/>
                    <div className="buttonarea">
                        <button onClick={() => alert("lol no")}>Enable Light Mode</button>
                    </div>
                    <hr/>
                    <div className="buttonarea">
                        <MDTable/>
                    </div>
                    <hr/>
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
