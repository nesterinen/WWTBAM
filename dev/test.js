const file = {
    desc: 'blabla',
    arr: [
        {a: 1},
        {b: 2}
    ]
}

const {desc, arr} = file

console.log('d', desc)
/*
const correct = 'B'
const lista = ['A', 'B', 'C', 'D']

const remaining = lista.filter(val => val !== correct)
const randomIndex = Math.floor(Math.random() * remaining.length)
remaining.splice(randomIndex, 1)

console.log('rem', remaining, 'rand', randomIndex)
*/