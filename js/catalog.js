// PokéAPI Configuration
const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const POKEMON_PER_PAGE = 50;
const LOCAL_STORAGE_KEY = 'myPokemonCatalogLocal';
const REMOVED_STORAGE_KEY = 'myPokemonCatalogRemoved';
const DEFAULT_ITEMS_PER_PAGE = 10;

const DEMO_POKEMON = [
    { source: 'local', id: 1, name: 'bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', types: ['grass', 'poison'], description: 'Pokémon demo - Grass/Poison' },
    { source: 'local', id: 4, name: 'charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', types: ['fire'], description: 'Pokémon demo - Fire' },
    { source: 'local', id: 7, name: 'squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png', types: ['water'], description: 'Pokémon demo - Water' },
];

let currentOffset = 0;
let apiPokemon = [];
let localPokemon = [];
let allPokemon = [];
let filteredPokemon = [];
let currentPage = 1;
let itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
let uploadedImageData = null; // Stores Data URI when user uploads file directly

const pokemonGrid = document.getElementById('pokemonGrid');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadedCountSpan = document.getElementById('loadedCount');
const addPokemonForm = document.getElementById('addPokemonForm');
const modal = document.getElementById('pokemonModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const pokemonPreviewImg = document.getElementById('pokemonPreview');
const pokemonFileInput = document.getElementById('pokemonFile');
const pokemonImageInput = document.getElementById('pokemonImage');
const toggleAddFormBtn = document.getElementById('toggleAddFormBtn');
const catalogCrudSection = document.getElementById('catalogCrudSection');

// loadMoreBtn tidak ada di layout baru, sifatnya optional
const hasLoadMore = Boolean(loadMoreBtn);

function loadLocalPokemon() {
    try {
        const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        if (Array.isArray(data)) return data;
    } catch (e) {
        console.error('Invalid local stored data', e);
    }
    return [];
}

function saveLocalPokemon() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localPokemon));
}

function loadRemovedPokemonIds() {
    try {
        const data = JSON.parse(localStorage.getItem(REMOVED_STORAGE_KEY) || '[]');
        if (Array.isArray(data)) return new Set(data);
    } catch (e) {
        console.error('Invalid removed data', e);
    }
    return new Set();
}

function saveRemovedPokemonIds() {
    localStorage.setItem(REMOVED_STORAGE_KEY, JSON.stringify([...removedPokemonIds]));
}

const removedPokemonIds = loadRemovedPokemonIds();

function syncAllPokemon() {
    const apiBase = apiPokemon.filter(p => !removedPokemonIds.has(`${p.source}:${p.id}`));

    const apiOverrides = new Map();
    const localBase = [];

    for (const lp of localPokemon) {
        if (lp.overrideFor === 'api' && lp.overrideForId != null) {
            apiOverrides.set(lp.overrideForId, lp);
        } else {
            localBase.push(lp);
        }
    }

    const mergedApi = apiBase.map(p => apiOverrides.get(p.id) || p);

    // Tampilkan Pokémon lokal terbaru di atas
    localBase.sort((a, b) => (b.id || 0) - (a.id || 0));

    allPokemon = [
        ...localBase,
        ...mergedApi
    ];
}

// Fetch Pokemon data from API
async function fetchPokemon(limit = POKEMON_PER_PAGE, offset = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        return [];
    }
}

// Get detailed Pokemon info
async function getPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return {
            source: 'api',
            id: data.id,
            name: data.name,
            image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
            types: data.types.map(t => t.type.name),
            speciesUrl: data.species?.url || null,
            description: ''
        };
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}

// Fetch species flavor text
async function getPokemonSpeciesDescription(speciesUrl) {
    if (!speciesUrl) return 'Deskripsi tidak tersedia.';
    try {
        const response = await fetch(speciesUrl);
        const data = await response.json();
        const flavor = data.flavor_text_entries.find(entry => entry.language.name === 'id') ||
                       data.flavor_text_entries.find(entry => entry.language.name === 'en');
        if (flavor) {
            return flavor.flavor_text.replace(/\n|\f/g, ' ');
        }
    } catch (error) {
        console.warn('Error fetching species description:', error);
    }
    return 'Deskripsi tidak tersedia.';
}

async function getPokemonFullInfo(pokemon) {
    if (pokemon.source === 'local') return null;
    try {
        const response = await fetch(`${API_BASE_URL}/${pokemon.id}`);
        const data = await response.json();

        const speciesData = data.species ? await fetch(data.species.url).then(r => r.json()).catch(() => null) : null;
        const color = speciesData?.color?.name || 'unknown';
        const eggGroups = speciesData?.egg_groups?.map(g => g.name).join(', ') || 'Unknown';
        const growthRate = speciesData?.growth_rate?.name || 'Unknown';
        const genderRate = speciesData?.gender_rate;
        const gender = genderRate === -1 ? 'Genderless' : `${(genderRate / 8 * 100).toFixed(1)}% male, ${(100 - (genderRate / 8 * 100)).toFixed(1)}% female`;
        const abilities = data.abilities.map(a => a.ability.name).join(', ');
        const baseStats = data.stats.reduce((acc, s) => {
            const key = s.stat.name.replace('special-', 'special_');
            acc[key] = s.base_stat;
            return acc;
        }, {});

        return {
            weight: (data.weight / 10).toFixed(1),
            height: (data.height / 10).toFixed(1),
            stats: {
                hp: baseStats.hp || '-',
                attack: baseStats.attack || '-',
                defense: baseStats.defense || '-',
                specialAttack: baseStats.special_attack || baseStats['special-attack'] || '-',
                specialDefense: baseStats.special_defense || baseStats['special-defense'] || '-',
                speed: baseStats.speed || '-'
            },
            abilities,
            color,
            eggGroups,
            growthRate,
            gender,
            catchRate: speciesData?.capture_rate || 'Unknown',
            baseFriendship: speciesData?.base_happiness || 'Unknown'
        };
    } catch (error) {
        console.warn('Failed full info:', error);
        return null;
    }
}

// Create Pokemon card HTML
function createPokemonCard(pokemon) {
    const isLocal = pokemon.source === 'local';
    return `
        <div class="pokemon-card" data-id="${pokemon.id}" data-source="${pokemon.source}">
            <button class="delete-card-btn" data-id="${pokemon.id}" data-source="${pokemon.source}">✕</button>
            <div class="pokemon-image">
                <img src="${pokemon.image}" alt="${pokemon.name}" onerror="this.src='https://via.placeholder.com/120?text=${pokemon.name}'">
            </div>
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
            <div class="pokemon-type">
                ${pokemon.types.map(type => `<span class="type-badge">${type}</span>`).join('')}
            </div>
            <div class="pokemon-source">${isLocal ? 'Lokal' : 'API'}</div>
        </div>
    `;
}

function renderGrid(list) {
    const totalItems = list.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = list.slice(startIndex, startIndex + itemsPerPage);

    pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    if (pageItems.length === 0) {
        pokemonGrid.innerHTML = '<div class="loading">No Pokémon ditemukan</div>';
        return;
    }

    pokemonGrid.innerHTML = pageItems.map(p => createPokemonCard(p)).join('');

    // Detail card click (support click + touch)
    pokemonGrid.querySelectorAll('.pokemon-card').forEach(card => {
        const handleOpen = () => {
            const id = card.getAttribute('data-id');
            const source = card.getAttribute('data-source');
            const pokemon = allPokemon.find(p => String(p.id) === id && p.source === source);
            if (pokemon) openModal(pokemon);
        };

        card.addEventListener('click', handleOpen);
        card.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleOpen();
        });
    });

    // Delete button
    pokemonGrid.querySelectorAll('.delete-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const source = btn.getAttribute('data-source');
            deletePokemon(id, source);
        });
    });
}

function displayPokemon(pokemonList) {
    renderGrid(pokemonList);
    updateLoadedCount();
}

// Remove Pokemon
function deletePokemon(id, source) {
    const pokemon = allPokemon.find(p => String(p.id) === id && p.source === source);
    const name = pokemon?.name || `#${id}`;
    const confirmed = confirm(`Yakin ingin menghapus ${name} (${source})?`);
    if (!confirmed) return;

    if (source === 'local') {
        localPokemon = localPokemon.filter(p => String(p.id) !== id);
        saveLocalPokemon();
    } else {
        removedPokemonIds.add(`${source}:${id}`);
        saveRemovedPokemonIds();
    }
    syncAllPokemon();
    filterPokemon(searchInput.value);
}

async function typeText(element, text, speed = 25) {
    element.textContent = '';
    let index = 0;
    return new Promise(resolve => {
        const interval = setInterval(() => {
            element.textContent += text.charAt(index);
            index += 1;
            if (index >= text.length) {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

async function openModal(pokemon) {
    let description = pokemon.description || 'Deskripsi tidak tersedia.';
    let extra = pokemon.fullInfo || null;

    const typeBadges = pokemon.types.map(type => `<span class="type-badge type-badge-${type}">${type}</span>`).join('');
    const stats = {
        hp: pokemon.stats?.hp || '-',
        attack: pokemon.stats?.attack || '-',
        defense: pokemon.stats?.defense || '-',
        specialAttack: pokemon.stats?.specialAttack || '-',
        specialDefense: pokemon.stats?.specialDefense || '-',
        speed: pokemon.stats?.speed || '-'
    };

    modalBody.innerHTML = `
        <div class="modal-body">
            <div class="modal-top">
                <div class="modal-pokemon-image">
                    <img src="${pokemon.image}" alt="${pokemon.name}" onerror="this.src='https://via.placeholder.com/180?text=${pokemon.name}'" />
                </div>
                <div class="modal-pokemon-info">
                    <h3>${pokemon.name}</h3>
                    <p class="subtitle">ID: #${String(pokemon.id).padStart(3, '0')}</p>
                    <div class="type-badges-row">${typeBadges}</div>
                </div>
                <div class="modal-base-stats">
                    <h4>Base Stats</h4>
                    <ul>
                        <li class="stat-hp">HP: ${stats.hp}</li>
                        <li class="stat-attack">Attack: ${stats.attack}</li>
                        <li class="stat-defense">Defense: ${stats.defense}</li>
                        <li class="stat-spattack">Sp. Atk: ${stats.specialAttack}</li>
                        <li class="stat-spdefense">Sp. Def: ${stats.specialDefense}</li>
                        <li class="stat-speed">Speed: ${stats.speed}</li>
                    </ul>
                </div>
            </div>

            <div class="modal-details-grid">
                <div class="detail-item detail-height"><b>Height</b>: ${extra?.height || pokemon.height || '-'} m</div>
                <div class="detail-item detail-weight"><b>Weight</b>: ${extra?.weight || pokemon.weight || '-'} kg</div>
                <div class="detail-item detail-abilities"><b>Abilities</b>: ${extra?.abilities || pokemon.abilities || '-'} </div>
                <div class="detail-item detail-egggroups"><b>Egg Group</b>: ${extra?.eggGroups || pokemon.eggGroups || '-'}</div>
                <div class="detail-item detail-growth"><b>Growth</b>: ${extra?.growthRate || pokemon.growthRate || '-'}</div>
                <div class="detail-item detail-gender"><b>Gender</b>: ${extra?.gender || pokemon.gender || '-'}</div>
                <div class="detail-item detail-catchrate"><b>Catch rate</b>: ${extra?.catchRate || pokemon.catchRate || '-'}</div>
                <div class="detail-item detail-friendship"><b>Base friendship</b>: ${extra?.baseFriendship || pokemon.baseFriendship || '-'}</div>
            </div>

            <div class="modal-description"></div>

            <div class="modal-update-form" style="display:none;"></div>

            <div class="modal-action-row">
                <button class="update-btn">Update</button>
                <button class="delete-btn" data-id="${pokemon.id}" data-source="${pokemon.source}">Hapus</button>
                <button class="close-modal">Tutup</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    const descriptionEl = modalBody.querySelector('.modal-description');
    await typeText(descriptionEl, description, 25);

    modalBody.querySelector('.delete-btn').addEventListener('click', () => {
        deletePokemon(String(pokemon.id), pokemon.source);
        closeModal();
    });

    modalBody.querySelector('.close-modal').addEventListener('click', closeModal);

    const statsUpdate = {
        hp: modalBody.querySelector('.stat-hp'),
        attack: modalBody.querySelector('.stat-attack'),
        defense: modalBody.querySelector('.stat-defense'),
        specialAttack: modalBody.querySelector('.stat-spattack'),
        specialDefense: modalBody.querySelector('.stat-spdefense'),
        speed: modalBody.querySelector('.stat-speed')
    };

    function refreshBaseStatsDisplay(statsObj) {
        if (!statsObj) return;
        statsUpdate.hp.textContent = `HP: ${statsObj.hp || '-'}`;
        statsUpdate.attack.textContent = `Attack: ${statsObj.attack || '-'}`;
        statsUpdate.defense.textContent = `Defense: ${statsObj.defense || '-'}`;
        statsUpdate.specialAttack.textContent = `Sp. Atk: ${statsObj.specialAttack || '-'}`;
        statsUpdate.specialDefense.textContent = `Sp. Def: ${statsObj.specialDefense || '-'}`;
        statsUpdate.speed.textContent = `Speed: ${statsObj.speed || '-'}`;
    }

    function refreshDetailDisplay(info) {
        if (!info) return;
        modalBody.querySelector('.detail-height').textContent = `Height: ${info.height || pokemon.height || '-'} m`;
        modalBody.querySelector('.detail-weight').textContent = `Weight: ${info.weight || pokemon.weight || '-'} kg`;
        modalBody.querySelector('.detail-abilities').textContent = `Abilities: ${info.abilities || pokemon.abilities || '-'} `;
        modalBody.querySelector('.detail-egggroups').textContent = `Egg Group: ${info.eggGroups || pokemon.eggGroups || '-'}`;
        modalBody.querySelector('.detail-growth').textContent = `Growth: ${info.growthRate || pokemon.growthRate || '-'}`;
        modalBody.querySelector('.detail-gender').textContent = `Gender: ${info.gender || pokemon.gender || '-'}`;
        modalBody.querySelector('.detail-catchrate').textContent = `Catch rate: ${info.catchRate || pokemon.catchRate || '-'}`;
        modalBody.querySelector('.detail-friendship').textContent = `Base friendship: ${info.baseFriendship || pokemon.baseFriendship || '-'}`;
    }

    async function loadExtraInfo() {
        if (pokemon.source === 'api' && !pokemon.fullInfo) {
            const fetched = await getPokemonFullInfo(pokemon);
            if (fetched) {
                pokemon.fullInfo = fetched;
                refreshBaseStatsDisplay(fetched.stats);
                refreshDetailDisplay(fetched);
                if (!pokemon.description && pokemon.speciesUrl) {
                    description = await getPokemonSpeciesDescription(pokemon.speciesUrl);
                    pokemon.description = description;
                }
                descriptionEl.textContent = '';
                await typeText(descriptionEl, description, 25);
            }
        }
    }

    loadExtraInfo();

    const updateBtn = modalBody.querySelector('.update-btn');
    const updateFormContainer = modalBody.querySelector('.modal-update-form');

    updateBtn.addEventListener('click', () => {
        updateFormContainer.style.display = 'block';
        updateFormContainer.innerHTML = renderUpdateForm(pokemon, extra);
        const newDescription = modalBody.querySelector('.modal-description');
        newDescription.style.display = 'none';

        const form = document.getElementById('modalUpdateForm');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const values = {
                height: form.elements['height'].value || '-',
                weight: form.elements['weight'].value || '-',
                abilities: form.elements['abilities'].value || '-',
                eggGroups: form.elements['eggGroups'].value || '-',
                growthRate: form.elements['growthRate'].value || '-',
                gender: form.elements['gender'].value || '-',
                catchRate: form.elements['catchRate'].value || '-',
                baseFriendship: form.elements['baseFriendship'].value || '-',
                description: form.elements['description'].value || 'Deskripsi tidak tersedia.'
            };

            applyUpdateToPokemon(pokemon, values);
            modalBody.querySelector('.modal-description').textContent = values.description;
            modalBody.querySelector('.modal-description').style.display = 'block';
            updateFormContainer.style.display = 'none';
        });

        modalBody.querySelector('.cancel-update-btn').addEventListener('click', () => {
            updateFormContainer.style.display = 'none';
            const newDescription = modalBody.querySelector('.modal-description');
            newDescription.style.display = 'block';
        });
    });
}

function closeModal() {
    modal.style.display = 'none';
}

function renderUpdateForm(pokemon, extra) {
    const formHtml = `
        <form id="modalUpdateForm" class="update-form">
            <div class="update-row">
                <label>Height (m)</label>
                <input name="height" type="number" step="0.1" value="${extra?.height || ''}" />
            </div>
            <div class="update-row">
                <label>Weight (kg)</label>
                <input name="weight" type="number" step="0.1" value="${extra?.weight || ''}" />
            </div>
            <div class="update-row">
                <label>Abilities</label>
                <input name="abilities" type="text" value="${(extra?.abilities || '').replace(/,/g, ', ')}" placeholder="coma-separated" />
            </div>
            <div class="update-row">
                <label>Egg Group</label>
                <input name="eggGroups" type="text" value="${extra?.eggGroups || ''}" />
            </div>
            <div class="update-row">
                <label>Growth Rate</label>
                <input name="growthRate" type="text" value="${extra?.growthRate || ''}" />
            </div>
            <div class="update-row">
                <label>Gender</label>
                <input name="gender" type="text" value="${extra?.gender || ''}" />
            </div>
            <div class="update-row">
                <label>HP</label>
                <input name="hp" type="number" value="${extra?.stats?.hp || pokemon.stats?.hp || ''}" />
            </div>
            <div class="update-row">
                <label>Attack</label>
                <input name="attack" type="number" value="${extra?.stats?.attack || pokemon.stats?.attack || ''}" />
            </div>
            <div class="update-row">
                <label>Defense</label>
                <input name="defense" type="number" value="${extra?.stats?.defense || pokemon.stats?.defense || ''}" />
            </div>
            <div class="update-row">
                <label>Sp. Atk</label>
                <input name="specialAttack" type="number" value="${extra?.stats?.specialAttack || pokemon.stats?.specialAttack || ''}" />
            </div>
            <div class="update-row">
                <label>Sp. Def</label>
                <input name="specialDefense" type="number" value="${extra?.stats?.specialDefense || pokemon.stats?.specialDefense || ''}" />
            </div>
            <div class="update-row">
                <label>Speed</label>
                <input name="speed" type="number" value="${extra?.stats?.speed || pokemon.stats?.speed || ''}" />
            </div>
            <div class="update-row">
                <label>Catch rate</label>
                <input name="catchRate" type="number" value="${extra?.catchRate || ''}" />
            </div>
            <div class="update-row">
                <label>Base friendship</label>
                <input name="baseFriendship" type="number" value="${extra?.baseFriendship || ''}" />
            </div>
            <div class="update-row">
                <label>Deskripsi</label>
                <textarea name="description">${pokemon.description || ''}</textarea>
            </div>
            <div class="update-row buttons-wrap">
                <button type="submit" class="save-update-btn">Simpan</button>
                <button type="button" class="cancel-update-btn">Batal</button>
            </div>
        </form>
    `;
    return formHtml;
}

function applyUpdateToPokemon(pokemon, values) {
    const targetIndex = localPokemon.findIndex(item => (item.overrideFor === 'api' && item.overrideForId === pokemon.id) || (item.source === 'local' && item.id === pokemon.id));
    const updatedObj = {
        ...pokemon,
        source: 'local',
        height: values.height,
        weight: values.weight,
        abilities: values.abilities,
        eggGroups: values.eggGroups,
        growthRate: values.growthRate,
        gender: values.gender,
        catchRate: values.catchRate,
        baseFriendship: values.baseFriendship,
        description: values.description,
        stats: {
            hp: values.hp,
            attack: values.attack,
            defense: values.defense,
            specialAttack: values.specialAttack,
            specialDefense: values.specialDefense,
            speed: values.speed
        },
        overrideFor: pokemon.source === 'api' ? 'api' : undefined,
        overrideForId: pokemon.source === 'api' ? pokemon.id : undefined
    };

    if (targetIndex > -1) {
        localPokemon[targetIndex] = { ...localPokemon[targetIndex], ...updatedObj };
    } else {
        localPokemon.push(updatedObj);
    }

    saveLocalPokemon();
    syncAllPokemon();
    filterPokemon(searchInput.value);
}

function showChatMessage(pokemon) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;

    const message = `Trainer: "Wah, ${pokemon.name} (ID #${String(pokemon.id).padStart(3, '0')}) telah ditambahkan! Tipe: ${pokemon.types.join(', ')}.${pokemon.source === 'local' ? ' (Lokal)' : ''}"
`;
    const chatHtml = `
        <div class="chat-item">
            <span>PokéBot:</span> ${message}
        </div>
    `;
    chatArea.innerHTML = chatHtml + chatArea.innerHTML;
}

// Filter Pokemon by search
function filterPokemon(searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredPokemon = allPokemon.filter(pokemon =>
        pokemon.name.toLowerCase().includes(term) ||
        String(pokemon.id).includes(term)
    );
    currentPage = 1;
    renderGrid(filteredPokemon);
}

// Update loaded count
function updateLoadedCount() {
    loadedCountSpan.textContent = allPokemon.length;
}

async function loadPokemon() {
    if (hasLoadMore) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Loading...';
    }

    const pokemonList = await fetchPokemon(POKEMON_PER_PAGE, currentOffset);

    for (const pokemon of pokemonList) {
        const details = await getPokemonDetails(pokemon.url);
        if (details) {
            apiPokemon.push(details);
        }
    }

    currentOffset += POKEMON_PER_PAGE;
    syncAllPokemon();
    filterPokemon(searchInput.value);

    if (hasLoadMore) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load More';
    }
}

addPokemonForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('pokemonName').value.trim();
    const typeInput = document.getElementById('pokemonType').value.trim();
    const imageInput = document.getElementById('pokemonImage').value.trim();
    const descInput = document.getElementById('pokemonDescription').value.trim();

    if (!name) return;

    const highestLocal = Math.max(0, ...allPokemon.map(p => p.id || 0));
    const id = highestLocal + 1;
    const image = imageInput ? imageInput : (uploadedImageData ? uploadedImageData : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
    const types = typeInput ? [typeInput] : ['normal'];

    if (allPokemon.some(p => p.source === 'local' && p.name.toLowerCase() === name.toLowerCase()) ||
        apiPokemon.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('Nama Pokémon sudah ada. Coba nama lain.');
        return;
    }

    const autoDescription = `Pokedex: ${name} (#${String(id).padStart(3, '0')}) adalah Pokémon tipe ${types.join(', ')}.`;
    const newPokemon = {
        source: 'local',
        id,
        name,
        image,
        types,
        description: descInput || autoDescription
    };

    localPokemon.unshift(newPokemon); // tambah di awal supaya terlihat langsung
    saveLocalPokemon();
    syncAllPokemon();
    currentPage = 1;
    filterPokemon(searchInput.value);
    showChatMessage(newPokemon);

    addPokemonForm.reset();
    uploadedImageData = null; // bersihkan setelah penyimpanan

    // Pastikan item baru langsung terlihat
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

searchInput.addEventListener('input', (e) => {
    filterPokemon(e.target.value);
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage -= 1;
        renderGrid(filteredPokemon);
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / itemsPerPage));
    if (currentPage < totalPages) {
        currentPage += 1;
        renderGrid(filteredPokemon);
    }
});

itemsPerPageSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value, 10) || DEFAULT_ITEMS_PER_PAGE;
    currentPage = 1;
    renderGrid(filteredPokemon);
});

pokemonImageInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value) {
        pokemonPreviewImg.src = value;
    }
});

pokemonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const result = event.target.result;
        pokemonPreviewImg.src = result;
        pokemonImageInput.value = '';
        uploadedImageData = result; // simpan untuk digunakan saat submit
    };
    reader.readAsDataURL(file);
});

if (toggleAddFormBtn && catalogCrudSection) {
    toggleAddFormBtn.addEventListener('click', () => {
        const currentlyHidden = catalogCrudSection.style.display === 'none' || !catalogCrudSection.style.display;
        catalogCrudSection.style.display = currentlyHidden ? 'block' : 'none';
        if (currentlyHidden) {
            catalogCrudSection.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    });
}

if (hasLoadMore) {
    loadMoreBtn.addEventListener('click', () => {
        loadPokemon();
    });
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

window.addEventListener('load', async () => {
    localPokemon = loadLocalPokemon();

    if (!localPokemon.length && !loadRemovedPokemonIds().size) {
        localPokemon = [...DEMO_POKEMON];
        saveLocalPokemon();
    }

    syncAllPokemon();
    filterPokemon('');

    await loadPokemon();

    if (!allPokemon.length) {
        // fallback jika API gagal memuat
        localPokemon = [...DEMO_POKEMON];
        syncAllPokemon();
        filterPokemon('');
    }
});
