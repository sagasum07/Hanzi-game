const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 1024, H = 768, TILE = 48, PX = 2;
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const keys = {};
let score = 0, coins = 0, frame = 0;
let gameState = 'title'; // 'title', 'playing'

document.getElementById('interactive-jar').addEventListener('click', () => {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('score-board').style.display = 'flex';
  document.getElementById('controls-hint').style.display = 'block';
  gameState = 'playing';
});

document.getElementById('btn-exit').addEventListener('click', () => {
  window.close(); // Attempt to close window
  alert("게임을 종료합니다.");
});

// --- Title Screen Jar Rendering ---
const jarC = {
  'O': '#00111a', // Outline / deepest shadow
  'L': '#002636', // Base dark teal
  'D': '#001a26', // Darker band
  'H': '#005566'  // Moonlight highlight
};

const lidArt = [
  "................................",
  ".............OOOOOO.............",
  "............OLLLLLLO............",
  "...........OLLLLLLLLO...........",
  "..........OLLLLLLLLLLO..........",
  "......OOOOOOOOOOOOOOOOOOOO......",
  "....OOLLLLLLLLLLLLLLLLLLLLOO....",
  "...OLLLLLLLLLLLLLLLLLLLLLLLLO...",
  "..OLLLLLLLLLLLLLLLLLLLLLLLLLLO..",
  ".OLLLLLLLLLLLLLLLLLLLLLLLLLLLLO.",
  ".OLLLLLLLLLLLLLLLLLLLLLLLLLLLLO.",
  "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
  "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO"
];

const bodyArt = [
  "......OOOOOOOOOOOOOOOOOOOO......",
  ".....OLLLLLLLLLLLLLLLLLLLLO.....",
  "....OLLLLLLLLLLLLLLLLLLLLLLO....",
  "...OLLLLLLLLLLLLLLLLLLLLLLLLO...",
  "..OLLLLLLLLHLLLLLLLLLLLLLLLLLO..",
  "..OLLLLLLLLHLLLLLLLLLLLLLLLLLO..",
  ".OLLLLLLLLHHLLLLLLLLLLLLLLLLLLO.",
  ".OLLLLLLLLHHLLLLLLLLLLLLLLLLLLO.",
  ".OLLLLLLLLHHLLLLLLLLLLLLLLLLLLO.",
  "OLLLLLLLLLHHLLLLLLLLDDLLLLLLLLLO",
  "OLLLLLLLLLHHLLLLLLLDDDDLLLLLLLLO",
  "OLLDDLLLLLHHLLLLLLDDDDDDLLLLLLLO",
  "ODDDDLLLLLHHLLLLDDDDDDDDDLLLLLLO",
  "ODDDDDDLLLHHLLDDDDDDDDDDDDLLLLLO",
  "OLLDDDDDLLHHLLDDDDDDDDDDLLLLLLLO",
  "OLLLLDDDLLHHHLLDDDDDDDDLLLLLLLLO",
  "OLLLLLLDDLHHHLLLLDDDDLLLLLLLLLLO",
  "OLLLLLLLLHHLLLLLLLLLLLLLLLLLLLLO",
  "OLLLLLLLLHHLLLLLLLLLLLLLLLLLLLLO",
  ".OLLLLLLLHHLLLLLLLLLLLLLLLLLLLO.",
  ".OLLLLLLLHHLLLLLLLLLLLLLLLLLLLO.",
  "..OLLLLLLHLLLLLLLLLLLLLLLLLLLO..",
  "..OLLLLLLHLLLLLLLLLLLLLLLLLLLO..",
  "...OLLLLLHHLLLLLLLLLLLLLLLLLO...",
  "....OLLLLLLLLLLLLLLLLLLLLLLO....",
  ".....OLLLLLLLLLLLLLLLLLLLLO.....",
  "......OOOOOOOOOOOOOOOOOOOO......"
];

function drawArtToCanvas(canvasId, artArray, pixelSize) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  c.width = artArray[0].length * pixelSize;
  c.height = artArray.length * pixelSize;
  const ctx = c.getContext('2d');
  for (let y = 0; y < artArray.length; y++) {
    for (let x = 0; x < artArray[y].length; x++) {
      const char = artArray[y][x];
      if (jarC[char]) {
        ctx.fillStyle = jarC[char];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

drawArtToCanvas('jar-lid', lidArt, 10);
drawArtToCanvas('jar-body', bodyArt, 10);

// --- Color Palette ---
const C = {
  hair: '#1a1a2e', hairHi: '#2d2d45', hairLo: '#111122',
  skin: '#f0be8c', skinSh: '#d4a070', skinHi: '#ffe0b8',
  eyeW: '#ffffff', pupil: '#111', brow: '#222',
  mouth: '#cc6666', blush: '#e8a888',
  shirt: '#4a90d9', shirtSh: '#3a70b0', shirtHi: '#6aacee',
  collar: '#e8e8e8',
  pants: '#3a3a5c', pantsSh: '#2a2a4a',
  shoe: '#5a3a2a', shoeSh: '#3a2218',
  belt: '#6a4a30'
};

// --- Programmatic Sprite Builder ---
function buildSprite(drawFn) {
  const oc = document.createElement('canvas');
  oc.width = 24 * PX; oc.height = 40 * PX;
  const c = oc.getContext('2d');
  const f = (x,y,w,h,col) => { c.fillStyle = col; c.fillRect(x*PX,y*PX,w*PX,h*PX); };
  drawFn(f);
  return oc;
}

function drawHair(f) {
  f(9,1,6,1,C.hair); f(8,2,8,1,C.hair); f(7,3,10,1,C.hair);
  f(7,4,10,1,C.hair); f(7,5,10,1,C.hair);
  f(10,2,3,1,C.hairHi); f(9,3,4,1,C.hairHi);
}

function drawBodyDown(f, fr) {
  // Neck
  f(10,13,4,1,C.skin);
  // Collar
  f(8,14,8,1,C.collar);
  // Shirt
  f(8,15,8,11,C.shirt); 
  f(7,16,1,9,C.shirt); f(16,16,1,9,C.shirt);
  // Shirt shading
  f(10,17,4,9,C.shirtSh);
  // Shirt highlight
  f(8,15,2,11,C.shirtHi);
  // Arms (skin)
  f(6,16,1,10,C.skin); f(17,16,1,10,C.skin);
  // Belt
  f(8,26,8,1,C.belt);
  // Pants
  f(8,27,8,4,C.pants);
  if (fr === 0) {
    f(8,31,3,6,C.pants); f(13,31,3,6,C.pants);
    f(8,37,3,2,C.shoe); f(13,37,3,2,C.shoe);
  } else {
    f(7,31,3,6,C.pants); f(14,31,3,6,C.pants);
    f(7,37,3,2,C.shoe); f(14,37,3,2,C.shoe);
  }
}

function drawFaceDown(f) {
  drawHair(f);
  // Hair sides extend down
  f(7,6,1,2,C.hair); f(16,6,1,2,C.hair);
  // Face
  f(8,6,8,7,C.skin);
  // Forehead highlight
  f(10,6,4,1,C.skinHi);
  // Eyebrows
  f(9,7,2,1,C.brow); f(13,7,2,1,C.brow);
  // Eyes
  f(9,8,2,2,C.eyeW); f(13,8,2,2,C.eyeW);
  f(10,9,1,1,C.pupil); f(14,9,1,1,C.pupil);
  // Blush
  f(8,10,1,1,C.blush); f(15,10,1,1,C.blush);
  // Nose
  f(11,10,2,1,C.skinSh);
  // Mouth
  f(10,11,4,1,C.mouth);
  // Chin shadow
  f(9,12,6,1,C.skinSh);
}

function drawFaceUp(f) {
  drawHair(f);
  // Back of hair covers face
  f(7,6,10,3,C.hair);
  f(8,9,8,3,C.skin);
  // Hair highlight back
  f(9,4,5,1,C.hairHi);
  // Neck
  f(10,12,4,1,C.skin);
}

function drawFaceLeft(f) {
  // Hair shifted left
  f(7,1,6,1,C.hair); f(6,2,8,1,C.hair); f(5,3,10,1,C.hair);
  f(5,4,10,1,C.hair); f(5,5,10,1,C.hair);
  f(8,2,3,1,C.hairHi); f(7,3,3,1,C.hairHi);
  // Hair side
  f(5,6,1,2,C.hair);
  // Face
  f(6,6,8,7,C.skin);
  // Ear
  f(14,7,1,2,C.skinSh);
  // Eyebrow
  f(7,7,3,1,C.brow);
  // Eye
  f(7,8,2,2,C.eyeW);
  f(7,9,1,1,C.pupil);
  // Nose
  f(6,10,1,1,C.skinSh);
  // Mouth
  f(7,11,3,1,C.mouth);
  // Chin
  f(7,12,6,1,C.skinSh);
}

function drawFaceRight(f) {
  // Hair shifted right
  f(11,1,6,1,C.hair); f(10,2,8,1,C.hair); f(9,3,10,1,C.hair);
  f(9,4,10,1,C.hair); f(9,5,10,1,C.hair);
  f(13,2,3,1,C.hairHi); f(14,3,3,1,C.hairHi);
  f(18,6,1,2,C.hair);
  // Face
  f(10,6,8,7,C.skin);
  // Ear
  f(9,7,1,2,C.skinSh);
  // Eyebrow
  f(14,7,3,1,C.brow);
  // Eye
  f(15,8,2,2,C.eyeW);
  f(16,9,1,1,C.pupil);
  // Nose
  f(17,10,1,1,C.skinSh);
  // Mouth
  f(14,11,3,1,C.mouth);
  f(11,12,6,1,C.skinSh);
}

function drawBodySide(f, fr, isLeft) {
  const ox = isLeft ? -2 : 2;
  const cx = 12 + ox;
  f(cx-1,13,3,1,C.skin); // neck
  f(cx-2,14,6,1,C.collar);
  f(cx-3,15,8,11,C.shirt);
  f(cx-1,17,4,9,C.shirtSh);
  // Arm
  const ax = isLeft ? cx-4 : cx+5;
  f(ax,15,1,10,C.skin);
  // Belt
  f(cx-2,26,6,1,C.belt);
  // Pants
  f(cx-2,27,6,4,C.pants);
  if (fr===0) {
    f(cx-2,31,2,6,C.pants); f(cx+2,31,2,6,C.pants);
    f(cx-2,37,2,2,C.shoe); f(cx+2,37,2,2,C.shoe);
  } else {
    f(cx-3,31,2,6,C.pants); f(cx+3,31,2,6,C.pants);
    f(cx-3,37,2,2,C.shoe); f(cx+3,37,2,2,C.shoe);
  }
}

// Build all sprites
const sprites = {};
['down','up','left','right'].forEach(dir => {
  sprites[dir] = [0,1].map(fr => buildSprite(f => {
    if (dir==='down') { drawFaceDown(f); drawBodyDown(f, fr); }
    else if (dir==='up') { drawFaceUp(f); drawBodyDown(f, fr); }
    else if (dir==='left') { drawFaceLeft(f); drawBodySide(f, fr, true); }
    else { drawFaceRight(f); drawBodySide(f, fr, false); }
  }));
});

// --- Map (Room) ---
const COLS = Math.floor(W/TILE), ROWS = Math.floor(H/TILE);
const FLOOR='#a67c52', WALL='#5c4033', WALL_TOP='#3e2b22', BED='#3a7ca5', DESK='#8b5a2b';

const tileMap = [];
const roomW = 12, roomH = 10;
const startX = Math.floor((COLS - roomW) / 2);
const startY = Math.floor((ROWS - roomH) / 2);

for (let y=0;y<ROWS;y++) {
  tileMap[y]=[];
  for(let x=0;x<COLS;x++) {
    if (x >= startX && x < startX + roomW && y >= startY && y < startY + roomH) {
      if (x===startX || x===startX+roomW-1 || y===startY || y===startY+roomH-1) tileMap[y][x]=1; // Wall
      else tileMap[y][x]=0; // Floor
    } else {
      tileMap[y][x]=-1; // Void
    }
  }
}

// Bed (top left inside room)
for(let y=startY+1; y<=startY+3; y++) {
    for(let x=startX+1; x<=startX+2; x++) {
        tileMap[y][x] = 2;
    }
}

// Desk (top right inside room)
for(let y=startY+1; y<=startY+2; y++) {
    for(let x=startX+roomW-4; x<=startX+roomW-2; x++) {
        tileMap[y][x] = 3;
    }
}

const obstacles = new Set();
for (let y=0;y<ROWS;y++) {
    for(let x=0;x<COLS;x++) {
        if(tileMap[y][x] !== 0) obstacles.add(`${x},${y}`);
    }
}

let coinList=[];
function spawnCoin(){
  let cx,cy;
  do{
    cx = startX + 1 + Math.floor(Math.random()*(roomW-2));
    cy = startY + 1 + Math.floor(Math.random()*(roomH-2));
  } while(obstacles.has(cx+','+cy));
  coinList.push({x:cx,y:cy,bob:Math.random()*6.28});
}
for(let i=0;i<6;i++) spawnCoin();

// Player (start in room)
const player={x:(startX+6)*TILE,y:(startY+5)*TILE,speed:3,dir:'down',af:0,at:0,moving:false,sleepState:'awake',sleepTimer:0,coverRatio:0};

function handleInteraction() {
  if (player.sleepState === 'getting_in' || player.sleepState === 'getting_out') return;

  if (player.sleepState === 'sleeping') {
    player.sleepState = 'getting_out';
    player.sleepTimer = 0;
    return;
  }

  const ptx = Math.floor(player.x/TILE), pty = Math.floor(player.y/TILE);
  const nearBed = ptx >= startX && ptx <= startX+3 && pty >= startY && pty <= startY+4;
  
  if (nearBed) {
    player.preSleep = { x: player.x, y: player.y };
    player.sleepState = 'getting_in';
    player.sleepTimer = 0;
    player.dir = 'down'; // Face forward (screen)
  }
}

// Input
window.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','f','F'].includes(e.key)) e.preventDefault();
  
  if ((e.key === 'f' || e.key === 'F') && gameState === 'playing') {
    handleInteraction();
  }
});
window.addEventListener('keyup',e=>keys[e.key]=false);

// Particles
let particles=[];
function burst(px,py){for(let i=0;i<10;i++)particles.push({x:px,y:py,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,life:1,sz:3+Math.random()*3,c:Math.random()>.5?'#ffd700':'#ffec70'});}

// --- Drawing ---
function drawTile(x,y,t){
  if(t===-1) return;
  const px=x*TILE,py=y*TILE;
  if(t===0 || t===2 || t===3){ // Floor, Bed, Desk
    ctx.fillStyle=FLOOR;ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle='#946842';
    ctx.fillRect(px,py+10,TILE,2);
    ctx.fillRect(px,py+25,TILE,2);
    ctx.fillRect(px,py+40,TILE,2);
  } else if(t===1){ // Wall
    ctx.fillStyle=WALL_TOP;ctx.fillRect(px,py,TILE,10);
    ctx.fillStyle=WALL;ctx.fillRect(px,py+10,TILE,TILE-10);
  }
}

function drawObjects() {
  // Desk (top right)
  const deskX = (startX + roomW - 4) * TILE;
  const deskY = (startY + 1) * TILE;
  const dw = TILE * 3, dh = TILE * 2;
  
  // Desk Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(deskX+4, deskY+10, dw, dh);

  // Desk Base (wood)
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(deskX, deskY, dw, dh);
  
  // Desk Top
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(deskX, deskY, dw, dh - 16);
  
  // Drawers
  ctx.fillStyle = '#6a401a';
  ctx.fillRect(deskX + 10, deskY + dh - 12, dw/2 - 15, 8);
  ctx.fillRect(deskX + dw/2 + 5, deskY + dh - 12, dw/2 - 15, 8);
  // Knobs
  ctx.fillStyle = '#d4c9c1';
  ctx.fillRect(deskX + dw/4 - 2, deskY + dh - 10, 4, 4);
  ctx.fillRect(deskX + dw*0.75 - 2, deskY + dh - 10, 4, 4);

  // Papers and Books
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(deskX + 20, deskY + 15, 24, 30);
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(deskX + 24, deskY + 22, 16, 2);
  ctx.fillRect(deskX + 24, deskY + 28, 16, 2);
  
  // Blue book
  ctx.fillStyle = '#2980b9';
  ctx.fillRect(deskX + dw - 50, deskY + 20, 20, 28);
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(deskX + dw - 46, deskY + 20, 16, 28);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(deskX + dw - 40, deskY + 20, 4, 16);
  
  // Lamp
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(deskX + 10, deskY + 10, 16, 16);
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(deskX + 14, deskY - 10, 24, 20);
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(deskX + 22, deskY + 10, 8, 4);
  
  // Bed (top left)
  const bx = (startX + 1) * TILE;
  const by = (startY + 1) * TILE;
  const bw = TILE * 2, bh = TILE * 3;
  
  // Bed shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(bx+6, by+10, bw, bh);

  // Headboard
  ctx.fillStyle = '#2d1b0f';
  ctx.fillRect(bx+2, by-6, bw-4, 16);
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(bx+4, by-4, bw-8, 12);
  
  // Mattress
  ctx.fillStyle = '#d4c9c1';
  ctx.fillRect(bx+4, by+10, bw-8, bh-14);
  ctx.fillStyle = '#b0a39a';
  ctx.fillRect(bx+4, by+bh-4, bw-8, 6);
  
  // Pillow
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx+14, by+14, bw-28, 26);
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(bx+14, by+36, bw-28, 4);
  ctx.fillRect(bx+bw-18, by+14, 4, 26);
}

function drawBlanket(bx, by, bw, bh, coverRatio) {
  const maxCoverY = by + 46; // pulled up under chin
  const minCoverY = by + bh - 30; // folded down
  const currentY = minCoverY + (maxCoverY - minCoverY) * coverRatio;
  const bH = (by + bh + 2) - currentY;
  
  // Base blanket
  ctx.fillStyle = '#2c3e50'; 
  ctx.fillRect(bx+2, currentY, bw-4, bH);
  
  // Pattern (checkerboard)
  ctx.fillStyle = '#34495e';
  for(let x = 6; x < bw - 6; x += 12) {
      for(let y = currentY + 12; y < by + bh - 10; y += 12) {
          ctx.fillRect(bx + x, y, 6, 6);
      }
  }

  // Top fold
  const foldHeight = 16;
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(bx+2, currentY, bw-4, foldHeight);
  // Fold shadow
  ctx.fillStyle = '#95a5a6';
  ctx.fillRect(bx+2, currentY + foldHeight - 4, bw-4, 4);
  
  // Body Bulge (adds 3D thickness when covering)
  if (coverRatio > 0.3) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(bx+2, currentY + foldHeight, 16, bH - foldHeight); // left shadow
      ctx.fillRect(bx+bw-18, currentY + foldHeight, 16, bH - foldHeight); // right shadow
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(bx+bw/2 - 12, currentY + foldHeight, 24, bH - foldHeight); // top highlight
  }
  
  // Draping sides
  ctx.fillStyle = '#1a252f';
  ctx.fillRect(bx - 4, currentY + 10, 6, bH - 10);
  ctx.fillRect(bx + bw - 2, currentY + 10, 6, bH - 10);
  
  // Wrinkles/Folds when bunched down
  if (coverRatio < 1) {
      const foldLayers = Math.floor((1 - coverRatio) * 3);
      for (let i = 0; i < foldLayers; i++) {
          ctx.fillStyle = '#1a252f';
          ctx.fillRect(bx+2, currentY + 16 + (i * 8), bw-4, 2);
      }
  }
}

function drawCoin(c){
  const px=c.x*TILE+TILE/2,py=c.y*TILE+TILE/2;
  c.bob+=.06;const by=Math.sin(c.bob)*4;
  ctx.fillStyle='rgba(255,220,50,0.15)';ctx.beginPath();ctx.arc(px,py+by,20,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffd700';ctx.fillRect(px-8,py+by-8,16,16);
  ctx.fillStyle='#ffec70';ctx.fillRect(px-5,py+by-5,6,6);
  ctx.fillStyle='#b8960a';ctx.fillRect(px-1,py+by-5,3,10);
}

// --- Update ---
function update(){
  if (gameState !== 'playing') return;

  if (player.sleepState === 'getting_in') {
    player.sleepTimer++;
    const targetX = (startX + 2) * TILE;
    const targetY = (startY + 2.3) * TILE;
    player.x += (targetX - player.x) * 0.1;
    player.y += (targetY - player.y) * 0.1;
    player.coverRatio = Math.min(1, player.sleepTimer / 45); // smooth 45 frame pull
    
    if (player.sleepTimer >= 55) player.sleepState = 'sleeping';
    return;
  }
  
  if (player.sleepState === 'getting_out') {
    player.sleepTimer++;
    const targetX = player.preSleep.x;
    const targetY = player.preSleep.y;
    player.x += (targetX - player.x) * 0.15;
    player.y += (targetY - player.y) * 0.15;
    player.coverRatio = Math.max(0, 1 - (player.sleepTimer / 25)); // uncover faster
    
    if (player.sleepTimer >= 30) {
      player.sleepState = 'awake';
      player.dir = 'down';
    }
    return;
  }

  if (player.sleepState === 'sleeping') {
    if (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown || keys.a || keys.d || keys.w || keys.s) {
      handleInteraction(); // wake up
    }
    return;
  }

  let mv=false,nx=player.x,ny=player.y;
  if(keys.ArrowLeft||keys.a){nx-=player.speed;player.dir='left';mv=true;}
  if(keys.ArrowRight||keys.d){nx+=player.speed;player.dir='right';mv=true;}
  if(keys.ArrowUp||keys.w){ny-=player.speed;player.dir='up';mv=true;}
  if(keys.ArrowDown||keys.s){ny+=player.speed;player.dir='down';mv=true;}

  const cw=18,ch=12;
  const tx1=Math.floor((nx-cw/2)/TILE),tx2=Math.floor((nx+cw/2)/TILE);
  const ty1=Math.floor((ny-ch/2)/TILE),ty2=Math.floor((ny+ch/2)/TILE);
  let blocked=false;
  for(let ty=ty1;ty<=ty2;ty++)for(let tx=tx1;tx<=tx2;tx++){
    if(tx<0||tx>=COLS||ty<0||ty>=ROWS)blocked=true;
    else if(obstacles.has(tx+','+ty)||tileMap[ty][tx]===3)blocked=true;
  }
  if(!blocked){player.x=nx;player.y=ny;}
  player.x=Math.max(8,Math.min(W-8,player.x));
  player.y=Math.max(8,Math.min(H-8,player.y));

  player.moving=mv;
  if(mv){player.at++;if(player.at>10){player.af=1-player.af;player.at=0;}}
  else{player.af=0;player.at=0;}

  const ptx=Math.floor(player.x/TILE),pty=Math.floor(player.y/TILE);
  coinList=coinList.filter(c=>{
    if(Math.abs(c.x-ptx)<=0&&Math.abs(c.y-pty)<=0){
      score+=10;coins++;scoreEl.textContent=score;coinsEl.textContent=coins;
      burst(c.x*TILE+TILE/2,c.y*TILE+TILE/2);setTimeout(spawnCoin,2000);return false;
    }return true;
  });

  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=.03;p.vy+=.1;});
  particles=particles.filter(p=>p.life>0);
  frame++;
}

function render(){
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,W,H);
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)drawTile(x,y,tileMap[y][x]);
  
  // Draw bed and desk underneath player
  drawObjects();
  
  coinList.forEach(drawCoin);

  const sw=24*PX,sh=40*PX;

  // Shadow (only when awake)
  if (player.sleepState === 'awake') {
    ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();
    ctx.ellipse(Math.round(player.x),Math.round(player.y)+14,16,5,0,0,Math.PI*2);ctx.fill();
  }

  // Player sprite
  const sp=sprites[player.dir][player.af];
  ctx.drawImage(sp,Math.round(player.x)-sw/2,Math.round(player.y)-sh+14,sw,sh);
    
  // Draw Blanket OVER player if interacting with bed
  if (player.sleepState !== 'awake') {
    const bx = (startX + 1) * TILE;
    const by = (startY + 1) * TILE;
    drawBlanket(bx, by, TILE*2, TILE*3, player.coverRatio);
    
    // Zzz particles
    if (player.sleepState === 'sleeping' && frame % 40 === 0) {
      particles.push({x: player.x, y: player.y - 30, vx: (Math.random()-0.5)*0.5, vy: -1, life: 1, sz: 2, c: '#fff', text: 'Z'});
    }
  }

  // Interaction Tooltip
  if (player.sleepState === 'awake') {
    const ptx=Math.floor(player.x/TILE),pty=Math.floor(player.y/TILE);
    const nearBed = ptx >= startX && ptx <= startX+3 && pty >= startY && pty <= startY+4;
    if (nearBed) {
      ctx.fillStyle = 'rgba(0, 20, 40, 0.4)';
      ctx.beginPath();
      ctx.roundRect(Math.round(player.x)-35, Math.round(player.y)-95, 70, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#b2ebf2';
      ctx.font = '14px "DungGeunMo", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("F: 눕기", Math.round(player.x), Math.round(player.y)-78);
    }
  }

  // Particles
  particles.forEach(p=>{
    ctx.globalAlpha=p.life;
    ctx.fillStyle=p.c;
    if (p.text) {
      ctx.font = '16px "DungGeunMo"';
      ctx.fillText(p.text, p.x, p.y);
    } else {
      ctx.fillRect(p.x,p.y,p.sz,p.sz);
    }
  });
  ctx.globalAlpha=1;
}

(function loop(){update();render();requestAnimationFrame(loop);})();
