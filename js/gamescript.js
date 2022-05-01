const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.querySelector('#start');
const box = document.querySelector('.about');

startBtn.addEventListener('click', () => {
    box.style.display = 'none';
});

const elements = [];
const assets = [];
const missiles = [];
let loadAssets = 0;

const Element = (sourceX, sourceY, width, height, x, y) => ({
    sourceX,
    sourceY,
    width,
    height,
    x,
    y,
    vx: 0,
    vy: 0,
    centerY: y + (height / 2),
    halfWidth: width / 2,
    halfHeight: height / 2
});



const background = Element(0, 56, 400, 500, 0, 0);
elements.push(background);

const spaceship = Element(0, 0, 30, 50, 185, 450);
elements.push(spaceship);

const loadHandler = () => {
    loadAssets++;
    if (loadAssets === assets.length) {
        image.removeEventListener('load', loadHandler);
        gameState.paused = true;
    };
};

const image = new Image();
image.addEventListener('load', loadHandler);
image.src = '../images/game.png';
assets.push(image);

const keyboard = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    space: ' ',
    enter: 'Enter'
};

const direction = {
    moveToLeft: false,
    moveToRight: false
};

const actions = {
    shoot: false,
    spacekey: false
};

const gameState = {
    loading: true,
    playing: false,
    paused: false,
    over: false
};

document.addEventListener('keydown', e => {
    if (e.key === keyboard.left) direction.moveToLeft = true;
    if (e.key === keyboard.right) direction.moveToRight = true;
    if (e.key === keyboard.space) {
        actions.shoot = true;
        actions.spacekey = true;
    }
});

document.addEventListener('keyup', e => {
    if (e.key === keyboard.left) direction.moveToLeft = false;
    if (e.key === keyboard.right) direction.moveToRight = false;
    if (e.key === keyboard.enter) {
        gameState.playing = true;
    } else {
        gameState.paused = true;
    }
    if (e.key === keyboard.space) actions.spacekey = false;
});

const main = () => {
    requestAnimationFrame(main);
    if (gameState.loading)
        if (gameState.playing) update();
    renderDesign();
};

const shootMissile = () => {
    const missile = Element(136, 12, 8, 13, (spaceship.x + spaceship.width / 2) - 4, spaceship.y - 13);
    missile.vy = -8;
    elements.push(missile);
    missiles.push(missile);
};

const update = () => {
    if (direction.moveToLeft && !direction.moveToRight) spaceship.vx = -5;
    if (!direction.moveToLeft && direction.moveToRight) spaceship.vx = 5;
    if (!direction.moveToLeft && !direction.moveToRight) spaceship.vx = 0;
    if (actions.shoot) {
        shootMissile();
        actions.shoot = false;
    }
    spaceship.x = Math.max(0, Math.min(canvas.width - spaceship.width, spaceship.x + spaceship.vx));

    for (const missil of missiles) {
        missil.y += missil.vy;
        if (missil.y < -missil.height) {
            removeElement(missil, missiles);
            removeElement(missil, elements);
        }
    };
};

const removeElement = (obj, array) => {
    const index = array.indexOf(obj);
    if (index != -1) {
        array.splice(index, 1)
    }
};


const renderDesign = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (elements.length !== 0) {
        for (const e of elements) {
            ctx.drawImage(image, e.sourceX, e.sourceY, e.width, e.height, Math.floor(e.x), Math.floor(e.y), e.width, e.height);
        }
    }
};

main();





