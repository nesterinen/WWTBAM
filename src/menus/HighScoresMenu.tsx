import { type Score } from "../Types"
import { msToHMS } from "../utils/msToHMS"
import { password } from '../config/admin.json'

function HighscoresMenu(
  {
    highscores,
    deleteById,
    quizDescription
    }:{
    highscores: Score[],
    deleteById: (id: number) => void,
    quizDescription: string
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

  const filteredScores = highscores.filter(score => score.quizName === quizDescription)
  const sortedScores = filteredScores.sort(sortFunction)

  return (
    <>
      <h1>Top10</h1>
      <h2>{quizDescription}</h2>
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
                if (deleteScores === password){
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

export default HighscoresMenu