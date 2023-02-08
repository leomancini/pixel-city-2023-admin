function renderPaths(options) {
	window.data.paths.map((path) => {
		let levelIndex = calculateLevelIndex(path);;
		let existingLevelParentElement = document.querySelector(`.level[data-parent-id='${path.parent}'`);

		if (existingLevelParentElement) {
			existingLevelParentElement.append(renderPath(path));
			existingLevelParentElement.dataset.levelIndex = levelIndex;
		} else {
			let newLevelParentElement = document.createElement('div');

			let newLevelParentElementLabel = document.createElement('label');
			newLevelParentElementLabel.className = 'levelIndex';
			newLevelParentElementLabel.innerText = `Level ${levelIndex}`;
			newLevelParentElement.append(newLevelParentElementLabel);

			newLevelParentElement.className = 'level';
			newLevelParentElement.dataset.parentId = path.parent;
			newLevelParentElement.dataset.levelIndex = levelIndex;
			newLevelParentElement.append(renderPath(path));
			pathsParentElement.append(newLevelParentElement);
		}
	});
}

function getParent(index, path) {
	let parent = window.data.paths.filter((parent) => {
		return parent.id === path.parent;
	});

	if (parent.length > 0) {
		index++;
		return getParent(index, parent[0]);
	}

	return index;
}

function calculateLevelIndex(path) {
	let index = getParent(0, path);

	return index;
}

async function getDataFile() {
	const file = await fetch('data/paths.json');
	const data = await file.json();

	return data;
}

async function initializePaths() {
	window.data = await getDataFile();

	renderPaths({
		parent: null
	});

	let levelElements = Array.from(document.querySelectorAll('.level'));

	levelElements.map((levelElement) => {
		let levelElementLevelIndex = parseInt(levelElement.dataset.levelIndex)
		
		if (levelElementLevelIndex > 0) {
			levelElement.style.display = 'none';
		}
	});

	savePaths();
}

function renderPath(path) {
	let pathElement = document.createElement('div');
	pathElement.className = 'path';
	pathElement.dataset.pathId = path.id;
	pathElement.innerText = path.title;
	pathElement.contentEditable = true;

	pathElement.onclick = () => {
		let thisLevel = pathElement.closest('.level');
		let thisLevelIndex = thisLevel.dataset.levelIndex;

		let otherPathElements = Array.from(thisLevel.querySelectorAll('.path'));
		otherPathElements.map((otherPathElement) => {
			otherPathElement.classList.remove('selected');
		});

		pathElement.classList.add('selected');
		let levelElements = Array.from(document.querySelectorAll('.level'));

		levelElements.map((levelElement) => {
			let levelElementLevelIndex = parseInt(levelElement.dataset.levelIndex)
			let levelElementParentId = parseInt(levelElement.dataset.parentId);

			if (levelElementLevelIndex > thisLevelIndex) {
				if (levelElement.dataset.parentId !== path.id) {
					let pathElements = Array.from(levelElement.querySelectorAll('.path'));
					pathElements.map((pathElements) => {
						pathElements.classList.remove('selected');
					});

					levelElement.style.display = 'none';
				} else {
					levelElement.style.display = 'inline-block';
				}
			}
		});
	}

	return pathElement;
}

function encodePathsData() {
	let pathsData = [];
	let pathElements = Array.from(document.querySelectorAll('.path'));

	pathElements.map((pathElement) => {
		let pathData = {
			"id": pathElement.dataset.pathId,
			"title": pathElement.innerText,
			"description": ""
		};

		if (pathElement.closest('.level').dataset.parentId !== 'undefined') {
			pathData.parent = pathElement.closest('.level').dataset.parentId;
		}

		pathsData.push(pathData);
	});

	let data = {
		paths: pathsData
	};

	return data;
}

let pathsParentElement = document.querySelector('#paths');
let downloadButton = document.querySelector('#download');

downloadButton.onclick = () => {
	let pathsData = encodePathsData();
	let downloadHandler = document.createElement('a');
	downloadHandler.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pathsData)));
	downloadHandler.setAttribute('download', 'paths.json');
	document.body.appendChild(downloadHandler);
	downloadHandler.click();
	downloadHandler.remove();
}

initializePaths();