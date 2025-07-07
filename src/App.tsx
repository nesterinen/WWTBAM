import { useState, useEffect } from 'react'

import { type Stage, type Quiz, type Score } from './Types'

import musicNote from './assets/music-note.svg'
import musicNoteSlash from './assets/music-note-slash.svg'
import exitSvg from './assets/exit.svg'

import millionareLogo from '/WWTBAMUS2020Logo.png'
import './App.css'
import './css/confetti.css'

//import kysymykset from './questions/kysymykset.json'
import kysymykset from './questions/kysymykset.json'
import kysymykset1 from './questions/kysymykset1.json'
import kysymykset2 from './questions/kysymykset2.json'
import kysymykset3 from './questions/kysymykset3.json'
import kysymykset4 from './questions/kysymykset4.json'
import kysymykset5 from './questions/kysymykset5.json'
import kysymykset6 from './questions/kysymykset6.json'


import Balls from './balls'

const salasana = 'root'

//https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
function msToHMS( ms: number ): string {
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    const minutes = Math.floor( seconds / 60 ); // 60 seconds in 1 minute
    seconds = seconds % 60;
    //return hours+":"+minutes+":"+Math.floor(seconds)
    return `${hours}h ${minutes}m ${seconds.toFixed(2)}s`
}

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
  const [lifeLines, setLifeLines] = useState({fiftyFifty: true, double: true, todo2: true})
  const [doubleDip, setDoubleDip] = useState(false)
  const [soundTrack, setSoundTrack] = useState(stageMagazine[0].sounds.theme)
  const [startTime,] = useState(new Date()) 
  const [gameOver, setGameOver] = useState(false)
  const [trackDuration, setTrackDuration] = useState(0)

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
        setTrackDuration(soundTrack.currentTime)
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
    
    

  }, [soundTrack, muted])


  interface GOSprops {
    title: string,
    stageIndex: number,
    timeSpent: number,
    win: boolean
  }
  function GameOverScreen(props:GOSprops){
    // victory confetti stuff.
    function getRandomColor() {
      const colors = ['#ff6347', '#ffa500', '#32cd32', '#1e90ff', '#ff69b4'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    useEffect(() => {
      if(!props.win) return
      const confettiWrapper = document.querySelector('.confettiWrapper');
      if(!confettiWrapper) return
      // Generate confetti
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.setProperty('--fall-duration', `${Math.random() * 3 + 3}s`);
        confetti.style.setProperty('--confetti-color', getRandomColor());
        confettiWrapper.appendChild(confetti);
      }
    })

    const winClass = props.win ? ' win' : ' lose'

    return (
      <div className={'GameOverScreen' + winClass}>
        <h1>{props.title}</h1>

        {props.win ? 
        <></>
        :
        <div style={{}}>
          <h2>
            {stageMagazine[stageIndex].quiz.question} <br></br>
            {stageMagazine[stageIndex].quiz.answers[stageMagazine[stageIndex].quiz.correct]}
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
          <>
            <div className='confettiWrapper'></div>
          </>
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
  if(stageIndex >= stageMagazine.length){
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
            if(button.id === stageMagazine[stageIndex].quiz.correct){
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
      if(answer === stageMagazine[stageIndex].quiz.correct){
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

  function lifeLineDoubleDip(){
    playSound('67 50-50.mp3')
    if(lifeLines.double === true){
      setDoubleDip(true)
      setLifeLines({...lifeLines, double: false})
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
          <button className='lifeLineButton' onClick={() => lifeLineDoubleDip()} disabled={!lifeLines.double}>Double Dip</button>
        </div>

        <h1 className='questionHeader sb'>{stageMagazine[stageIndex].quiz.question}</h1>

        <div className='answerButtonsContainer'>
          <button className='answerButton sb' onClick={(e) => answerFunction('A', e)} id='A'>
            A: {stageMagazine[stageIndex].quiz.answers.A}
          </button>

          <button className='answerButton sb' onClick={(e) => answerFunction('B', e)} id='B'>
            B: {stageMagazine[stageIndex].quiz.answers.B}
          </button>

          <button className='answerButton sb' onClick={(e) => answerFunction('C', e)} id='C'>
            C: {stageMagazine[stageIndex].quiz.answers.C}
          </button>

          <button className='answerButton sb' onClick={(e) => answerFunction('D', e)} id='D'>
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
        case 'theme':
          stageMagazine[index].sounds['theme'] = new Audio('/sounds/' + sound)
          break;

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

function loadAndRandomizeQuiz(stageMagazine: Stage[], file: { question: string; answer: string; A: string; B: string; C: string; D: string; }[]){
    file.sort(() => Math.random() - 0.5)
    //spilce deletes the selected objects from the array.
    //slice creates shallow copy, otherwise we will run out of questions pretty soon.
    const quiz15 = file.slice().splice(0, 15) 
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

    if(formattedQuiz.length < 11){
      console.log('formattedQuiz.length < 11', formattedQuiz)
    }
  
    // apply new randomized and formatted array to stageMagazine
    return stageMagazine.map((stage, index) => {
      return {...stage, quiz: formattedQuiz[index]}
    })
}

function HighscoresMenu(
  {
    highscores,
    deleteById
    }:{
    highscores: Score[],
    deleteById: (id: number) => void
  }){
  if(!highscores){
    return (
      <h1>No scores yet</h1>
    )
  }

  function sortFunction(scoreA:Score, scoreB:Score){
    if(scoreA.stage > scoreB.stage){
      return -1
    } else if (scoreA.stage < scoreB.stage){
      return 1
    }

    if (scoreA.timeSpent < scoreB.timeSpent){
      return -1
    } else if(scoreA.timeSpent > scoreB.timeSpent){
      return 1
    }

    return 0
  }

  const sortedScores = highscores.sort(sortFunction)

  return (
    <>
      <h1>Top10</h1>
      <table className='highScoreTable'>
      <tbody>
        <tr>
          <th>Sijoitus</th>
          <th>Nimimerkki</th>
          <th>Pisteet</th>
          <th>Aika</th>
          <th>Päivämäärä</th>
          <th></th>
        </tr>
        {sortedScores.slice(0, 10).map((score, i) => {
          return <tr key={i}>
            <th>{i + 1}</th>
            <th>{score.name}</th>
            <th>{score.stage}</th>
            <th>{msToHMS(score.timeSpent)}</th>
            <th>{new Date(score.id).toLocaleString('FI-fi')}</th>
            <th>
              <button onClick={() => {
                const deleteScores = prompt('Poistaaksesi pisteet anna salasana:')
                if (deleteScores === salasana){
                  deleteById(score.id)
                }
              }}
              >🗑</button>
            </th>
          </tr>
        })}
      </tbody>
      </table>
    </>
  )
}

function App() {
  const [stageMag, setStageMagazine] = useState(stageMagazine)
  const [gameState, setGameState] = useState('menu')
  const [muted, setMuted] = useState(false)
  const [muteEffects, setMuteEffects] = useState(false)
  //highscores should probably created into custom react hook.
  const [highscores, setHighscores] = useState<Score[]>([])
  const [currentQuiz, setCurrentQuiz] = useState(kysymykset.questions)

/*
  useEffect(() => {
    const newStageMag = loadAndRandomizeQuiz(stageMag, currentQuiz)
    setStageMagazine(newStageMag)
    //console.log(stageMag)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[gameState === 'stage'])
*/

  function changeQuiz(quizNum: number){ // quizNum: 0 | 1 | 2 | 3 | 4
    const quizArr = [kysymykset.questions, kysymykset1.questions, kysymykset2.questions, kysymykset3.questions, kysymykset4.questions, kysymykset5.questions, kysymykset6.questions]
    if(quizArr[quizNum] && quizArr[quizNum].length > 15){
      console.log('quiz changed.', quizArr[quizNum])
      setCurrentQuiz(quizArr[quizNum])
      return true
    } else {
      return false
    }
  }

  function changeStage(){
    return false
    const newStageMag = loadAndRandomizeQuiz(stageMag, currentQuiz)
    setStageMagazine(newStageMag)
  }

  useEffect(() => {
    AudioPreloader(stageMagazine)

    const scoresFromStorage = localStorage.getItem('highScores')
    if(scoresFromStorage){
      const parsedScores: Score[] = JSON.parse(scoresFromStorage)
      //console.log('parsedScores:', parsedScores)
      setHighscores(parsedScores)
    }
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

    //<img src={musicNote} alt='music/on' width='32' height='32'/>
  }

  function flushHighscores(){
    setHighscores([])
    localStorage.setItem('highScores', '')
  }

  function addScoreToHighscores(score: Score){
    setHighscores([...highscores, score])
    localStorage.setItem('highScores', JSON.stringify([...highscores, score]))
  }

  function removeScoreFromHighscores(id: number){
    const filtered = highscores.filter(val => val.id !== id)
    setHighscores(filtered)
    localStorage.setItem('highScores', JSON.stringify(filtered))
  }

  switch (gameState) {
    case 'menu':
      return (
        <div className='menuState'>
          <img src={millionareLogo} className="logo" alt="Millionare logo" />
          <div className='menuButtonsContainer'>
            <button className='menuButton sb' onClick={() => {
              changeStage()
              setGameState('stage')
            }}>Pelaa</button>
            <button className='menuButton sb' onClick={() => setGameState('scores')}>Top10</button>
            <button className='menuButton sb' onClick={() => setGameState('settings')}>Asetukset</button>
          </div>
          <SettingsBar/>
        </div>
      )

    case 'stage':
      return (
        <>
          <StageMachine backToMenu={() => setGameState('menu')} muted={muted} muteEffects={muteEffects} stageMagazine={stageMag} addScore={addScoreToHighscores}/>
          <SettingsBar/>
          <Balls/>
        </>
      )

    case 'scores':
      return (
        <>
          <HighscoresMenu highscores={highscores} deleteById={removeScoreFromHighscores}/>
          <button className='deleteScoresButton' onClick={() => {
            //const deleteScores = confirm('Poista kaikki pisteet?')
            const deleteScores = prompt('Poistaaksesi pisteet anna salasana:')
            if (deleteScores === salasana){
              flushHighscores()
            }
          }}>Poista</button>
          <SettingsBar/>
        </>
      )

    case 'settings':
      return(
        <div className='settingsStage'>
          <label htmlFor='quizSelect' className='quizLabel'>Kysymykset:</label>
          <select onChange={(e) => {
            const result = changeQuiz(parseInt(e.target.value))
            const labelElement: HTMLLabelElement | null = document.querySelector('.quizLabel')
            if(result){
              if(labelElement) labelElement.style = 'color: green;'
            } else {
              alert(`kysymykset(${e.target.value}) on vähemmän kuin 15 vastausta tai tiedosto on puutteellinen`)
              if(labelElement) labelElement.style = 'color: red;'
            }
            }} id='quizSelect'>
            <option value={0}>{kysymykset.description}</option>
            <option value={1}>{kysymykset1.description}</option>
            <option value={2}>{kysymykset2.description}</option>
            <option value={3}>{kysymykset3.description}</option>
            <option value={4}>{kysymykset4.description}</option>
            <option value={5}>{kysymykset5.description}</option>
            <option value={6}>{kysymykset6.description}</option>
          </select>
          <SettingsBar/>
        </div>
      )

    default:
      return (
        <h1>DEFAULT</h1>
      )
  }
}

//const prizes = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]

const stageMagazine: Stage[] = [
  {
    prize: 100,
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
      lose: '16 $2,000 Lose.mp3'
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
      lose: '16 $2,000 Lose.mp3'
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
      lose: '16 $2,000 Lose.mp3'
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
      lose: '16 $2,000 Lose.mp3'
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
      lose: '16 $2,000 Lose.mp3'
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