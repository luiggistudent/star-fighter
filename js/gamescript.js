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
const monsters = [];
const messages = [];

const monsterUtils = {
    frequency: 100,
    timer: 0
};

let loadAssets = 0;

const Handlers = {
    centerX: obj => obj.x + (obj.width / 2),
    centerY: obj => obj.y + (obj.height / 2),
    halfWidth: obj => obj.width / 2,
    halfHeight: obj => obj.height / 2,
    explode: obj => {
        obj.sourceX = 80;
        obj.width, obj.height = 56;
    }
};

const Element = (sourceX, sourceY, width, height, x, y) => ({
    sourceX,
    sourceY,
    width,
    height,
    x,
    y,
    vx: 0,
    vy: 0
});

const Monster = (sourceX, sourceY, width, height, x, y) => ({
    sourceX,
    sourceY,
    width,
    height,
    x,
    y,
    vx: 0,
    vy: 0,
    normal: 1,
    exploded: 2,
    special: 3,
    state: 1,
    mvStyle: 1
});

const background = Element(0, 56, 400, 500, 0, 0);
elements.push(background);

const spaceship = Element(0, 0, 30, 50, 185, 450);
elements.push(spaceship);

const gameMessage = (y, text, color) => ({
    x: 0,
    y,
    text,
    visible: true,
    font: 'normal bold 40px Goldman',
    color,
    baseline: 'top'
});

const message = gameMessage(canvas.height / 2, 'PRESS ENTER', 'blue');
messages.push(message);

const pausedMsg = gameMessage(canvas.height / 2, 'PAUSED', 'blue');
pausedMsg.visible = false;
messages.push(pausedMsg);

const gameOverMsg = gameMessage(canvas.height / 2, 'GAME OVER', 'red');
gameOverMsg.visible = false;
messages.push(gameOverMsg);

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

const collision = (el1, el2) => {
    let hit = false;
    const vetX = Handlers.centerX(el1) - Handlers.centerX(el2);
    const vetY = Handlers.centerY(el1) - Handlers.centerY(el2);
    const sumHalfWidth = Handlers.halfWidth(el1) + Handlers.halfWidth(el2);
    const sumHalfHeight = Handlers.halfHeight(el1) + Handlers.halfHeight(el2);

    if (Math.abs(vetX) < sumHalfWidth && (Math.abs(vetY) < sumHalfHeight)) {
        hit = true;
    }
    return hit;
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
        if (!gameState.playing) {
            gameState.playing = true;
            message.visible = false;
            pausedMsg.visible = false;
        } else {
            gameState.playing = false;
            pausedMsg.visible = true;
        }
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
    const missile = Element(136, 12, 8, 13, Handlers.centerX(spaceship) - 4, spaceship.y - 13);
    missile.vy = -8;
    elements.push(missile);
    missiles.push(missile);
};

const createMonster = () => {
    const position = (Math.floor(Math.random() * 8)) * 50;
    const monster = Monster(30, 0, 50, 50, position, -50);
    monster.vy = 1;

    if (Math.floor(Math.random() * 11) > 7) {
        monster.state = monster.special;
        monster.vx = 2;
    }

    if (Math.floor(Math.random() * 11) > 5) {
        monster.vy = 2;
    }

    elements.push(monster);
    monsters.push(monster);
};

const destroyMonster = (monster) => {
    monster.state = monster.exploded;
    Handlers.explode(monster);
    setTimeout(() => {
        removeElement(monster, monsters);
        removeElement(monster, elements);
    }, 150);
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

    for (const monster of monsters) {
        if (monster.state !== monster.exploded) {
            monster.y += monster.vy
            if (monster.state === monster.special) {
                if (monster.x > canvas.width - monster.width || monster.x < 0) {
                    monster.vx *= -1;
                }
                monster.x += monster.vx;
            }
        }

        if (monster.y > canvas.height + monster.height) {
            gameState.playing = false;
            gameOverMsg.visible = true;
        }

        for (const missil of missiles) {
            if (collision(missil, monster) && monster.state !== monster.exploded) {
                destroyMonster(monster);
                removeElement(missil, missiles);
                removeElement(missil, elements);
            }
        }
    };

    monsterUtils.timer += 1;
    if (monsterUtils.timer === monsterUtils.frequency) {
        createMonster();
        monsterUtils.timer = 0;

        if (monsterUtils.frequency > 2) monsterUtils.frequency -= 1;
    }
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

    if (messages.length !== 0) {
        for (const message of messages) {
            if (message.visible) {
                ctx.font = message.font;
                ctx.fillStyle = message.color;
                ctx.textBaseline = message.baseline;
                message.x = (canvas.width - ctx.measureText(message.text).width) / 2;
                ctx.fillText(message.text, message.x, message.y);
            }
        }
    }
};

main();





