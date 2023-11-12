import GameOfLife from './src/GameOfLife.js';
import { wait } from './src/helper.js';

const isGridCheckboxNode = document.getElementById('grid');
const widthRangeNode = document.getElementById('width');
const heightRangeNode = document.getElementById('height');

const width = widthRangeNode.value;
const height = heightRangeNode.value;
const isGrid = isGridCheckboxNode.checked;

const game = new GameOfLife(width, height, isGrid);

game.addTo('app');

const logsListNode = handleGameLogs();
handleToggleGridCheckBox(isGridCheckboxNode);
handleGameWidth(widthRangeNode, heightRangeNode);
handleGameHeight(widthRangeNode, heightRangeNode);
handleButtonOfRandomFillTheGame();
handleButtonOfClearTheGame(logsListNode);
handleStartButton();
handleToggleLogsPopup();
handleLogsPopupDragging();

function handleToggleGridCheckBox(isGridCheckboxNode) {
  if (!isGridCheckboxNode) {
    console.error(`Error: toggle grid checkbox is not defined`);
    return;
  }

  isGridCheckboxNode.addEventListener('change', toggleGameGrid);

  function toggleGameGrid(event) {
    try {
      if (event.currentTarget.checked) {
        game.addGrid();
      } else {
        game.removeGrid();
      }
    } catch (error) {
      console.error(`Error on toggle game grid: ${error.message}`);
    }
  }
}

function handleGameWidth(widthRangeNode, heightRangeNode) {
  if (!widthRangeNode || !heightRangeNode) {
    console.error('Error: game size handle nodes is not defined');
    return;
  }

  widthRangeNode.addEventListener('change', changeGameWidth);
  widthRangeNode.addEventListener('input', updateRangeNodeLabel);

  function changeGameWidth(event) {
    try {
      const width = event.target.value;
      const height = heightRangeNode.value;

      updateLabelValue(event.target);

      game.changeSize(width, height);
    } catch (error) {
      console.error(`Error on change game width: ${error.message}`);
    }
  }
  function updateRangeNodeLabel(event) {
    updateLabelValue(event.target);
  }
}

function handleGameHeight(widthRangeNode, heightRangeNode) {
  if (!widthRangeNode || !heightRangeNode) {
    console.error('Error: game size handle nodes is not defined');
    return;
  }

  heightRangeNode.addEventListener('change', changeGameHeight);
  heightRangeNode.addEventListener('input', updateRangeNodeLabel);

  function changeGameHeight(event) {
    try {
      const height = event.target.value;
      const width = widthRangeNode.value;

      updateLabelValue(event.target);

      game.changeSize(width, height);
    } catch (error) {
      console.error(`Error on change game width: ${error.message}`);
    }
  }
  function updateRangeNodeLabel(event) {
    updateLabelValue(event.target);
  }
}

function handleButtonOfRandomFillTheGame() {
  const fillRandomButtonNode = document.getElementById('fillRandom');

  if (!fillRandomButtonNode) {
    console.error('Error: button of random fill the game is not defined');
    return;
  }

  fillRandomButtonNode.addEventListener('click', fillRandomTheGame);

  function fillRandomTheGame() {
    try {
      game.fillRandom();
    } catch (error) {
      console.error(`Error on fill random the game ${error.message}`);
    }
  }
}

function handleButtonOfClearTheGame(logsListNode) {
  const clearButtonNode = document.getElementById('clear');

  if (!clearButtonNode) {
    console.error(`Error: clear button is not defined`);
    return;
  }

  if (!logsListNode) {
    console.error(`Error: logs list node is not defined`);
    return;
  }

  clearButtonNode.addEventListener('click', clearTheGame);

  function clearTheGame() {
    try {
      game.clear();

      logsListNode.childNodes.forEach((log) => {
        log.remove();
      });
    } catch (error) {
      console.error(`Error on clear the game: ${error.message}`);
    }
  }
}

function handleStartButton() {
  const startButtonNode = document.getElementById('start');

  if (!startButtonNode) {
    console.error(`Error: start button is not defined`);
    return;
  }

  const START_LABEL = 'Запустить';
  const STOP_LABEL = 'Остановить';

  startButtonNode.addEventListener('click', toggleGameOfLifeAndButton);
  game.onGameOver(() => changeButtonLabel(START_LABEL));

  function toggleGameOfLifeAndButton(event) {
    try {
      if (event.target.innerText === START_LABEL) {
        game.start();
        startButtonNode.innerText = STOP_LABEL;
      } else {
        game.stop();
        startButtonNode.innerText = START_LABEL;
      }
    } catch (error) {
      console.error(
        `Error on toggle game and toggle start button: ${error.message}`,
      );
    }
  }

  async function changeButtonLabel(label) {
    try {
      await wait(0);
      startButtonNode.innerText = label;
    } catch (error) {
      console.error(
        `Error on change label of toggle game of life button: ${error.message}`,
      );
    }
  }
}

function handleGameLogs() {
  const logsListNode = document.getElementById('list');

  if (!logsListNode) {
    console.error(`Error: logs list is not defined`);
    return;
  }

  game.onLog(addLogToPopupList);

  return logsListNode;

  function addLogToPopupList({ label, interval } = {}) {
    try {
      const li = document.createElement('li');

      const time = new Date().toLocaleTimeString();
      const intervalInSeconds = interval / 1000;

      li.innerText = `${time} ${label} -> ${intervalInSeconds}сек.`;

      logsListNode.appendChild(li);

      while (logsListNode.children.length > 25) {
        logsListNode.children[0].remove();
      }
    } catch (error) {
      console.error(`Error on log output: ${error.message}`);
    }
  }
}

function handleToggleLogsPopup() {
  const toggleLogsPopupNode = document.getElementById('toggleLogsPopup');
  const popupNode = document.getElementById('popup');

  if (!toggleLogsPopupNode) {
    console.error(`Error: toggle logs popup button is not defined`);
    return;
  }

  if (!popupNode) {
    console.error('Error: logs popup is not defined');
    return;
  }

  toggleLogsPopupNode.addEventListener('click', toggleLogsPopup);

  const SHOW_LOGS_LABEL = 'Показать логи';
  const HIDE_LOGS_LABEL = 'Скрыть логи';

  function toggleLogsPopup() {
    try {
      const isHidden = popupNode.classList.toggle('hidden');

      if (isHidden) {
        toggleLogsPopupNode.innerText = SHOW_LOGS_LABEL;
      } else {
        toggleLogsPopupNode.innerText = HIDE_LOGS_LABEL;
      }
    } catch (error) {
      console.error(`Error on toggle logs popup: ${error.message}`);
    }
  }
}

function handleLogsPopupDragging() {
  const popupNode = document.getElementById('popup');

  if (!popupNode) {
    console.error('Error: logs popup is not defined');
    return;
  }

  const state = {
    isMove: false,
    x: 0,
    y: 0,
  };

  popupNode.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', movePopup);
  document.addEventListener('mouseup', endDragging);

  function startDragging(event) {
    try {
      event.target.style.cursor = 'grabbing';

      state.x = event.x;
      state.y = event.y;

      state.isMove = true;
    } catch (error) {
      console.error(
        `Error on start logs popup start dragging: ${error.message}`,
      );
    }
  }
  function movePopup(event) {
    try {
      if (!state.isMove) return;

      const { top, left } = popupNode.getBoundingClientRect();

      popupNode.style.left = `${left + event.x - state.x}px`;
      popupNode.style.top = `${top + event.y - state.y}px`;

      state.x = event.x;
      state.y = event.y;
    } catch (error) {
      console.error(`Error on move logs popup: ${error.message}`);
    }
  }
  function endDragging(event) {
    try {
      popupNode.style.cursor = 'grab';
      state.isMove = false;
    } catch (error) {
      console.error(`Error on start logs popup end dragging: ${error.message}`);
    }
  }
}

function updateLabelValue(target) {
  try {
    const value = target.value;

    const label = target.labels[0];
    if (label) {
      const spans = label.getElementsByTagName('span');
      if (spans.length > 0) {
        spans[0].innerText = value;
      }
    }
  } catch (error) {
    console.error(`Error on update label value: ${error.message}`);
  }
}
