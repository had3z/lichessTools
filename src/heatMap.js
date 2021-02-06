// ==UserScript==
// @name     Board control tool
// @description Displayes board control (how many squares are controled by black / white)
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant    none
// @include     http://*.lichess.org/*
// @include  https://lichess.org/*
// @author had3z
// @version     1
// ==/UserScript==


const isBlackView = []
let board = [];
let heatMap = [];
let squareSize;

const fileToNumber = {
  "a":1,
  "b":2,
  "c":3,
  "d":4,
  "e":5,
  "f":6,
  "g":7,
  "h":8,
}


$(document).ready(() => {
	
  $(document).mouseup(()=> {
    try {
//    console.log(getBoardOrientation());

      board = getNewBoard();
      heatMap = getNewBoard();

      const lele = window.wrappedJSObject.document;
      console.log('wrapped', window.wrappedJSObject.lichess);
      console.log('window', window.lichess);   


      let pieces = Array.from(lele.getElementsByTagName("piece")).filter(el => el.cgPiece);

      pieces.forEach((piece, idx) => {
        const p = getPieceProperties(piece);
        if (p) {
          board[p.rank][p.file] = p.type;
        }
      });

      pieces.forEach(piece => {
        const p = getPieceProperties(piece);      
        if (p) {
        	addHeat(p);
        }
      });

      console.log('stop');
      drawHeatMap();

    }
    catch (e) {
      console.log(e);
    }
  })
});


const drawHeatMap = () => {
	let masterHeatDiv;
  const lele = window.wrappedJSObject.document;
  let squareSize = lele.getElementsByTagName('cg-board')[0].clientWidth / 8;
  const offset = squareSize/2-10;  
  
  if ($('.masterHeatDiv')[0]) {
    $('.masterHeatDiv')[0].remove();
  }
  
  masterHeatDiv = document.createElement('div');
  masterHeatDiv.classList.add('masterHeatDiv');
  
  for (let i=1; i<=8; i++) {
    for (let j=1; j<=8; j++) {
      let heat = heatMap[i][j];
      if (heat !== 0) {
        let leftPos, topPos, bgColor, fontColor;
      	console.log(`[${i}, ${j}]: ${heat}`);
        
        let d = document.createElement('div');
        if (getBoardOrientation() === "white") {
        	leftPos = squareSize*(j-1) + offset;
        	topPos 	= squareSize*(8-i) + offset;
        }
        else {
        	leftPos = squareSize*(8-j) + offset;
        	topPos 	= squareSize*(i-1) + offset;          
        }
        if (heat > 0) {
          bgColor = "#ffffff";
         	fontColor =  "#000000"          
        } else {
          bgColor = "#000000";
         	fontColor =  "#ffffff"          

        }
        
        d.innerHTML = "foobar";
        d.innerHTML = `<div style="position: absolute;left: ${leftPos}px;top: ${topPos}px;z-index: 999;">
         <div style="width: 20px;height: 20px;background: ${bgColor};border-radius: 10px;"></div>
         <div style="position: absolute;left: 0px;top: 0px;font-weight: bold;width: 20px;height: 20px;text-align: center;line-height: 20px;color: ${fontColor};">${Math.abs(heat)}</div>
        </div>`;  
        
        masterHeatDiv.appendChild(d);        
      }      
    }
  }
  lele.getElementsByTagName('cg-board')[0].appendChild(masterHeatDiv);          
  
  


}

/**
 * determines the board orientstion (white / black)
 */
const getBoardOrientation = () => {
  if (document.getElementsByTagName('coords')[0].classList[1] === "black") return "black"
    return "white"
}


const getNewBoard = ()=> {
  // so that i don't have to deal with rank -1, file-1. array starts from 1
  return [
    	'x', 
      ['x',0,0,0,0,0,0,0,0],
      ['x',0,0,0,0,0,0,0,0],
      ['x',0,0,0,0,0,0,0,0],
      ['x',0,0,0,0,0,0,0,0],
      ['x',0,0,0,0,0,0,0,0],
      ['x',0,0,0,0,0,0,0,0],
      ['x',0,0,0,0,0,0,0,0],
      ['x',0,0,0,0,0,0,0,0],
  ]
}

// const logHumanBoard = ()=> {
//   finalBoard = 
//   for (let i = 1; i<=8; i++) {
//     for (let j = 1; j<=8; j++) {
      
//     }    
//   }
// }

const getPieceProperties = (piece) => {
  if (!piece.cgPiece) return null;
  const color = piece.cgPiece.split(' ')[0];
  const power = (color === "white") ? 1 : -1; // white has +1, black has -1. they cancel
  const type = piece.cgPiece.split(' ')[1];
  const piecePos = piece.cgKey;
  const file = piecePos.split('')[0];
  const fileNr = fileToNumber[file];
  const rank = Number(piecePos.split('')[1]);

  
  return {
    color,
    power,
    type,
    file:fileNr,
    rank
  }
}


const addHeat = (processedPiece) => {
  const heatedSquares = getLegalMoves(processedPiece.color, processedPiece.type, processedPiece.file, processedPiece.rank);
  heatedSquares.forEach(square => {
    heatMap[square[1]][square[0]] += processedPiece.power;
  });
}


const getLegalMoves = (pieceColor, pieceType, file, rank) => {
  let squares = [];
  switch (pieceType) {
    case "pawn": 
      if(pieceColor === "white") {
        squares.push([file-1, rank+1])
        squares.push([file+1, rank+1])
      }
      if(pieceColor === "black") {
        squares.push([file-1, rank-1])
        squares.push([file+1, rank-1])
      }
      break;
  		
  default:
    	break;
  }
  
  // trim out moves that are not on the board
  squares = squares.filter(el => el[0]>=1 && el[0]<=8 && el[1]>=1 && el[1]<=8)
  return squares;
}


/**
 * Gets computed translate values
 * @param {HTMLElement} element
 * @returns {Object}
 * @copyright https://zellwk.com/blog/css-translate-values-in-javascript/
 */
getTranslateValues = (element) => {
  const style = window.getComputedStyle(element)
  const matrix = style['transform'] || style.webkitTransform || style.mozTransform

  // No transform property. Simply return 0 values.
  if (matrix === 'none') {
    return {
      x: 0,
      y: 0,
      z: 0
    }
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes('3d') ? '3d' : '2d'
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')

  // 2d matrices have 6 values
  // Last 2 values are X and Y.
  // 2d matrices does not have Z value.
  if (matrixType === '2d') {
    return {
      x: matrixValues[4],
      y: matrixValues[5],
      z: 0
    }
  }

  // 3d matrices have 16 values
  // The 13th, 14th, and 15th values are X, Y, and Z
  if (matrixType === '3d') {
    return {
      x: matrixValues[12],
      y: matrixValues[13],
      z: matrixValues[14]
    }
  }
}



// const getPieces = () => {
// 	let pieces = Array.from(document.getElementsByTagName('piece'));
//   pieces.forEach
// }