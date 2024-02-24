/**
 *    About application section, including build framework, developer, and copyright information.
 *    @author Lucas Bubner, 2023
 */

import { useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import "../css/CommonPopup.css";
import "../css/About.css";

function About() {
    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();
    return (
        <Popup ref={tref} trigger={<button className="bbqitem">About this application</button>} nested>
            <>
                <div className="outer" onClick={tclose} />
                <div className="inner">
                    <h2 className="heading text-center">The Bunyip Bellower Project</h2>
                    <p className="font-italic text-center">
                        A custom solution to tackling communication issues in social club settings.
                    </p>
                    <table className="abtable">
                        <tbody>
                            <tr>
                                <td>
                                    <img
                                        alt="Profile of Lucas Bubner"
                                        height="50"
                                        src="https://avatars.githubusercontent.com/u/81782264"
                                    />
                                </td>
                                <td className="font-weight-bold">Lucas Bubner</td>
                                <td>
                                    <a
                                        rel="noreferrer"
                                        target="_blank"
                                        className="ghlink"
                                        href="https://github.com/bubner/"
                                    >
                                        @bubner
                                    </a>
                                </td>
                                <td>Lead programmer and backend manager</td>
                            </tr>
                            <tr>
                                <td>
                                    <img
                                        alt="Profile of Lachlan Paul"
                                        height="50"
                                        src="https://avatars.githubusercontent.com/u/99004034"
                                    />
                                </td>
                                <td className="font-weight-bold">Lachlan Paul</td>
                                <td>
                                    <a
                                        rel="noreferrer"
                                        target="_blank"
                                        className="ghlink"
                                        href="https://github.com/BanjoTheBot/"
                                    >
                                        @BanjoTheBot
                                    </a>
                                </td>
                                <td>Application and frontend designer</td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <div className="infogrid">
                        <img
                            title="Source code"
                            alt="GitHub source"
                            src="/gh.png"
                            onClick={() =>
                                window.open("https://github.com/Murray-Bridge-Bunyips/BunyipBellower", "_blank")
                            }
                        />
                        &nbsp; || &nbsp;
                        <img
                            title="React"
                            alt="React"
                            src="/react.svg"
                            onClick={() => window.open("https://reactjs.org/", "_blank")}
                        />
                        <img
                            title="TypeScript"
                            alt="TypeScript"
                            src="/ts.svg"
                            onClick={() => window.open("https://www.typescriptlang.org/", "_blank")}
                        />
                        <img
                            title="Vite"
                            alt="Vite"
                            src="/vite.svg"
                            onClick={() => window.open("https://vitejs.dev/", "_blank")}
                        />
                        <img
                            title="Firebase"
                            alt="Firebase"
                            src="/fb.svg"
                            onClick={() => window.open("https://firebase.google.com/", "_blank")}
                        />
                        <img
                            title="Bootstrap"
                            alt="Bootstrap"
                            src="/bs.svg"
                            onClick={() => window.open("https://getbootstrap.com/", "_blank")}
                        />
                    </div>
                    <br />
                    <h6 className="text-center">
                        Copyright (c) Lucas Bubner, Lachlan Paul, 2023 under the{" "}
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://raw.githubusercontent.com/Murray-Bridge-Bunyips/BunyipBellower/prod/LICENSE"
                        >
                            MIT License
                        </a>
                        .
                    </h6>
                </div>
            </>
        </Popup>
    );
}

export default About;
