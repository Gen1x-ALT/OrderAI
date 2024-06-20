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

    const languageSelect = document.getElementById('languages');
    const selectedLanguage = languageSelect.value || 'English';

    const prompt = `Generate the following Discord Server rules in ${selectedLanguage}, while adding specific text inside this point explaining what it means: Follow Discord's Terms of Service (link to https://discord.com/terms using markdown as well), ${selectedRules.join(', ')}`;

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
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Your name is Discord Rules Generator" },
                { role: "system", content: `You are an AI specifically designed to generate rules for Discord servers. Based on the criteria given, you must give out the rules in a clear and concise manner. The rules should be written in a way that is easy to understand and not redundant. List the rules in numerical order. You must exclusively generate the rules in this language: ${selectedLanguage}.` },
                { role: "system", content: "You can use markdown, however you will NOT add a title, you'll just list the rules. You cannot add rules not specified within the user's instructions. Avoid the use of buzzwords, emojis and words that are not easy enough to understand for the average person. You will add more specification to each point. Do NOT make up place-holder channel names, such as #gaming, #general, #memes, etc." },
                { role: "system", content: "You must also include the punishments for each rule. You can use bold text to make the punishments stand out, but you will also need to add a bit more text to indicate them in some cases." },
                { role: "user", content: prompt },
            ]
        })
    })
        .then(response => response.json())
        .then(data => {
            const result = data.choices[0].message.content;
            outputDiv.innerHTML = marked.parse(result);
        })
        .catch(error => {
            console.error('Error:', error);
            outputDiv.textContent = 'An error occurred while generating the rules.';
        })
        .finally(() => {

            outputDiv.removeChild(loaderContainer);
        });
});

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});