import { useState, useEffect } from 'react'

import musicNote from './assets/music-note.svg'
import musicNoteSlash from './assets/music-note-slash.svg'
import exitSvg from './assets/exit.svg'

import millionareLogo from '/WWTBAMUS2020Logo.png'
import './App.css'

import testiKysym from './questions/100_testi_kysym.json'


function StageMachine(
  {
    backToMenu, 
    muted,
    muteEffects
  }:
  {
    backToMenu: () => void,
    muted: boolean,
    muteEffects: boolean
  }
  ) {
  const [stageIndex, setStageIndex] = useState(0)
  const [lifeLines, setLifeLines] = useState({fiftyFifty: true, todo1: true, todo2: true})
  const [soundTrack, setSoundTrack] = useState('11 $100-$1,000 Questions.mp3')

  function nextTrack(){
    if(stageMagazine.length > stageIndex + 1){
      const newTrack = stageMagazine[stageIndex + 1].sounds.theme
      if(newTrack) setSoundTrack(newTrack)
    }
  }

  async function playSound(win: string | HTMLAudioElement | null, volume=1.0){
    if(!win || muteEffects) return

    if (win instanceof HTMLAudioElement){
      win.volume = volume
      win.play()
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
    
    const themeAudio = new Audio('/sounds/' + soundTrack)
    //const themeAudio = new Audio('/sounds/' + stageMagazine[stageIndex].sounds.theme)
    if (soundTrack !== '62 $1,000,000 Win.mp3'){
      themeAudio.loop = true
    }

    themeAudio.addEventListener('canplaythrough', () => {
        themeAudio.play()
    })

    return () => {
      themeAudio.pause()
    }

  }, [soundTrack, muted])

  // Losing condition
  if(stageIndex === 666){
    return(
      <>
        <div>YOU LOSE!</div>
        <button onClick={() => {
          setSoundTrack('')
          backToMenu()
        }}>
          Back to menu
        </button>
      </>
    )
  }

  // Victory condition
  if(stageIndex >= stageMagazine.length){

    /*
    if(soundTrack !== '62 $1,000,000 Win.mp3'){
      //setSoundTrack('62 $1,000,000 Win.mp3')
    }
    */

    playSound('62 $1,000,000 Win.mp3')

    return (
      <>
        <div>YOU WIN!</div>
        <button onClick={() => {
          //setSoundTrack('')
          backToMenu()
        }}> Back to menu </button>
      </>
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

    const buttons = document.querySelector('.answerButtonsContainer')?.querySelectorAll('button')

    function classCleanUp(){
      if(buttons){
        for(const button of buttons){
          button.classList.remove('selectedAnswer', 'correctAnswer', 'wrongAnswer', 'removedBy50')
        }
      }
    }

    if(isAnimated){ //isAnimated
      event.currentTarget.classList.add('selectedAnswer')
      setTimeout(async () => {
        if(buttons){
          for(const button of buttons){
            if(button.id === stageMagazine[stageIndex].quiz.correct){
              if(button.id === answer){
                button.classList.add('correctAnswer')
                playSound(stageMagazine[stageIndex].sounds.win, 0.3)
                setTimeout(() => {
                  nextTrack()
                  setStageIndex(stageIndex + 1)
                  classCleanUp()
                }, animationWaitBeforeNext) // 500
              } else {
                button.classList.add('wrongAnswer')
                playSound(stageMagazine[stageIndex].sounds.lose, 0.3)
                setTimeout(() => {
                  setStageIndex(666)
                  classCleanUp()
                }, animationWaitBeforeNext) // 1000
              }
            }
          }
        }
      }, animationRevealSpeed) //250
    } else {
      if(answer === stageMagazine[stageIndex].quiz.correct){
        playSound(stageMagazine[stageIndex].sounds.win, 0.3) //.then(() => nextTrack())
        nextTrack()
        setStageIndex(stageIndex + 1)
        classCleanUp()
      } else {
        playSound(stageMagazine[stageIndex].sounds.lose, 0.3)
        setStageIndex(666)
        classCleanUp()
      }
    }

  }

  function lifeLine5050(){
      const buttons = document.querySelector('.answerButtonsContainer')?.querySelectorAll('button')
      
      const answers = ['A', 'B', 'C', 'D']
      const remaining = answers.filter(val => val !== stageMagazine[stageIndex].quiz.correct)
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

  interface SideBarPrizeProps {
    prize: number
    index: number
    stageIndex: number
  }
  const SideBarPrize: React.FunctionComponent<SideBarPrizeProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {

    const isSelected = props.stageIndex === props.index ? ' isSelected' : ''

    return (
      <div className={props.className + isSelected}>
        <h3>{props.index}</h3>
        {props.stageIndex >= props.index ? <h3>⬥</h3> : <h3></h3>}
        <h3>{props.prize}</h3>
      </div>
    )
  }

  return (
    <div className='stageMachine'>
      <div className='gameContainer'>
        <img src={millionareLogo} className="logo" alt="Millionare logo" />

        <div className='lifeLineContainer'>
          <button className='lifeLineButton' onClick={() => lifeLine5050()} disabled={!lifeLines.fiftyFifty}>50:50</button>
          <button className='lifeLineButton'>TODO</button>
          <button className='lifeLineButton'>TODO</button>
        </div>

        <h1 className='questionHeader'>{stageMagazine[stageIndex].quiz.question}</h1>

        <div className='answerButtonsContainer'>
          <button className='answerButton' onClick={(e) => answerFunction('A', e)} id='A'>
            A: {stageMagazine[stageIndex].quiz.answers.A}
          </button>

          <button className='answerButton' onClick={(e) => answerFunction('B', e)} id='B'>
            B: {stageMagazine[stageIndex].quiz.answers.B}
          </button>

          <button className='answerButton' onClick={(e) => answerFunction('C', e)} id='C'>
            C: {stageMagazine[stageIndex].quiz.answers.C}
          </button>

          <button className='answerButton' onClick={(e) => answerFunction('D', e)} id='D'>
            D: {stageMagazine[stageIndex].quiz.answers.D}
          </button>
        </div>
      </div>

      <div className='sideBar'>
        {stageMagazine.slice(0).reverse().map((stage, index)=> {
          return <SideBarPrize prize={stage.prize} index={stageMagazine.length - index} stageIndex={stageIndex} className='sideBarPrize' key={index}/>
        })}
      </div>
    </div>
  )
}

function AudioPreloader(stageMagazine: Stage[]){
  stageMagazine.map((stage, index) => {
    for(const [key, sound] of Object.entries(stage.sounds)){
      if(sound === null) continue
      switch (key) {
        case 'win':
          stageMagazine[index].sounds['win'] = new Audio('/sounds/' + sound)
          break;

        case 'lose':
          stageMagazine[index].sounds['lose'] = new Audio('/sounds/' + sound)
          break;

        case 'letsPlay':
          stageMagazine[index].sounds['letsPlay'] = new Audio('/sounds/' + sound)
          break;

        case 'question':
          stageMagazine[index].sounds['question'] = new Audio('/sounds/' + sound)
          break;

        case 'finalAnswer':
          stageMagazine[index].sounds['finalAnswer'] = new Audio('/sounds/' + sound)
          break;

        default:
          break;
      }
    }
  })
}

import { type Quiz } from './Types'
function loadAndRandomizeQuiz(stageMagazine: Stage[], file: { question: string; answer: string; A: string; B: string; C: string; D: string; }[]){
  file.sort(() => Math.random() - 0.5)
  const quiz15 = file.splice(0, 15)
  const formattedQuiz: Quiz[] = []

  type Corrects = 'A' | 'B' | 'C' | 'D'
  const keys: Corrects[] = ['A', 'B', 'C', 'D']

  quiz15.map(quiz => {
    const answers = [quiz.A, quiz.B, quiz.C, quiz.D].sort(() => Math.random() - 0.5)
    const newQuiz = {
      question: quiz.question,
      answers: {
        A: answers[0],
        B: answers[1],
        C: answers[2],
        D: answers[3]
      },
      correct: keys[answers.findIndex(elem => quiz.answer === elem)]
    }
    formattedQuiz.push(newQuiz)
  })

  // apply new randomized and formatted array to stageMagazine
  stageMagazine.map((stage, index) => {
    stage.quiz = formattedQuiz[index]
  })
}

function App() {
  const [gameState, setGameState] = useState('menu')
  const [muted, setMuted] = useState(true)
  const [muteEffects, setMuteEffects] = useState(true)

  useEffect(() => {
    loadAndRandomizeQuiz(stageMagazine, testiKysym)
  },[gameState])

  useEffect(() => {
    AudioPreloader(stageMagazine)
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
        
        {gameState === 'stage' ?  
          <button className='settingsButton' onClick={() => setGameState('menu')}>
            <img src={exitSvg} alt='exit' width='32' height='32'/>
          </button>
        : <></>}
      </div>
    )

    //<img src={musicNote} alt='music/on' width='32' height='32'/>
  }

  switch (gameState) {
    case 'menu':
      return (
        <>
          <img src={millionareLogo} className="logo" alt="Millionare logo" />
          <div className='menuButtonsContainer'>
            <button className='menuButton' onClick={() => setGameState('stage')}>pelaa</button>
            <button className='menuButton'>highscores TODO</button>
          </div>
          <SettingsBar/>
        </>
      )

    case 'stage':
      return (
        <>
          <StageMachine backToMenu={() => setGameState('menu')} muted={muted} muteEffects={muteEffects}/>
          <SettingsBar/>
        </>
      )

    default:
      return (
        <h1>DEFAULT</h1>
      )
  }
}

//const prizes = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]

import { type Stage } from './Types'
const stageMagazine: Stage[] = [
  {
    prize: 100,
    quiz: {
      question: 'The Earth is approximately how many miles away from the Sun?',
      answers: {
        A: '9.3 million',
        B: '39 million',
        C: '93 million',
        D: '193 million'
      },
      correct: 'C'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: null,
      lose: null
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 200,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: null,
      lose: null
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 300,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: null,
      lose: null
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 500,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: null,
      lose: null
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 1_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '11 $100-$1,000 Questions.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: null,
      lose: null
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 2_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '14 $2,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '17 $2,000 Win.mp3',
      lose: '16 $2,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 4_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '19 $4,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '22 $4,000 Win.mp3',
      lose: '21 $4,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 8_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '24 $8,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '27 $8,000 Win.mp3',
      lose: '26 $8,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 16_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '29 $16,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '32 $16,000 Win.mp3',
      lose: '31 $16,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 32_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '34 $32,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '32 $16,000 Win.mp3',
      //win: '37 $32,000 Win.mp3',  //32k win is long because in the show it is a minimum victory treshold
      lose: '36 $32,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 64_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '39 $64,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '42 $64,000 Win.mp3',
      lose: '41 $64,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 125_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '44 $125,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '47 $125,000 Win.mp3',
      lose: '46 $125,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 250_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '49 $250,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '52 $250,000 Win.mp3',
      lose: '51 $250,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 500_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '54 $500,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: '57 $500,000 Win.mp3',
      lose: '56 $500,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  },
  {
    prize: 1_000_000,
    quiz: {
      question: 'Which insect shorted out an early supercomputer and inspired the term "computer bug"?',
      answers: {
        A: 'Moth',
        B: 'Roach',
        C: 'Fly',
        D: 'Japanese beetle'
      },
      correct: 'A'
    },
    sounds: {
      theme: '59 $1,000,000 Question.mp3',
      letsPlay: null,
      question: null,
      finalAnswer: null,
      win: null,//'57 $500,000 Win.mp3',
      lose: '61 $1,000,000 Lose.mp3'
    },
    animations: {
      todo: false,
    }
  }
]

export default App

/*
import { createRoot } from 'react-dom/client'
function settingsDialog(switchMute: () => void){
  const dialog = document.createElement('dialog')
  createRoot(dialog).render(
    <>
      <h1>Settings</h1>
      <button onClick={() => {dialog.remove()}}>Close</button>
      <button onClick={switchMute}>mute</button>
    </>
  )
  document.body.appendChild(dialog)
  dialog.show()
}
*/