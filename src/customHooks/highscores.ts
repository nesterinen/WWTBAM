import { useState } from "react";
import { type Score } from "../Types";

export function useHighscores(){
    const [highscores, setHighscores] = useState<Score[]>([])

    function fetchScoresFromStorage(){
        const scoresFromStorage = localStorage.getItem('highScores')
        if(scoresFromStorage){
        const parsedScores: Score[] = JSON.parse(scoresFromStorage)
        //console.log('parsedScores:', parsedScores)
        setHighscores(parsedScores)
        }
    }

    function flushHighscores(){
        setHighscores([])
        localStorage.setItem('highScores', '')
    }

    function addScoreToHighscores(score: Score, quizName: string){
        score.quizName = quizName
        setHighscores([...highscores, score])
        localStorage.setItem('highScores', JSON.stringify([...highscores, score]))
    }

    function removeScoreFromHighscores(id: number){
        const filtered = highscores.filter(val => val.id !== id)
        setHighscores(filtered)
        localStorage.setItem('highScores', JSON.stringify(filtered))
    }
    
    return {
        highscores,
        fetchScoresFromStorage,
        flushHighscores,
        addScoreToHighscores,
        removeScoreFromHighscores
    }
}