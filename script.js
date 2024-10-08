function stylize(input) {
    let parts = input.split('-');

    let capitalizedParts = parts.map(part => {
        if (part.toLowerCase() === "gpt") {
            return part.toUpperCase();
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
    });

    return capitalizedParts.join(' ');
}

fetch('https://reverse.mubi.tech/v1/models')
    .then(response => response.json())
    .then(data => {
        const dropdown = document.getElementById('model');
        const models = data.data;
        dropdown.innerHTML = "";

        models.forEach(model => {
            if (model.owned_by === 'openai' && model.type === "chat.completions") {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = stylize(model.id);
                if (model.id === 'gpt-4o') {
                    dropdown.removeAttribute('disabled');
                    option.selected = true;
                }
                dropdown.appendChild(option);
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));

let konami = false;
const easterEgg = new Konami(() => konamilol());

function konamilol() {
    if (konami) {
        console.log("umm you can only do it once... but okay");
        return;
    }
    konami = true;
    console.log("you got it");
    
    let items = ["Super threatening", "Extremely threatening", "UwUify"];
    let dropdown = document.getElementById('style');

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });

    items = ["Pirate", "Toki Pona"];
    dropdown = document.getElementById('languages');

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
}

document.getElementById('rulesForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedRules = Array.from(document.querySelectorAll('input[name="rule"]:checked'))
        .map(checkbox => {
            const rule = checkbox.value;
            const punishmentSelect = checkbox.parentElement.querySelector('.punishment-select');
            const punishment = punishmentSelect ? punishmentSelect.value : 'No punishment specified';
            return `${rule} | Punishment: ${punishment}`;
        });

    if (selectedRules.length === 0) {
        alert('Please select at least one rule.');
        return;
    }

    const model = document.getElementById('model').value;
    const selectedLanguage = document.getElementById('languages').value || 'English';
    const selectedStyle = document.getElementById('style').value || 'Formal';

    const prompt = `Generate the following Discord Server rules in ${selectedLanguage}, using the ${selectedStyle} style, while adding specific text inside this point explaining what it means: Follow Discord's Terms of Service (link to https://discord.com/terms using markdown as well, punishment is a ban), ${selectedRules.join(', ')}`;

    console.log(prompt);

    const outputDiv = document.getElementById('output');
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';
    const loader = document.createElement('div');
    loader.className = 'loader';
    loaderContainer.appendChild(loader);
    outputDiv.innerHTML = '';
    outputDiv.appendChild(loaderContainer);
    outputDiv.removeAttribute('hidden');

    fetch("https://reverse.mubi.tech/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: `You are an AI specifically designed to generate rules for Discord servers. Based on the criteria given, you must give out the rules in a clear, understandable and concise manner. The rules should be written in a way that is easy to understand and not redundant. List the rules in numerical order. You must exclusively generate the rules in this language: ${selectedLanguage}.` },
                { role: "system", content: `You must speak in the ${selectedStyle.toLowerCase()} style, always.` },
                { role: "system", content: "You can use markdown, however you will NOT add a title, you'll just list the rules. You cannot add rules not specified within the user's instructions. Avoid the use of buzzwords, emojis and words that are not easy enough to understand for the average person. You will add more specification to each point. Do NOT make up place-holder channel names, such as #gaming, #general, #memes, etc. Talk normally, without any buzzwords." },
                { role: "system", content: "You must also include the punishments for each rule. You can use bold text to make the punishments stand out, but you will also need to add a bit more text to indicate them in some cases." },
                { role: "system", content: "Do NOT add anything similar to 'without permission from moderators' to any of the rules." },
                { role: "system", content: "List the punishments as in this example: 'If you do [action], then you will be **banned**/**kicked**/**timed out**.' You can change how long you make that explanation." },
                { role: "system", content: "You can add subtext (smaller text) at the end of your message with -# <message>." },
                { role: "user", content: prompt },
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        const result = data.choices[0].message.content;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Markdown';
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(result).then(() => {
                alert('Markdown copied to clipboard!');
            }).catch(err => {
                console.error('Error copying markdown:', err);
            });
        });

        outputDiv.innerHTML = '';
        outputDiv.appendChild(copyButton);

        const markdownContent = document.createElement('div');
        markdownContent.innerHTML = marked.parse(result);
        outputDiv.appendChild(markdownContent);
    })
    .catch(error => {
        console.error('Error:', error);
        outputDiv.textContent = 'An error occurred while generating the rules.';
    });
});

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
