import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  GRID_ELEMENT_SIZE,
  NS,
  LIFE_CICLE,
} from './BoardConfig.js';
import { wait } from './helper.js';

export default class {
  #rootNodeId;

  #isGrid = false;
  #isStarted = false;

  #width;
  #height;

  #board = [];
  #svg;

  #onGameOver = null;
  #onLog = null;

  constructor(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, isGrid) {
    this.#width = Number(width);
    this.#height = Number(height);

    this.#board = [];

    this.#createSvg();

    if (isGrid) {
      this.addGrid();
    }

    this.clear();
  }

  #createSvg() {
    const boxWidth = this.#width * GRID_ELEMENT_SIZE;
    const boxHeight = this.#height * GRID_ELEMENT_SIZE;

    this.#svg = this.#createElementNS('svg', {
      xmlns: NS,
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${boxWidth} ${boxHeight}`,
    });

    this.#svg.addEventListener('click', (event) => {
      this.#toggleLifeOnClick(event);
    });
  }

  #removeSvg() {
    if (this.#svg) {
      this.#svg.removeEventListener('click', (event) => {
        this.#toggleLifeOnClick(event);
      });

      this.#svg.remove();
    }
  }

  #createElementNS(name, attributes = {}) {
    const elem = document.createElementNS(NS, name);

    for (const attributeName in attributes) {
      elem.setAttribute(attributeName, attributes[attributeName]);
    }

    return elem;
  }

  #toggleLifeOnClick(event) {
    const { left, top, width, height } = this.#svg.getBoundingClientRect();

    const x = Math.floor((event.clientX - left) / (width / this.#width));
    const y = Math.floor((event.clientY - top) / (height / this.#height));

    if (this.#board[x][y] == LIFE_CICLE.LIFE) {
      this.#board[x][y] = LIFE_CICLE.DEATH;
    } else {
      this.#board[x][y] = LIFE_CICLE.LIFE;
    }

    this.#show();
  }

  #show() {
    const logTimeStart = Date.now();

    const PATH_ID = 'path-test';

    const lastPath = this.#svg.getElementById(PATH_ID);

    let dAttribute = '';
    let lastX, lastY;
    let MX, MY, HH;

    for (let x = 0; x < this.#width; x++) {
      if (!this.#board[x]) this.#board[x] = [];

      for (let y = 0; y < this.#height; y++) {
        if (this.#board[x][y] === LIFE_CICLE.LIFE) {
          MX = x * GRID_ELEMENT_SIZE;
          MY = y * GRID_ELEMENT_SIZE + GRID_ELEMENT_SIZE / 2;
          HH = x * GRID_ELEMENT_SIZE + GRID_ELEMENT_SIZE;

          let partOfDAttribute = '';

          if (!dAttribute) {
            partOfDAttribute = `M${MX},${MY} H${HH}`;
          } else {
            const mX = MX - lastX - GRID_ELEMENT_SIZE;
            const mY = MY - lastY;
            const hH = GRID_ELEMENT_SIZE;
            partOfDAttribute = ` m${mX},${mY} h${hH}`;
          }

          lastX = MX;
          lastY = MY;

          dAttribute += partOfDAttribute;
        }
      }
    }

    let path;
    if (lastPath) {
      path = lastPath;
    } else {
      path = this.#createElementNS('path', {
        'id': PATH_ID,
        'stroke': 'black',
        'stroke-width': '10',
      });
    }

    path.setAttribute('d', dAttribute);
    this.#svg.appendChild(path);

    const interval = Date.now() - logTimeStart;
    this.#log({ label: 'Отрисовка', interval });
  }

  #step() {
    const GAME_OVER = true;

    const previousBoard = [];
    this.#copy(this.#board, previousBoard);

    let isEmpty = true;
    for (let x = 0; x < this.#width; x++) {
      for (let y = 0; y < this.#height; y++) {
        const countOfNeighbors = this.#getCountOfNeighbors(previousBoard, x, y);

        if (previousBoard[x][y] === LIFE_CICLE.DEATH && countOfNeighbors == 3) {
          this.#board[x][y] = LIFE_CICLE.LIFE;
          isEmpty = false;
          continue;
        }

        if (countOfNeighbors < 2 || countOfNeighbors > 3) {
          this.#board[x][y] = LIFE_CICLE.DEATH;
        }
      }
    }

    if (isEmpty) {
      return GAME_OVER;
    }

    let isDuplicate = true;
    for (let x = 0; x < this.#width; x++) {
      for (let y = 0; y < this.#height; y++) {
        if (previousBoard[x][y] != this.#board[x][y]) {
          isDuplicate = false;
          break;
        }
      }
    }

    if (isDuplicate) {
      return GAME_OVER;
    }

    return !GAME_OVER;
  }

  #getCountOfNeighbors(board, x, y) {
    let countOfNeighbors = 0;

    // [x-1, y-1], [x-1, y], [x-1, y+1]
    // [x,   y-1], [x,   y], [x,   y+1]
    // [x+1, y-1], [x+1, y], [x+1, y+1]

    countOfNeighbors += board[this.#getX(x - 1)][this.#getY(y - 1)];
    countOfNeighbors += board[this.#getX(x - 1)][this.#getY(y)];
    countOfNeighbors += board[this.#getX(x - 1)][this.#getY(y + 1)];
    countOfNeighbors += board[this.#getX(x)][this.#getY(y - 1)];
    countOfNeighbors += board[this.#getX(x)][this.#getY(y + 1)];
    countOfNeighbors += board[this.#getX(x + 1)][this.#getY(y - 1)];
    countOfNeighbors += board[this.#getX(x + 1)][this.#getY(y)];
    countOfNeighbors += board[this.#getX(x + 1)][this.#getY(y + 1)];

    return countOfNeighbors;
  }

  #getX(x) {
    return (this.#width + x) % this.#width;
  }

  #getY(y) {
    return (this.#height + y) % this.#height;
  }

  #copy(source, destination) {
    for (let x = 0; x < this.#width; x++) {
      destination[x] = [];

      for (let y = 0; y < this.#height; y++) {
        destination[x][y] = source[x][y];
      }
    }
  }

  #log(parameters) {
    if (this.#onLog) {
      this.#onLog(parameters);
    }
  }

  #gameOver() {
    if (this.#onGameOver) {
      this.#onGameOver();
    }

    this.#log({ label: 'Игра окончена', interval: 0 });

    this.stop();
  }

  #getRandomNumber() {
    return Math.floor((Date.now() * Math.random()) % 10);
  }

  addGrid() {
    const GRID_PATTERN_ID = 'grid-pattern';

    const gridPatternNode = document.getElementById(GRID_PATTERN_ID);

    if (!gridPatternNode) {
      const defs = this.#createElementNS('defs');

      const pattern = this.#createElementNS('pattern', {
        id: GRID_PATTERN_ID,
        width: GRID_ELEMENT_SIZE,
        height: GRID_ELEMENT_SIZE,
        patternUnits: 'userSpaceOnUse',
      });

      const patternRect = this.#createElementNS('rect', {
        'width': GRID_ELEMENT_SIZE,
        'height': GRID_ELEMENT_SIZE,
        'fill': 'none',
        'stroke': 'gray',
        'stroke-width': '1',
      });

      defs.append(pattern);
      pattern.append(patternRect);
      this.#svg.append(defs);
    }

    const rect = this.#createElementNS('rect', {
      id: 'svg-grid',
      width: '100%',
      height: '100%',
      fill: `url(#${GRID_PATTERN_ID})`,
    });

    this.#svg.append(rect);

    this.#isGrid = true;
  }

  removeGrid() {
    const grid = this.#svg.getElementById('svg-grid');

    if (grid) {
      grid.remove();
    }

    this.#isGrid = false;
  }

  changeSize(width, height) {
    this.#width = Number(width);
    this.#height = Number(height);

    this.#removeSvg();
    this.#createSvg();
    this.addTo(this.#rootNodeId);

    if (this.#isGrid) {
      this.addGrid();
    } else {
      this.removeGrid();
    }

    this.#show();
  }

  fillRandom() {
    const logTimeStart = Date.now();
    this.#board = [];

    for (let x = 0; x < this.#width; x++) {
      this.#board[x] = [];

      for (let y = 0; y < this.#height; y++) {
        if (this.#getRandomNumber() === 0) {
          this.#board[x][y] = LIFE_CICLE.LIFE;
        } else {
          this.#board[x][y] = LIFE_CICLE.DEATH;
        }
      }
    }

    const interval = Date.now() - logTimeStart;

    this.#log({ label: 'Заполнение матрицы', interval });

    this.#show();
  }

  clear() {
    this.#board = [];

    for (let x = 0; x < this.#width; x++) {
      this.#board[x] = [];
      for (let y = 0; y < this.#height; y++) {
        this.#board[x][y] = LIFE_CICLE.DEATH;
      }
    }

    this.#show();
  }

  async start() {
    const FPS = 30;

    this.#isStarted = true;

    while (this.#isStarted) {
      const logTimeStart = Date.now();

      this.#show();
      const isGameOver = this.#step();

      const interval = Date.now() - logTimeStart;

      this.#log({ label: 'Итерация жизненного цикла', interval });

      if (isGameOver) {
        this.#gameOver();
      }

      await wait(1 / FPS);
    }
  }

  stop() {
    this.#isStarted = false;
  }

  addTo(rootId) {
    const rootNode = document.getElementById(rootId);

    if (!rootNode) {
      throw new Error('Root node is not defined');
    }

    rootNode.appendChild(this.#svg);

    this.#rootNodeId = rootId;
  }

  onGameOver(listener) {
    if (typeof listener === 'function') {
      this.#onGameOver = listener;
    }
  }
  onLog(listener) {
    if (typeof listener === 'function') {
      this.#onLog = listener;
    }
  }
}
