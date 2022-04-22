const divBoard = document.getElementById("divBoard")
function changePlayer(){
    if(humanPlayer < 0)
        humanPlayer = 1
    else
        humanPlayer = -1
    if(currentPlayer != humanPlayer)
        iaPlay()
    document.getElementById("playRed").blur()
    refreshDisplay()
}

function changeHeuristicStart(){
    document.getElementById("heuristicStart").blur()
    heuristicStart = !heuristicStart
}

function changeDepthMode(){
    depthMode = document.getElementById("depthMode").value
    document.getElementById("depthMode").blur()
    console.log("coucou", depthMode)
}

function displayEndOfGameIfNeeded(){
    if(actions.length == NPLAYS){
        // alert("PARTIE FINIE (egalité)")
        document.getElementById("infos").innerHTML = "Game finished. This is a draw."
        return false
    }
    else if(thereIsAWinner()){
        nextPlayer()
        document.getElementById("infos").innerHTML = "Game finished. "+color[currentPlayer]+" won."
        return false
    }
    return true
}

function iaPlay(){
    j = iaChooseColumn()
    if(j<0)
        alert("Bug j < 0")
    play(j)
    displayEndOfGameIfNeeded()
}

function iaIsPlaying(){
    return !document.getElementById("noIA").checked
}

function humanPlayHere(){
    var valid = play(userCursor) >= 0
    var shouldContinue = displayEndOfGameIfNeeded()
    if(shouldContinue && valid){
        if(iaIsPlaying())
            iaPlay()
    }
}

function handleKeyDown(event){
    const key = event.key

    // console.log(key)

    // const {code} = event //for ignoring keyboard layout
    // console.log(code)

    switch (key) {
        case "ArrowLeft":
            userCursor = Math.max(0, userCursor-1)
            break
        case "ArrowRight":
            userCursor = Math.min(LAST_COLUMN, userCursor+1)
            break
        case " ":
            humanPlayHere()
            break
        // case "Escape":
        //     if(actions.length>0)
        //         undo()
        //     break
    }
    refreshDisplay()
}

document.addEventListener('keydown', handleKeyDown)

function userClick(event) {
    var x = event.clientX
    var y = event.clientY
    for(var j=0; j<NX; j++){
        var id = "cursval"+j
        var offsets = document.getElementById(id).getBoundingClientRect();
        if(offsets.left < x && offsets.right > x){
            userCursor = j
            humanPlayHere()
            refreshDisplay()
        }
    }
}

document.addEventListener("click", userClick);

function userMove(event) {
    var x = event.clientX
    var y = event.clientY
    for(var j=0; j<NX; j++){
        var id = "cursval"+j
        var offsets = document.getElementById(id).getBoundingClientRect();
        if(offsets.left < x && offsets.right > x){
            userCursor = j
            refreshDisplay()
        }
    }
}

document.addEventListener("mousemove", userMove);

const str = {"1":"O", "-1":"X", "0":"&nbsp;"}
const color = {"1":"Red", "-1":"Blue", "0":""}

function showCursor(){
    var divCursor = document.createElement("div")
    divCursor.className = "BoardCursorLine"
    divBoard.appendChild(divCursor)
    for(var j=0; j<NX; j++){
        var cursVal = document.createElement("span")
        cursVal.className = "Cursor Val"
        cursVal.id = "cursval"+j
        if(j == userCursor && (currentPlayer == humanPlayer || !iaIsPlaying())){
            cursVal.className += " " + color[currentPlayer]
        }
        divCursor.appendChild(cursVal)
    }
}

function showBoard(){
    for(var i=0; i<NY; i++){
        var line = board[i]
        var divLine = document.createElement("div")
        divLine.className = "BoardLine"
        divBoard.appendChild(divLine)
        for(var j=0; j<NX; j++){
            var value = line[j]
            var spanVal = document.createElement("span")
            spanVal.className = "Board Val"
            if(j == actions[actions.length-1] && i == freeLine[j]+1)
                spanVal.className += " Last"
            else if(j == userCursor && i == freeLine[j])
                spanVal.className += " Next"
            spanVal.className += " " + color[value]
            divLine.appendChild(spanVal)
        }
    }
}
divBoard.addEventListener('keydown', function(event) {
    const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
});

function refreshDisplay(){
    divBoard.innerHTML = ""
    showCursor()
    showBoard()
}

function clearGame(){
    freeLine = []
    for(var i=0; i<NX; i++)
        freeLine.push(LAST_LINE)
    actions = []
    for(var i=0; i<NY; i++)
        for(var j=0; j<NX; j++)
            board[i][j] = 0
    currentPlayer = 1
    userCursor = 0
}


board = [[0,  0,  0,  1,  0,  1,  1],
         [0,  0,  0, -1,  1,  1,  0],
         [0,  0,  1,  1,  1,  1,  1],
         [0,  0,  0,  1, -1, -1,  1],
         [0,  0,  0,  1,  1,  1, -1],
         [0,  0,  1, -1,  1,  1,  1]]

// console.log(controlDiagonal(LAST_LINE,1))
// refreshDisplay()

// console.log(controlLine(0), controlLine(5), controlLine(4))
// console.log(controlColumn(0), controlColumn(3), controlColumn(4))

clearGame()

refreshDisplay()
