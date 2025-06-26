interface Quiz {
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
    theme: null | string
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