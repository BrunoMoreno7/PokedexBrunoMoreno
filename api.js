const pokeapi = "https://pokeapi.co/api/v2/pokemon?limit=151";
const listarPokemones = document.getElementById('app');
const abrirModal = document.getElementById('mostrarInfoPokemon'); // Selector corregido
const modal = document.getElementById('modal');
const modalPokemon = document.getElementById('modal_detalles');
const closeModal = document.getElementById('modal_close');

function traerPokemones() {
    fetch(pokeapi)
        .then(response => response.json())
        .then(datos => MostrarPokemones(datos.results))
        .catch(error => console.error("Hubo un error al cargar los pokemones: ", error));
}

function MostrarPokemones(pokemons) {
    var pokemonCartas = new Array(pokemons.length);

    pokemons.forEach((pokemon, index) => {
        fetch(pokemon.url)
            .then(response => response.json())
            .then(dataPokemon => {
                const pokemonCarta = `
                <div class="perfilPokemon" data-id="${dataPokemon.name}">
                    <button class="favorito-btn" onclick="añadirFavPokemon('${dataPokemon.name}')"> Fav </button>
                    <img src="${dataPokemon.sprites.other['official-artwork'].front_shiny}">
                    <h2>#${index + 1} ${dataPokemon.name}</h2>
                    <button class="mostrarInfoPokemon-btn" onclick="detallesPokemon('${dataPokemon.name}')"> Detalles </button>
                </div>
                `;

                pokemonCartas[index] = pokemonCarta;

                if (pokemonCartas.every(carta => carta !== undefined)) {
                    listarPokemones.innerHTML = pokemonCartas.join('');
                    actualizarCorazonFavorito(); // Actualiza el estado de los corazones al cargar
                }
            });
    });
}

function detallesPokemon(nombrePokemon) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${nombrePokemon}`)
        .then(response => response.json())
        .then(pokemon => {
            modalPokemon.innerHTML = '';
            const pokemonCarta = `
            <div class="perfilPokemon">
                <button class="favorito-btn" onclick="añadirFavPokemon('${pokemon.name}')"> Fav </button>
                <img src="${pokemon.sprites.other['official-artwork'].front_shiny}">
                <h2>Nombre: ${pokemon.name}</h2>
                <h2>Altura: ${pokemon.height}</h2>
                <h2>Peso: ${pokemon.weight}</h2>
                <h2>Habilidades: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</h2>
                <button id="modal_close" onclick="cerrarModal()"> Cerrar </button>
            </div>
            `;
            modalPokemon.innerHTML = pokemonCarta;
            modal.classList.add('modal--show');  // Mostramos el modal
        })
        .catch(error => console.error("Hubo un error al cargar los detalles del Pokémon: ", error));
}

function buscarPokemon() {
    const buscar = document.getElementById('search-Pokemon').value.toLowerCase();
    listarPokemones.innerHTML = ''; // Limpiar resultados anteriores
    if (buscar) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${buscar}`)
            .then(respuesta => {
                if (!respuesta.ok) {
                    traerPokemones();  // Recargar la lista de Pokémon si no hay búsqueda
                    alert("Pokémon no encontrado. Prueba otro nombre.");
                    return;
                }
                return respuesta.json();
            })
            .then(pokemon => {
                if (pokemon) {
                    const pokemonEncontrado = document.createElement('div');
                    pokemonEncontrado.classList.add('perfilPokemon');

                    pokemonEncontrado.innerHTML = `
                    <button class="favorito-btn" onclick="añadirFavPokemon('${pokemon.name}')"> Fav </button>
                    <img src="${pokemon.sprites.other['official-artwork'].front_default}">
                    <h2>${pokemon.name}</h2>
                    <button onclick="detallesPokemon('${pokemon.name}')"> Detalles </button>
                    `;
                    listarPokemones.appendChild(pokemonEncontrado);
                }
            })
            .catch(error => console.error("Error buscando Pokémon: ", error));
    } else {
        if (!buscar) {
            traerPokemones();  // Recargar la lista de Pokémon si no hay búsqueda
            return;
        }
    }
}

function cerrarModal() {
    modal.classList.remove('modal--show');
}

function reiniciarBusqueda() {
    fetch(pokeapi)
        .then(response => response.json())
        .then(datos => MostrarPokemones(datos.results))
        .catch(error => console.error("Hubo un error al cargar los pokemones: ", error));
}

function mostrarFavPokemon() {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const listarPokemones = document.getElementById('app');
    listarPokemones.innerHTML = ''; // Limpiar los Pokémon previos

    if (favoritos.length === 0) {
        listarPokemones.innerHTML = "<p>No tienes Pokémon favoritos.</p>";
        return;
    }

    favoritos.forEach(nombrePokemon => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${nombrePokemon}`)
            .then(response => response.json())
            .then(dataPokemon => {
                const pokemonCarta = `
                <div class="perfilPokemon" data-id="${dataPokemon.name}">
                    <button id="favorito-${dataPokemon.name}" class="favorito-btn guardado" onclick="añadirFavPokemon('${dataPokemon.name}')"> UnFav </button>
                    <img src="${dataPokemon.sprites.other['official-artwork'].front_shiny}">
                    <h2>${dataPokemon.name}</h2>
                    <button onclick="detallesPokemon('${dataPokemon.name}')"> Detalles </button>
                </div>
                `;
                listarPokemones.innerHTML += pokemonCarta;
            });
    });
}

// Función para añadir o eliminar un Pokémon de favoritos
function añadirFavPokemon(nombrePokemon) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.includes(nombrePokemon)) {
        // Eliminar de favoritos
        favoritos = favoritos.filter(fav => fav !== nombrePokemon);
    } else {
        // Añadir a favoritos
        favoritos.push(nombrePokemon);
    }

    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    actualizarCorazonFavorito();
}

// Función para actualizar el estado visual del botón de favorito
function actualizarCorazonFavorito() {
    const botonesFavoritos = document.querySelectorAll('.favorito-btn');
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    botonesFavoritos.forEach(boton => {
        const pokemonName = boton.getAttribute('onclick').split("'")[1];

        if (favoritos.includes(pokemonName)) {
            boton.classList.add('guardado');
            boton.innerText = 'UnFav';  // Cambia el texto cuando está guardado
        } else {
            boton.classList.remove('guardado');
            boton.innerText = 'Fav';  // Cambia el texto cuando no está guardado
        }
    });
}
// Llamada inicial para cargar los Pokémon
traerPokemones();
