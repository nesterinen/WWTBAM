import { type Stage, type Quiz } from "../Types";

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

export default loadAndRandomizeQuiz