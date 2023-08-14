/**
 *    Menu element which shows all channels the user has access to and allows them to open them.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "../css/Channels.css";
import {setCurrentChannel} from "../Firebase";

function Channels() {

    return (
        <>
        <div className = "menu">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <center>
                <button onClick={() => {setCurrentChannel("main");}} className="buttons">Main</button>
                <button onClick={() => {setCurrentChannel("sec");}} className="buttons">Sec</button>
            </center>
        </div>
        </>
    );
  }

  // New channels must be added manually
  /**
   * main: Bunyips Robotics Club
   * sec: Test Channel
   */
  const channels: Array<string> = ["main", "sec"];
export default Channels;