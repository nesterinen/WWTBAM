import { useState } from "react"

function AudioTest(){
    const [testAudio, setAudio] = useState(new Audio('/sounds/11 $100-$1,000 Questions.mp3'))

    return (
        <>
            <h1>hello</h1>
            <button onClick={() => testAudio.play()}>play</button>
            <button onClick={() => testAudio.pause()}>pause</button>
            <button onClick={() => setAudio(new Audio('/sounds/14 $2,000 Question.mp3'))}>next</button>
        </>
    )
}

export default AudioTest