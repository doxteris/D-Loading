// MESSAGE
const messageElement = document.getElementById('message');
let messageIndex = Math.floor(Math.random() * config.messages.length);
messageElement.innerHTML = config.messages[messageIndex];

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

config.messages = shuffle(config.messages);

setInterval(() => {
	messageElement.style.opacity = 0;

	messageIndex = (messageIndex + 1) % config.messages.length;

	setTimeout(() => {
		messageElement.innerHTML = config.messages[messageIndex];
		messageElement.style.opacity = 1;
	}, 250);
}, config.messageSpeed);


// PROGRESS
let states = {
	'INIT_BEFORE_MAP_LOADED': {
		count: 0,
		done: 0
	},
	'MAP': {
		count: 0,
		done: 0
	},
	'INIT_AFTER_MAP_LOADED': {
		count: 0,
		done: 0
	},
	'INIT_SESSION': {
		count: 0,
		done: 0
	}
};

const handlers = {
	startInitFunctionOrder: (data) => {
		// Reconnecting
		if (data.type == 'INIT_SESSION' && states['INIT_BEFORE_MAP_LOADED'].count < 1) {
			states['INIT_BEFORE_MAP_LOADED'].count = 1;
			states['INIT_BEFORE_MAP_LOADED'].done = 1;
			states['MAP'].count = 1;
			states['MAP'].done = 1;
			states['INIT_AFTER_MAP_LOADED'].count = 1;
			states['INIT_AFTER_MAP_LOADED'].done = 1;
		}

		states[data.type].count += data.count;
	},
	initFunctionInvoked: (data) => states[data.type].done++,
	startDataFileEntries: (data) => states['MAP'].count = data.count,
	performMapLoadFunction: (data) => states['MAP'].done++
};

let last = 0;

window.addEventListener('message', (e) => (handlers[e.data.eventName] || (() => {}))(e.data));

setInterval(() => {
	let progress = 0;
	for (let type in states) {
		if (states[type].done < 1 || states[type].count < 1) continue;
		progress += (states[type].done / states[type].count) * 100;
	}

	let total = Math.min(Math.round(progress / Object.keys(states).length), 100);
	if (total < last) total = last;
	last = total;

	document.getElementById('progress-bar-value').innerHTML = total;
	document.getElementById('progress').value = total;
}, 100);
