import { useState, useEffect, useRef, useLayoutEffect } from 'react'

import { type Stage, type Score } from './Types'

import { msToHMS, msToHMSvaried } from './utils/msToHMS.ts'
import audioPreloader from './utils/audioPreloader.ts'
import loadAndRandomizeQuiz from './utils/loadAndRandomizeQuiz.ts'

import HighscoresMenu from './menus/HighScoresMenu.tsx'

import { password } from './config/admin.json'

import { useHighscores } from './customHooks/highscores.ts'

import musicNote from './assets/music-note.svg'
import musicNoteSlash from './assets/music-note-slash.svg'
import exitSvg from './assets/exit.svg'

import millionareLogo from '/WWTBAMUS2020Logo.png'
import './App.css'

import kysymykset from './questions/kysymykset.json'
import kysymykset1 from './questions/kysymykset1.json'
import kysymykset2 from './questions/kysymykset2.json'
import kysymykset3 from './questions/kysymykset3.json'
import kysymykset4 from './questions/kysymykset4.json'
import kysymykset5 from './questions/kysymykset5.json'
import kysymykset6 from './questions/kysymykset6.json'


import Balls from './effects/balls_background/balls.tsx'
import Confetti from './effects/confetti_background/Confetti.tsx'

/*
import '../public/sounds/11 $100-$1,000 Questions.mp3'

import '../public/sounds/16 $2,000 Lose.mp3'
import '../public/sounds/14 $2,000 Question.mp3'
import '../public/sounds/17 $2,000 Win.mp3'

import '../public/sounds/19 $4,000 Question.mp3'
import '../public/sounds/21 $4,000 Lose.mp3'
import '../public/sounds/22 $4,000 Win.mp3'

import '../public/sounds/24 $8,000 Question.mp3'
import '../public/sounds/26 $8,000 Lose.mp3'
import '../public/sounds/27 $8,000 Win.mp3'

import '../public/sounds/29 $16,000 Question.mp3'
import '../public/sounds/31 $16,000 Lose.mp3'
import '../public/sounds/32 $16,000 Win.mp3'

//32k win is long because in the show it is a minimum victory treshold
//16k win is used at 32k
import '../public/sounds/34 $32,000 Question.mp3'
import '../public/sounds/36 $32,000 Lose.mp3'

import '../public/sounds/39 $64,000 Question.mp3'
import '../public/sounds/41 $64,000 Lose.mp3'
import '../public/sounds/42 $64,000 Win.mp3'

import '../public/sounds/44 $125,000 Question.mp3'
import '../public/sounds/46 $125,000 Lose.mp3'
import '../public/sounds/47 $125,000 Win.mp3'

import '../public/sounds/49 $250,000 Question.mp3'
import '../public/sounds/51 $250,000 Lose.mp3'
import '../public/sounds/52 $250,000 Win.mp3'

import '../public/sounds/54 $500,000 Question.mp3'
import '../public/sounds/56 $500,000 Lose.mp3'
import '../public/sounds/57 $500,000 Win.mp3'

import '../public/sounds/59 $1,000,000 Question.mp3'
import '../public/sounds/61 $1,000,000 Lose.mp3'
import '../public/sounds/62 $1,000,000 Win.mp3'

import '../public/sounds/67 50-50.mp3'
*/

function StageMachine(
  {
    backToMenu, 
    muted,
    muteEffects,
    stageMagazine,
    addScore
  }:
  {
    backToMenu: () => void,
    muted: boolean,
    muteEffects: boolean,
    stageMagazine: Stage[],
    addScore: (score: Score) => void
  }
  ) {
  const [stageIndex, setStageIndex] = useState(0)
  const [lifeLines, setLifeLines] = useState({fiftyFifty: true, double: true, reroll: true})
  const [doubleDip, setDoubleDip] = useState(false)
  const [soundTrack, setSoundTrack] = useState(stageMagazine[0].sounds.theme)
  const [startTime,] = useState(new Date())
  const [gameOver, setGameOver] = useState(false)
  const [trackDuration, setTrackDuration] = useState(0)

  const [currentQuiz, setCurrentQuiz] = useState(stageMagazine[0].quiz)
  useEffect(() => {
    setCurrentQuiz(stageMagazine[stageIndex].quiz)
  }, [stageIndex])

  const maxStageIndex = 15

  //for displaying time spent since start.
  const timerElement = useRef<null | HTMLParagraphElement>(null)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if(timerElement.current){
        //timerElement.current.textContent = ((Date.now() - startTime.getTime()) / 1000).toFixed(1)
        timerElement.current.textContent = msToHMSvaried(Date.now() - startTime.getTime())
      }
    }, 1000)

    return () => {
      clearInterval(timerInterval)
    }
  }, [startTime])

  function returnToMenu(){
      setSoundTrack(null)
      backToMenu()
  }

  function nextTrack(){
    if(stageMagazine.length > stageIndex + 1){
      const newTrack = stageMagazine[stageIndex + 1].sounds.theme
      if(newTrack instanceof HTMLAudioElement && soundTrack instanceof HTMLAudioElement){
        if(newTrack.src === soundTrack.src){
          return
        }

        if(stageIndex > 4){
          setTrackDuration(soundTrack.currentTime)
        }
      }
      if(newTrack) setSoundTrack(newTrack)
    }
  }

  async function playSound(win: string | HTMLAudioElement | null, volume=1.0){
    if(!win || muteEffects) return

    if (win instanceof HTMLAudioElement){
      win.volume = volume
      win.play()
      if(soundTrack instanceof HTMLAudioElement){
        soundTrack.volume = 0.5
      }
      return
    }

    const winAudio = new Audio('/sounds/' + win)
    winAudio.addEventListener('canplaythrough', () => {
        winAudio.volume = volume
        winAudio.play()
    })
  }

  useEffect(() => {
    if(muted){
      return
    }

    if(soundTrack instanceof HTMLAudioElement){

      if(trackDuration >= soundTrack.duration){
        soundTrack.currentTime = 0
        setTrackDuration(0)
      } else {
        soundTrack.currentTime = trackDuration
      }

      soundTrack.volume = 1
      soundTrack.loop = true
      soundTrack.play()

      return () => {
        soundTrack.pause()
      }
    } else {
      const themeAudio = new Audio('/sounds/' + soundTrack)
      //const themeAudio = new Audio('/sounds/' + stageMagazine[stageIndex].sounds.theme)

      themeAudio.addEventListener('canplaythrough', () => {
          themeAudio.loop = true
          themeAudio.play()
      })

      return () => {
        themeAudio.pause()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundTrack, muted])


  interface GOSprops {
    title: string,
    stageIndex: number,
    timeSpent: number,
    win: boolean
  }
  function GameOverScreen(props:GOSprops){
    const winClass = props.win ? ' win' : ' lose'

    return (
      <div className={'GameOverScreen' + winClass}>
        <h1>{props.title}</h1>

        {props.win ? 
        <></>
        :
        <div style={{}}>
          <h2>
            {currentQuiz.question} <br></br>
            {currentQuiz.answers[currentQuiz.correct]}
          </h2>
        </div>
        }

        <div className='gmScores'>
          <h2>Pisteitä</h2>
          <h2>Aika</h2>
          <h2>{props.stageIndex}</h2>
          <h2>{msToHMS(props.timeSpent)}</h2>
        </div>

        <div className='gmInputContainer'>
          <input className='gmInput' placeholder='nimi'/>
          <button onClick={() => {
            const input: HTMLInputElement | null = document.querySelector('.gmInput')
            if(!input) return
            if(!input.value) {
              input.style = 'outline: 3px solid red;'
              return
            }
            addScore({stage: stageIndex, id: new Date().getTime(), timeSpent:props.timeSpent, name: input.value})
            returnToMenu()
          }}>Lisää nimimerkki Top10</button>
        </div>

        <button onClick={() => {
          returnToMenu()
        }}>Palaa valikkoon</button>

        {props.win ?
        <Confetti/>
        : <></>}
      </div>
    )
  }

  // Losing condition
  if(gameOver){
    if(soundTrack instanceof HTMLAudioElement){
      soundTrack.pause()
    }

    const timeSpent =  new Date().getTime() - startTime.getTime()

    return (
      <GameOverScreen title='Peli ohi!' timeSpent={timeSpent} stageIndex={stageIndex} win={false}/>
    )
  }

  // Victory condition
  if(stageIndex >= maxStageIndex){
    if(soundTrack instanceof HTMLAudioElement){
      soundTrack.pause()
    }

    // playsound doesnt preload, so its little bit delayed.
    // replace with something better later.
    playSound('62 $1,000,000 Win.mp3')

    const timeSpent =  new Date().getTime() - startTime.getTime()

    return (
      <GameOverScreen title='1,000,000' timeSpent={timeSpent} stageIndex={stageIndex} win={true}/>
    )
  }

  function answerFunction(answer: 'A' | 'B' | 'C' | 'D', event: React.MouseEvent<HTMLButtonElement>){
    const isAnimated = true

    let animationRevealSpeed = 250
    let animationWaitBeforeNext = 500
    if(stageIndex < 5){
      animationRevealSpeed = 100
      animationWaitBeforeNext = 250
    }
    if(stageIndex > 5 && stageIndex < 10){
      animationRevealSpeed = 500
      animationWaitBeforeNext = 1000
    }
    if(stageIndex > 10){
      animationRevealSpeed = 1500
      animationWaitBeforeNext = 2000
    }
    if(stageMagazine[stageIndex].sounds.win && stageMagazine[stageIndex].sounds.win instanceof HTMLAudioElement){
      animationWaitBeforeNext = stageMagazine[stageIndex].sounds.win.duration * 1000 - 3000
      if(animationWaitBeforeNext < 0){
        animationWaitBeforeNext = 0
      }
    }

    const buttons = document.querySelector('.answerButtonsContainer')?.querySelectorAll('button')

    function classCleanUp(remove50=true){
      if(buttons){
        for(const button of buttons){
          button.classList.remove('selectedAnswer', 'correctAnswer', 'wrongAnswer')
          if(remove50){
            button.classList.remove('removedBy50')
          }
          button.disabled = false
        }
      }
    }

    function doubleDipEffect(clickId: string){
      if(!buttons)  return
      for (const button of buttons){
        if(button.id === clickId){
          button.classList.add('removedBy50')
        }
      }
    }

    if(isAnimated){ //isAnimated
      event.currentTarget.classList.add('selectedAnswer')
      if(buttons){
        for(const button of buttons){
          button.disabled = true
        }
      }

      setTimeout(async () => {
        if(buttons){
          for(const button of buttons){
            if(button.id === currentQuiz.correct){
              if(button.id === answer){
                button.classList.add('correctAnswer')
                playSound(stageMagazine[stageIndex].sounds.win, 0.3)
                setTimeout(() => {
                  if(doubleDip){
                    setDoubleDip(false)
                  }
                  nextTrack()
                  setStageIndex(stageIndex + 1)
                  classCleanUp()
                }, animationWaitBeforeNext) // 500
              } else {
                if(doubleDip){
                  classCleanUp(false)
                  doubleDipEffect(answer)
                  setDoubleDip(false)
                  return
                }
                button.classList.add('wrongAnswer')
                playSound(stageMagazine[stageIndex].sounds.lose, 0.3)
                setTimeout(() => {
                  setGameOver(true)
                  classCleanUp()
                }, animationWaitBeforeNext) // 1000
              }
            }
          }
        }
      }, animationRevealSpeed) //250
    } else {
      if(answer === currentQuiz.correct){
        playSound(stageMagazine[stageIndex].sounds.win, 0.3) //.then(() => nextTrack())
        nextTrack()
        setStageIndex(stageIndex + 1)
        classCleanUp()
      } else {
        if(doubleDip){
          classCleanUp()
          doubleDipEffect(answer)
          setDoubleDip(false)
          return
        }
        playSound(stageMagazine[stageIndex].sounds.lose, 0.3)
        setGameOver(true)
        classCleanUp()
      }
    }

  }

  function lifeLine5050(){
      playSound('67 50-50.mp3')
      const buttons = document.querySelector('.answerButtonsContainer')?.querySelectorAll('button')
      
      const answers = ['A', 'B', 'C', 'D']
      const remaining = answers.filter(val => val !== currentQuiz.correct)
      const randomIndex = Math.floor(Math.random() * remaining.length)
      remaining.splice(randomIndex, 1)

      if(buttons){
        for (const button of buttons){
          if(remaining.includes(button.id)){
            button.classList.add('removedBy50')
            setLifeLines({...lifeLines, fiftyFifty: false})
          }
        }
      }
  }

  function lifeLineDoubleDip(){
    playSound('67 50-50.mp3')
    if(lifeLines.double === true){
      setDoubleDip(true)
      setLifeLines({...lifeLines, double: false})
    }
  }

  function lifeLineReroll(){
    playSound('67 50-50.mp3')
    setCurrentQuiz(stageMagazine[15].quiz)
    setLifeLines({...lifeLines, reroll: false})
  }

  interface SideBarPrizeProps {
    prize: number
    index: number
    stageIndex: number
  }
  const SideBarPrize: React.FunctionComponent<SideBarPrizeProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {

    const isSelected = props.stageIndex === props.index ? ' isSelected' : ''

    let formattedPrice = props.prize.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ") + '€'

    return (
      <div className={props.className + isSelected}>
        <h3>{props.index}</h3>
        {props.stageIndex >= props.index ? <h3>⬥</h3> : <h3></h3>}
        <h3>{formattedPrice}</h3>
      </div>
    )
  }

  function QuestionHeader({question}:{question: string}){
    const element = useRef<HTMLHeadingElement | null>(null)
    useLayoutEffect(() => {
      if(!element.current) return
      const lines = element.current.getClientRects().length

      switch(true){
        case lines === 2:
          element.current.style = `font-size: 9vh;`
          break
        case lines === 3:
          element.current.style = `font-size: 6vh;`
          break
        case lines === 4:
          element.current.style = `font-size: 5vh;`
          break
        case lines === 5:
          element.current.style = `font-size: 5vh;`
          break
        case lines === 6:
          element.current.style = `font-size: 4vh;`
          break
        case lines === 7:
          element.current.style = `font-size: 4vh;`
          break
        case lines >= 8:
          element.current.style = `font-size: ${10/lines}vh;`
      }
    })

    return(
      <div className='questionContainer sb'>
        <h1 className='questionHeader' ref={element}>{question}</h1>
      </div>
   )
  }

  return (
    <div className='stageMachine'>
      <div className='gameContainer'>
        <img src={millionareLogo} className="logo" alt="Millionare logo" />

        <p ref={timerElement} style={{fontSize:'3vh', margin:0, padding:0, position:'absolute', left:'2.5vw', fontWeight:'bold'/*, textShadow:'2px 2px 2px black'*/}}>-.-</p>

        <div className='lifeLineContainer'>
          <button className='lifeLineButton' onClick={() => lifeLine5050()} disabled={!lifeLines.fiftyFifty}>50:50</button>
          <button className='lifeLineButton' onClick={() => lifeLineDoubleDip()} disabled={!lifeLines.double}>Double Dip</button>
          <button className='lifeLineButton' onClick={() => lifeLineReroll()} disabled={!lifeLines.reroll}>Reroll</button>
        </div>

        <QuestionHeader question={currentQuiz.question}/>
        
        <div className='answerButtonsContainer'>
          <button className='answerButton sb' onClick={(e) => answerFunction('A', e)} id='A'>
            A: {currentQuiz.answers.A}
          </button>

          <button className='answerButton sb' onClick={(e) => answerFunction('B', e)} id='B'>
            B: {currentQuiz.answers.B}
          </button>

          <button className='answerButton sb' onClick={(e) => answerFunction('C', e)} id='C'>
            C: {currentQuiz.answers.C}
          </button>

          <button className='answerButton sb' onClick={(e) => answerFunction('D', e)} id='D'>
            D: {currentQuiz.answers.D}
          </button>
        </div>

      </div>

      <div className='sideBar'>
        {stageMagazine.slice(0, 15).reverse().map((stage, index)=> {
          return <SideBarPrize prize={stage.prize} index={maxStageIndex - index} stageIndex={stageIndex} className='sideBarPrize' key={index}/>
        })}
      </div>
    </div>
  )
}

function App() {
  const [stageMag, setStageMagazine] = useState(stageMagazine)
  const [gameState, setGameState] = useState('menu')
  const [muted, setMuted] = useState(false)
  const [muteEffects, setMuteEffects] = useState(false)
  const {highscores,
        fetchScoresFromStorage,
        flushHighscores,
        addScoreToHighscores,
        removeScoreFromHighscores} = useHighscores()

  const quizArray = [kysymykset, kysymykset1, kysymykset2, kysymykset3, kysymykset4, kysymykset5, kysymykset6]
  const [currentQuiz, setCurrentQuiz] = useState(quizArray[0])


  function changeQuiz(quizNum: number){ // quizNum: 0 | 1 | 2 | 3 | 4
    if(quizArray[quizNum] && quizArray[quizNum].questions.length > 15){
      console.log('quiz changed.', quizArray[quizNum].description)
      setCurrentQuiz(quizArray[quizNum])
      return true
    } else {
      return false
    }
  }

  function changeStage(){
    //return false
    const newStageMag = loadAndRandomizeQuiz(stageMag, currentQuiz.questions)
    setStageMagazine(newStageMag)
  }

  useEffect(() => {
    audioPreloader(stageMagazine)
    fetchScoresFromStorage()
    // adding fetchScoresFromStorage dependancy to useEffect causes massive performance issues.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function switchMute(){
    setMuted(!muted)
  }

  function switchEffectMute(){
    setMuteEffects(!muteEffects)
  }

  function SettingsBar(){
    return (
      <div className='settingsContainer'>
        <button className='settingsButton' onClick={() => switchEffectMute()}>
          {muteEffects ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>
            </svg>
            :
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zm3.025 4a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>
            </svg>
          }
        </button>

        <button className='settingsButton' onClick={() => switchMute()}>
          {muted ?
            <img src={musicNoteSlash} alt='music/off' width='32' height='32'/>
            :
            <img src={musicNote} alt='music/on' width='32' height='32'/>
          }
        </button>
        
        {gameState !== 'menu' ?  
          <button className='settingsButton' onClick={() => setGameState('menu')}>
            <img src={exitSvg} alt='exit' width='32' height='32'/>
          </button>
        : <></>}
      </div>
    )
  }

  function MenuBackGround(){
    return (
      <div className='menuBackGround' style={{position:'absolute', top:0, left:0, width:'100vw', height:'100vh', zIndex:-2}}></div>
    )
  }

  const addScore = (score: Score) => {addScoreToHighscores(score, currentQuiz.description)}

  switch (gameState) {
    case 'menu':
      return (
        <div className='menuState'>
          <img src={millionareLogo} className="logo" alt="Millionare logo" />
          <p style={{textShadow:'2px 2px 4px black'}}>{currentQuiz.description}</p>
          <div className='menuButtonsContainer'>
            <button className='menuButton sb' onClick={() => {
              changeStage()
              setGameState('stage')
            }}>Pelaa</button>
            <button className='menuButton sb' onClick={() => setGameState('scores')}>Top10</button>
            <button className='menuButton sb' onClick={() => setGameState('settings')}>Asetukset</button>
          </div>
          <MenuBackGround/>
          <SettingsBar/>
        </div>
      )

    case 'stage':
      return (
        <>
          <StageMachine backToMenu={() => setGameState('menu')} muted={muted} muteEffects={muteEffects} stageMagazine={stageMag} addScore={addScore}/>
          <SettingsBar/>
          <Balls/>
        </>
      )

    case 'scores':
      return (
        <>
          <HighscoresMenu highscores={highscores} deleteById={removeScoreFromHighscores} quizDescription={currentQuiz.description}/>
          <button className='deleteScoresButton' onClick={() => {
            //const deleteScores = confirm('Poista kaikki pisteet?')
            const deleteScores = prompt('Poistaaksesi pisteet anna salasana:')
            if (deleteScores === password){
              flushHighscores()
            }
          }}>Poista</button>
          <SettingsBar/>
        </>
      )

    case 'settings': //quizArray.map((q, i) => {if(q.description === currentQuiz.description) return i})
      return(
        <div className='settingsStage'>
          <label htmlFor='quizSelect' className='quizLabel'>Kysymykset:</label>
          <select id='quizSelect' onChange={(e) => {
            const result = changeQuiz(parseInt(e.target.value))
            const labelElement: HTMLLabelElement | null = document.querySelector('.quizLabel')
            if(result){
              if(labelElement) labelElement.style = 'color: green;'
            } else {
              alert(`kysymykset(${e.target.value}) on vähemmän kuin 15 vastausta tai tiedosto on puutteellinen`)
              if(labelElement) labelElement.style = 'color: red;'
            }
            }}>
            {quizArray.map((quiz, index) => {
              return <option value={index} key={index} selected={quiz.description === currentQuiz.description}>{quiz.description}</option>
            })}
          </select>

          <div className='menuButtonsContainer'>
            <button className='menuButton sb' onClick={() => {
              changeStage()
              setGameState('stage')
            }}>Pelaa {currentQuiz.description}</button>
          </div>
          <SettingsBar/>
        </div>
      )

    default:
      return (
        <h1>DEFAULT</h1>
      )
  }
}

const stageMagazine: Stage[] = [
  {
    prize: 100,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"? Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      win: null,
      lose: '16 $2,000 Lose.mp3'
    }
  },
  {
    prize: 200,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      win: null,
      lose: '16 $2,000 Lose.mp3'
    }
  },
  {
    prize: 300,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      win: null,
      lose: '16 $2,000 Lose.mp3'
    }
  },
  {
    prize: 500,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      win: null,
      lose: '16 $2,000 Lose.mp3'
    }
  },
  {
    prize: 1_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      win: null,
      lose: '16 $2,000 Lose.mp3'
    }
  },
  {
    prize: 2_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '14 $2,000 Question.mp3',
      win: '17 $2,000 Win.mp3',
      lose: '16 $2,000 Lose.mp3'
    }
  },
  {
    prize: 4_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '19 $4,000 Question.mp3',
      win: '22 $4,000 Win.mp3',
      lose: '21 $4,000 Lose.mp3'
    }
  },
  {
    prize: 8_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '24 $8,000 Question.mp3',
      win: '27 $8,000 Win.mp3',
      lose: '26 $8,000 Lose.mp3'
    }
  },
  {
    prize: 16_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '29 $16,000 Question.mp3',
      win: '32 $16,000 Win.mp3',
      lose: '31 $16,000 Lose.mp3'
    }
  },
  {
    prize: 32_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '34 $32,000 Question.mp3',
      win: '32 $16,000 Win.mp3',
      //win: '37 $32,000 Win.mp3',  //32k win is long because in the show it is a minimum victory treshold
      lose: '36 $32,000 Lose.mp3'
    }
  },
  {
    prize: 64_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '39 $64,000 Question.mp3',
      win: '42 $64,000 Win.mp3',
      lose: '41 $64,000 Lose.mp3'
    }
  },
  {
    prize: 125_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '44 $125,000 Question.mp3',
      win: '47 $125,000 Win.mp3',
      lose: '46 $125,000 Lose.mp3'
    }
  },
  {
    prize: 250_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '49 $250,000 Question.mp3',
      win: '52 $250,000 Win.mp3',
      lose: '51 $250,000 Lose.mp3'
    }
  },
  {
    prize: 500_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '54 $500,000 Question.mp3',
      win: '57 $500,000 Win.mp3',
      lose: '56 $500,000 Lose.mp3'
    }
  },
  {
    prize: 1_000_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: '59 $1,000,000 Question.mp3',
      win: null,//'57 $500,000 Win.mp3',
      lose: '61 $1,000,000 Lose.mp3'
    }
  },
  { // question 16 is lifeline question
    prize: 0,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {A: 'Moth', B: 'Roach', C: 'Fly', D: 'Japanese beetle'},
      correct: 'A'
    },
    sounds: {
      theme: null,
      win: null,//'57 $500,000 Win.mp3',
      lose: null
    }
  }
]

export default App