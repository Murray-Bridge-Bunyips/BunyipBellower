/**
 *    Popup table to show instructions on how to use ReactMarkdown in the chat.
 *    Notes: Why do 2 empty tags fix all my problems
 *    @author Lachlan Paul, 2023
 */

import { useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import "../css/CommonPopup.css";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

function MDTable() {
    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();
    return (
        <Popup ref={tref} trigger={<button className="bbqitem">Markdown Commands</button>} nested>
            <>
                <div className="outer" onClick={tclose} />
                <div className="inner">
                    <table>
                        <thead>
                            <tr>
                                <th>Element</th>
                                <th>When typing message</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Heading 1</td>
                                <td># Big Text</td>
                                <td>
                                    <ReactMarkdown># Big Text</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Heading 2</td>
                                <td>## Slightly Less Big Text</td>
                                <td>
                                    <ReactMarkdown>## Slightly Less Big Text</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Heading 3</td>
                                <td>### Less Big Text</td>
                                <td>
                                    <ReactMarkdown>### Less Big Text</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Heading 4</td>
                                <td>#### Even Less Big Text</td>
                                <td>
                                    <ReactMarkdown>#### Even Less Big Text</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Heading 5</td>
                                <td>##### Even Even Less Big Text</td>
                                <td>
                                    <ReactMarkdown>##### Even Even Less Big Text</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Heading 6</td>
                                <td>###### Even Even Even Less Big Text</td>
                                <td>
                                    <ReactMarkdown>###### Even Even Even Less Big Text</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Bold Letters</td>
                                <td>A **bold** word</td>
                                <td>
                                    <ReactMarkdown>A **bold** word</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Italics</td>
                                <td>But *maybe*</td>
                                <td>
                                    <ReactMarkdown>But *maybe*</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Code Block</td>
                                <td>`print("Hello World!")`</td>
                                <td>
                                    <ReactMarkdown>```print("Hello World!")```</ReactMarkdown>
                                </td>
                            </tr>
                            <tr>
                                <td>Strikethrough</td>
                                <td>~~Help~~</td>
                                <td>
                                    <ReactMarkdown remarkPlugins={[gfm]}>~~Help~~</ReactMarkdown>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <p className="text-center">
                        <b>Any invalid text/markdown will be converted to "Gracious Professionalism!"</b>
                    </p>
                </div>
            </>
        </Popup>
    );
}

export default MDTable;
