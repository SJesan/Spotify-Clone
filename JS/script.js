let songs;
let currfolder;

//function for convert time
function convertSecondsToMinutes(seconds) {  

    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    seconds = Math.floor(seconds);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
}

let currentsong = new Audio();

//get song from playlist
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = []
    for (const song of songs) {
        songul.innerHTML += `<li>
                            <img src="sorce/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20%", "  ")}</div>
                                <div>Jesan</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="sorce/songon.svg" alt="">
                            </div>
                        </li>`;

    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML);

        })

    })
    return songs

}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "sorce/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

//this is a function for display albums
async function displayalbums(folder) {

    let a = await fetch("http://127.0.0.1:3000/song/")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(as)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/song")) {
            let folder = e.href.split("/").slice(-2)[0];


            let a = await fetch(`http://127.0.0.1:3000/song/${folder}/info.json`)
            let response = await a.json()
            //console.log(response);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder=${folder} class="card">
                        <div class="play">
                            <img src="sorce/play.svg" alt="">
                        </div>
                        <img src="/song/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }


    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            //console.log(item, item.currentTarget.dataset.folder);

            songs = await getsongs(`song/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])

        })
    })
}

async function main() {


    await getsongs("song/hiq")
    playmusic(songs[0], true)


    //display all albums

    displayalbums()


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "sorce/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "sorce/songon.svg"
        }
    })




    previous.addEventListener("click", element => {
        //console.log(currentsong);
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        //console.log(index);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }

    })

    next.addEventListener("click", element => {
        //console.log(currentsong);
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }


    })

    currentsong.addEventListener("timeupdate", () => {
        //console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)} / ${convertSecondsToMinutes(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"

    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentsong.currentTime = currentsong.duration * e.offsetX / e.target.getBoundingClientRect().width
    })

    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
        //console.log('jesan');

    })

    document.querySelector(".cross").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%"
        //console.log('jesan');

    })


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume === 0) {
            volimg.src = "sorce/mute.svg";
        } else {
            volimg.src = "sorce/volume.svg";
        }

    })

    let previousVolume = currentsong.volume;

    volimg.addEventListener("click", () => {
        if (currentsong.volume > 0) {
            previousVolume = currentsong.volume;
            currentsong.volume = 0;
            volimg.src = "sorce/mute.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            currentsong.volume = previousVolume;
            volimg.src = "sorce/volume.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = previousVolume * 100;
        }
    });






}


main()

