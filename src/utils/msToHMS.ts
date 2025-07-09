//https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript

export function msToHMS( ms: number ): string {
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    const minutes = Math.floor( seconds / 60 ); // 60 seconds in 1 minute
    seconds = seconds % 60;
    //return hours+":"+minutes+":"+Math.floor(seconds)
    return `${hours}h ${minutes}m ${seconds.toFixed(2)}s`
}

export function msToHMSvaried( ms: number ){
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    const minutes = Math.floor( seconds / 60 ); // 60 seconds in 1 minute
    seconds = seconds % 60;
    //return hours+":"+minutes+":"+Math.floor(seconds)
    if(hours){
      return `${hours}h ${minutes}m ${seconds.toFixed(0)}s`
    }
    if(minutes) {
      return `${minutes}m ${seconds.toFixed(0)}s`
    }
    return `${seconds.toFixed(0)}s`
}