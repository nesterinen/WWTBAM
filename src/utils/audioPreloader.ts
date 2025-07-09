import { type Stage } from "../Types";

function audioPreloader(stageMagazine: Stage[]){
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

export default audioPreloader