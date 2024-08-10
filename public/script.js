document.getElementById('agreeCheckbox').addEventListener('change', function() {
    document.getElementById('submitButton').disabled = !this.checked;
});

let Commands = [{
    'commands': []
}, {
    'handleEvent': []
}];

function measurePing() {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const pingTime = Date.now() - startTime;
            document.getElementById("ping").textContent = `${pingTime} ms`;
        }
    };
    xhr.open("GET", `${location.href}?t=${new Date().getTime()}`);
    xhr.send();
}
setInterval(measurePing, 1000);

function updateTime() {
    const now = new Date();
    const options = { timeZone: 'Asia/Manila', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
    document.getElementById('time').textContent = now.toLocaleString('en-US', options);
}
updateTime();
setInterval(updateTime, 1000);

async function State(event) {
    event.preventDefault();
    const jsonInput = document.getElementById('json-data');
    const button = document.getElementById('submitButton');

    if (!Commands[0].commands.length) {
        return showResult('Please provide at least one valid command for execution.');
    }

    try {
        button.style.display = 'none';
        const State = JSON.parse(jsonInput.value);
        if (State && typeof State === 'object') {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state: State,
                    commands: Commands,
                    prefix: document.getElementById('inputOfPrefix').value,
                    admin: document.getElementById('inputOfAdmin').value,
                }),
            });
            const data = await response.json();
            jsonInput.value = '';
            showResult(data.message);
        } else {
            throw new Error('Invalid JSON data.');
        }
    } catch (parseError) {
        jsonInput.value = '';
        console.error('Error parsing JSON:', parseError);
        showResult('Error parsing JSON. Please check your input.');
    } finally {
        setTimeout(() => { button.style.display = 'block'; }, 4000);
    }
}

function showResult(message) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `<h5>${message}</h5>`;
    resultContainer.style.display = 'block';
}

async function commandList() {
    try {
        const [listOfCommands, listOfCommandsEvent] = [document.getElementById('listOfCommands'), document.getElementById('listOfCommandsEvent')];
        const response = await fetch('/commands');
        const { commands, handleEvent, aliases } = await response.json();

        commands.forEach((command, index) => {
            const container = createCommand(listOfCommands, index + 1, command, 'commands', aliases[index] || []);
            listOfCommands.appendChild(container);
        });

        handleEvent.forEach((command, index) => {
            const container = createCommand(listOfCommandsEvent, index + 1, command, 'handleEvent', aliases[index] || []);
            listOfCommandsEvent.appendChild(container);
        });
    } catch (error) {
        console.log(error);
    }
}

function createCommand(element, order, command, type, aliases) {
    const container = document.createElement('div');
    container.classList.add('form-check', 'form-switch');
    container.onclick = toggleCheckbox;

    const checkbox = document.createElement('input');
    checkbox.classList.add('form-check-input', type);
    checkbox.type = 'checkbox';
    checkbox.role = 'switch';
    checkbox.id = `flexSwitchCheck_${order}`;

    const label = document.createElement('label');
    label.classList.add('form-check-label', type);
    label.setAttribute('for', `flexSwitchCheck_${order}`);
    label.textContent = `${order}. ${command}`;

    container.appendChild(checkbox);
    container.appendChild(label);
    return container;
}

function toggleCheckbox() {
    const box = [
        { input: '.form-check-input.commands', label: '.form-check-label.commands', array: Commands[0].commands },
        { input: '.form-check-input.handleEvent', label: '.form-check-label.handleEvent', array: Commands[1].handleEvent }
    ];

    box.forEach(({ input, label, array }) => {
        const checkbox = this.querySelector(input);
        const labelText = this.querySelector(label);
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            labelText.classList.toggle('disable', checkbox.checked);
            const command = labelText.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
            if (checkbox.checked) {
                array.push(command);
            } else {
                const removeIndex = array.indexOf(command);
                if (removeIndex !== -1) array.splice(removeIndex, 1);
            }
        }
    });
}

function selectAllCommands() {
    toggleAllCheckboxes('.form-check-input.commands', Commands[0].commands);
}

function selectAllEvents() {
    toggleAllCheckboxes('.form-check-input.handleEvent', Commands[1].handleEvent);
}

function toggleAllCheckboxes(selector, array) {
    const checkboxes = document.querySelectorAll(selector);
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach((checkbox) => {
        checkbox.checked = !allChecked;
        const labelText = checkbox.nextElementSibling;
        labelText.classList.toggle('disable', checkbox.checked);
        const command = labelText.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
        if (checkbox.checked) {
            if (!array.includes(command)) array.push(command);
        } else {
            const removeIndex = array.indexOf(command);
            if (removeIndex !== -1) array.splice(removeIndex, 1);
        }
    });
}

commandList();
