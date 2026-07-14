const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const pokemonImage = document.getElementById("pokemonImage");
const pokemonName = document.getElementById("pokemonName");
const pokemonNumber = document.getElementById("pokemonNumber");
const pokemonDescription = document.getElementById("pokemonDescription");
const pokemonTypes = document.getElementById("pokemonTypes");

const height = document.getElementById("height");
const weight = document.getElementById("weight");

const cry = document.getElementById("pokemonCry");
const playCry = document.getElementById("playCry");

const hp = document.getElementById("hp");
const attack = document.getElementById("attack");
const defense = document.getElementById("defense");
const specialAttack = document.getElementById("specialAttack");
const specialDefense = document.getElementById("specialDefense");
const speed = document.getElementById("speed");

let currentPokemon = 1;

async function loadPokemon(value){

    try{

        const pokemonResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${value.toString().toLowerCase()}`
        );

        if(!pokemonResponse.ok){
            throw new Error("Pokemon not found");
        }

        const pokemon = await pokemonResponse.json();

        if(pokemon.id > 151){
            alert("Only Generation I Pokémon are available!");
            return;
        }

        currentPokemon = pokemon.id;

        const speciesResponse = await fetch(
            pokemon.species.url
        );

        const species = await speciesResponse.json();

        displayPokemon(pokemon, species);

        // Evolution chain bomo dodali v 2. delu
        loadEvolution(species.evolution_chain.url);

    }

    catch(error){

        pokemonName.textContent = "Not Found";
        pokemonNumber.textContent = "";
        pokemonDescription.textContent = "";
        pokemonImage.src = "";
        pokemonTypes.textContent = "";

        alert("Pokémon not found.");

    }

}

function displayPokemon(pokemon, species){

    pokemonImage.src =
        pokemon.sprites.other["official-artwork"].front_default;

    pokemonName.textContent =
        pokemon.name.charAt(0).toUpperCase() +
        pokemon.name.slice(1);

    pokemonNumber.textContent =
        "#" + pokemon.id.toString().padStart(3,"0");

    pokemonTypes.textContent =
        pokemon.types
        .map(type => capitalize(type.type.name))
        .join(" / ");

    height.textContent =
        (pokemon.height/10).toFixed(1) + " m";

    weight.textContent =
        (pokemon.weight/10).toFixed(1) + " kg";

    const description =
        species.flavor_text_entries.find(entry =>
            entry.language.name === "en"
        );

    pokemonDescription.textContent =
        description.flavor_text
        .replace(/\n/g," ")
        .replace(/\f/g," ");

    if (pokemon.cries && pokemon.cries.latest) {
        cry.src = pokemon.cries.latest;
        playCry.disabled = false;
    } else {
        cry.removeAttribute("src");
        playCry.disabled = true;
    }
    hp.value = pokemon.stats[0].base_stat;
    attack.value = pokemon.stats[1].base_stat;
    defense.value = pokemon.stats[2].base_stat;
    specialAttack.value = pokemon.stats[3].base_stat;
    specialDefense.value = pokemon.stats[4].base_stat;
    speed.value = pokemon.stats[5].base_stat;

}

playCry.addEventListener("click", () => {
    if (cry.src) {
        cry.currentTime = 0;
        cry.play();
    }
});

searchButton.addEventListener("click", ()=>{

    if(searchInput.value.trim() !== ""){
        loadPokemon(searchInput.value.trim());
    }

});

searchInput.addEventListener("keydown", e=>{

    if(e.key === "Enter"){

        if(searchInput.value.trim() !== ""){
            loadPokemon(searchInput.value.trim());
        }

    }

});

function capitalize(word){

    return word.charAt(0).toUpperCase() +
           word.slice(1);

}
const evolutionChain = document.getElementById("evolutionChain");

async function loadEvolution(url) {

    evolutionChain.innerHTML = "";

    const response = await fetch(url);
    const data = await response.json();

    const evolutions = [];

    getEvolution(data.chain, evolutions);

    for (let i = 0; i < evolutions.length; i++) {

        const pokemonName = evolutions[i];

        const pokemonResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
        );

        const pokemon = await pokemonResponse.json();

        const card = document.createElement("div");
        card.className = "evolutionPokemon";

        const img = document.createElement("img");
        img.src =
            pokemon.sprites.other["official-artwork"].front_default;

        const name = document.createElement("p");
        name.textContent = capitalize(pokemon.name);

        card.appendChild(img);
        card.appendChild(name);

        card.addEventListener("click", () => {
            loadPokemon(pokemon.name);
        });

        evolutionChain.appendChild(card);

        if (i < evolutions.length - 1) {

            const arrow = document.createElement("span");
            arrow.textContent = "➜";
            arrow.style.fontSize = "28px";

            evolutionChain.appendChild(arrow);

        }

    }

}

function getEvolution(chain, evolutions) {

    evolutions.push(chain.species.name);

    if (chain.evolves_to.length > 0) {

        getEvolution(chain.evolves_to[0], evolutions);

    }

}
const previous = document.getElementById("previous");
const next = document.getElementById("next");

/* Previous */

previous.addEventListener("click", () => {

    if (currentPokemon > 1) {
        loadPokemon(currentPokemon - 1);
    }

});

/* Next */

next.addEventListener("click", () => {

    if (currentPokemon < 151) {
        loadPokemon(currentPokemon + 1);
    }

});

/* Ob nalaganju strani */

window.addEventListener("load", () => {

    loadPokemon(1);

});

/* Če cry ne obstaja */

cry.addEventListener("error", () => {

    playCry.disabled = true;
    playCry.textContent = "No Cry";

});

cry.addEventListener("loadeddata", () => {

    playCry.disabled = false;
    playCry.textContent = "🔊 Cry";

});

/* Slika če artwork manjka */

pokemonImage.addEventListener("error", () => {

    pokemonImage.src =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

});

/* Počisti search po uspešnem iskanju */

searchButton.addEventListener("click", () => {

    searchInput.value = "";

});

/* Fokus na search */

searchInput.focus();

/* Omeji številke */

searchInput.addEventListener("input", () => {

    const value = searchInput.value.trim();

    if (!isNaN(value) && value !== "") {

        if (Number(value) > 151) {

            searchInput.value = "151";

        }

        if (Number(value) < 1) {

            searchInput.value = "1";

        }

    }

});

/* Escape počisti search */

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        searchInput.value = "";

    }

});