const NX = 7
const NY = 6
const NPLAYS = NX * NY
const LAST_LINE = NY - 1
const LAST_COLUMN = NX - 1
const CENTERX =  Math.floor( NX/2 )
const CENTERY = Math.floor( NY/2 )
const N = 4
var maxDepth = 7
const MIN_SCORE = 0.01


var freeLine = []
for(var i=0; i<NX; i++)
    freeLine.push(LAST_LINE)

var actions = []
var currentPlayer = 1
var userCursor = 0

function sgn(x){
    if(x > 0)
        return 1
    else if(x < 0)
        return -1
    return 0
}


function controlColumn(j){ //control from bottom to top
    return control(LAST_LINE,j,-1,0,NY)
}

function controlLine(i){
    return control(i,0,0,1,NX)
}

function controlDiagonal(i,j){ //rule : diagonals are always going to the right of the board
    if(i >= 3){ //going up
        const n = i + 1
        return control(i, j, -1, 1, n)
    }
    else{ // going down
        const n = NY - i
        return control(i, j, 1, 1, n)
    }

}

function control(i,j,dy,dx,n){
    var tot = 0
    var lastValue = 0
    for(var k=0; k<n; k++){
        var value = board[i+k*dy][j+k*dx]
        if (value != lastValue)
            tot = 0
        tot += value
        lastValue = value
        if(Math.abs(tot) >= N){
            return true
        }
    }
    return false
}

function thereIsAWinner(){
    var result
    for(var i=0; i<NY; i++){
        if(controlLine(i)) return true
        if(controlColumn(i)) return true
        if(controlDiagonal(i,0)) return true
    }
    if(controlColumn(NX-1)) return true //last column is left
    //
    for(var j=1; j<4; j++){ //top and bottom diagonals
        if(controlDiagonal(0,j)) return true
        if(controlDiagonal(LAST_LINE,j)) return true
    }
    return false
}

function nextPlayer(){
    if(currentPlayer>0)
        currentPlayer = -1
    else
        currentPlayer = 1
}

function play(j){
    var line = freeLine[j]
    if(line < 0){
        return -1
    }
    else{
        board[line][j] = currentPlayer
        freeLine[j] -= 1
        actions.push(j)
        nextPlayer()
        return line
    }

}

function undo(){
    j = actions.pop()
    freeLine[j] += 1
    board[freeLine[j]][j] = 0
    nextPlayer()
}



// IA

// function heuristicSituationnal(i, j){ //this function must be called AFTER the play
//     for(var i=0;i<NY;i++)
//         for(var j=0;j<NX;j++)
//             if(board[i][j] == 0){
//                 var tot = 0
//                 dx = 1
//                 dy = 0
//                 while(true){
//
//                 }
//             }
// }

function heuristicHotSpot(i, j){ //this function must be called AFTER the play
    const dx = 0.5*Math.abs(j - CENTERX) / CENTERX
    const dy = 0.5*Math.abs(i - CENTERY) / CENTERY
    const h = 1 - dx - dy
    // if(h > 1 || h < 0)
    //     alert("Probleme h", h)
    // console.log("           h,dx,dy=",h, "dx=", dx, "dy=",dy)
    if(h > 1)
        return 0.9
    else if(h < 0)
        return 0.1
    return h
}


function iaChooseColumnHeuristic(){
    var bestScore = -1
    var bestColumn = -1
    for(var j=0; j<NX; j++){
        var i = play(j)
        if(i >= 0){
            var score = heuristicHotSpot(i, j)
            console.log(j,"-->",score)
            if (score > bestScore){
                bestScore = score
                bestColumn = j
            }
            undo()
        }
    }
    console.log("IA plays", bestColumn, bestScore)
    return bestColumn
}


counter = 0
//getScore must left the state unchanged after the call
function getScore(j, depth, limit){
    counter ++
    i = play(j)
    if(i < 0) //cannot play in column j, no need to undo
        return -1
    if(thereIsAWinner()){
        undo()
        return 1 // conjugue de MAX_SCORE ? attention avec l'autre signification du -1 (coup aps possible)
    }
    else if(actions.length == NPLAYS){ //draw
        undo()
        if(currentPlayer>0)
            return 0.4
        else
            return 0.6
    }
    if(depth >= maxDepth){ //too deep in the IA tree to produce children
        undo()
        return  0.1 + Math.random()*0.8
    }
    //Now serious things start : if we are here, children necessarily exist (no winner, no draw)
    var score = 1 - INITIAL_LIMIT //0.99
    for(var c=0; c<NX; c++){
        var cScore = getScore(c, depth+1, 1-score)
        if(cScore >= 0){ //otherwise cannot play on column c
            var newScore = 1 - cScore
            //Suppose the child won. Then cScore = 1 ==> newScore = 0
            //Now suppose the child descendants necessarily loose. Then cScore = 0 ==> newScore = 1 xxxx
            if(newScore < limit){ //no need to explore further, this child is already too strong, we do not want to play j.
                undo()
                return newScore
            }
            else if(newScore < score){ //this child is the best so far among its sisters, but j could still be the best choice
                score = newScore
            }
        }
    }
    undo()
    return score
}

const INITIAL_LIMIT = 0.01
function iaChooseColumn(){

    if(actions.length < 3)
        return iaChooseColumnHeuristic()

    console.log("***", maxDepth)
    counter = 0
    var bestScore = -1
    var bestColumn = -1
    for(var j=0; j<NX; j++){
        var score = getScore(j, 0, INITIAL_LIMIT)
        console.log(j,"-->",score)
        if (score > bestScore){
            bestScore = score
            bestColumn = j
        }
    }

    if(bestScore<0.998 && counter<1e5 && maxDepth<NPLAYS){
        maxDepth ++
        return iaChooseColumn()
    }
    else if(counter>1e6)
        maxDepth --

    console.log("IA plays", bestColumn, bestScore, maxDepth)
    console.log("counter", counter)
    var infos = document.getElementById("infos")
    infos.innerHTML = "IA score = " + Math.round(bestScore * 100) / 100
                                                + " (" + counter + " steps, depth = " + maxDepth + ")"
    if(bestScore<=0.011)
        infos.innerHTML += "<br> <span style='color:yellow'>You can win !</span>"
    if(bestScore>=0.989)
        infos.innerHTML += "<br> <span style='color:yellow'>You are about to lose :)</span>"
    return bestColumn
}
