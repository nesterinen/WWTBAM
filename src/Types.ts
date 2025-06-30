export interface Quiz {
    question: string
    answers: {
        A: string
        B: string
        C: string
        D: string
    }
    correct: 'A' | 'B' | 'C' | 'D'
}

interface StageSounds {
    theme: null | string | HTMLAudioElement
    letsPlay: null | string | HTMLAudioElement
    question: null | string | HTMLAudioElement
    finalAnswer: null | string | HTMLAudioElement
    win: null | string | HTMLAudioElement
    lose: null | string | HTMLAudioElement
}

interface TODO {
    todo: boolean
}

export interface Stage {
    prize: number,
    quiz: Quiz,
    sounds: StageSounds,
    animations: TODO
}

export interface Score {
    id: number, //ms since 1970
    timeSpent: number, // milliseconds spent on a game
    stage: number, //how many questions correct
    name: string // player name
}
