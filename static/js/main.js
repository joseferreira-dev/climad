// static/js/main.js (VERSÃO FINAL COM CORREÇÃO PARA O ERRO 'Assignment to constant variable')

// =================================================================
// DICIONÁRIO DE TRADUÇÃO E UNIDADES
// =================================================================
const PARAMETER_MAP = {
    "T2M": { name: "Temperatura Média a 2m", unitDaily: "°C", unitHourly: "°C" },
    "T2M_MAX": { name: "Temperatura Máx. a 2m", unitDaily: "°C", unitHourly: "°C" },
    "T2M_MIN": { name: "Temperatura Mín. a 2m", unitDaily: "°C", unitHourly: "°C" },
    "RH2M": { name: "Umidade Relativa a 2m", unitDaily: "%", unitHourly: "%" },
    "PRECTOTCORR": { name: "Precipitação Corrigida", unitDaily: "mm/dia", unitHourly: "mm/hr" },
    "WS2M": { name: "Velocidade do Vento a 2m", unitDaily: "m/s", unitHourly: "m/s" },
    "T2MDEW": { name: "Ponto de Orvalho/Geada a 2m", unitDaily: "°C", unitHourly: "°C" },
    "PS": { name: "Pressão Superficial", unitDaily: "kPa", unitHourly: "kPa" },
    "T2MWET": { name: "Temp. de Bulbo Úmido a 2m", unitDaily: "°C", unitHourly: "°C" },
    "WS50M": { name: "Velocidade do Vento a 50m", unitDaily: "m/s", unitHourly: "m/s" },
    "WD50M": { name: "Direção do Vento a 50m", unitDaily: "°", unitHourly: "°" },
    "WD2M": { name: "Direção do Vento a 2m", unitDaily: "°", unitHourly: "°" },
    "ALLSKY_SFC_SW_DWN": { name: "Irradiância Solar de Onda Curta", unitDaily: "MJ/m²/dia", unitHourly: "MJ/hr" },
    "ALLSKY_SFC_SW_DIFF": { name: "Irradiância Difusa de Onda Curta", unitDaily: "MJ/m²/dia", unitHourly: "MJ/hr" },
    "ALLSKY_SFC_SW_DNI": { name: "Irradiância Direta Normal", unitDaily: "MJ/m²/dia", unitHourly: "MJ/hr" },
    "ALLSKY_SRF_ALB": { name: "Albedo da Superfície", unitDaily: "Adimensional", unitHourly: "Adimensional" },
    "CLOUD_AMT": { name: "Quantidade de Nuvens", unitDaily: "%", unitHourly: "%" },
    "TOA_SW_DWN": { name: "Irradiância no Topo da Atmosfera", unitDaily: "MJ/m²/dia", unitHourly: "MJ/hr" },
    "WS10M": { name: "Velocidade do Vento a 10m", unitDaily: "m/s", unitHourly: "m/s" },
    "WD10M": { name: "Direção do Vento a 10m", unitDaily: "°", unitHourly: "°" },
    "GWETPROF": { name: "Umidade do Solo (Perfil)", unitDaily: "Fração (0-1)", unitHourly: "Fração (0-1)" },
    "TS": { name: "Temperatura da Superfície", unitDaily: "°C", unitHourly: "°C" },
    "ALLSKY_SFC_PAR_TOT": { name: "Radiação Fotossint. (PAR)", unitDaily: "MJ/m²/dia", unitHourly: "MJ/hr" },
    "QV2M": { name: "Umidade Específica a 2m", unitDaily: "g/kg", unitHourly: "g/kg" },
    "GWETROOT": { name: "Umidade na Zona Radicular", unitDaily: "Fração (0-1)", unitHourly: "Fração (0-1)" },
    "GWETTOP": { name: "Umidade Superficial do Solo", unitDaily: "Fração (0-1)", unitHourly: "Fração (0-1)" },
    "EVLAND": { name: "Evaporação em Terra", unitDaily: "mm/dia", unitHourly: "mm/hora" },
    "EVPTRNS": { name: "Fluxo de Evapotranspiração", unitDaily: "MJ/m²/dia", unitHourly: "MJ/hr" },
    "QV10M": { name: "Umidade Específica a 10m", unitDaily: "g/kg", unitHourly: "g/kg" },
    "T10M": { name: "Temperatura a 10m", unitDaily: "°C", unitHourly: "°C" },
    "SLP": { name: "Pressão ao Nível do Mar", unitDaily: "kPa", unitHourly: "kPa" },
    "TSOIL1": { name: "Temp. do Solo (0-10cm)", unitDaily: "°C", unitHourly: "°C" },
    "TSOIL2": { name: "Temp. do Solo (10-30cm)", unitDaily: "°C", unitHourly: "°C" },
    "TSOIL3": { name: "Temp. do Solo (30-70cm)", unitDaily: "°C", unitHourly: "°C" },
    "TSOIL4": { name: "Temp. do Solo (70-140cm)", unitDaily: "°C", unitHourly: "°C" },
    "TSOIL5": { name: "Temp. do Solo (140-290cm)", unitDaily: "°C", unitHourly: "°C" },
    "TSOIL6": { name: "Temp. do Solo (290-1000cm)", unitDaily: "°C", unitHourly: "°C" }
};

// =================================================================
// LÓGICA DO MAPA E FUNÇÕES AUXILIARES
// =================================================================
let map, marker, geocoder, renderedApexCharts = [], grid;

function initMap() {
    const initialCoords = { lat: -8.047562, lng: -34.877064 };
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, { center: initialCoords, zoom: 7 });
    geocoder = new google.maps.Geocoder();
    marker = new google.maps.Marker({ position: initialCoords, map: map });
    updateFormFields(initialCoords);

    map.addListener("click", (event) => {
        placeMarker(event.latLng);
        updateFormFields(event.latLng);
    });

    const mapSearchButton = document.getElementById("map-search-button");
    if (mapSearchButton) {
        mapSearchButton.addEventListener("click", geocodeAddress);
    }
}

function geocodeAddress() {
    const address = document.getElementById("map-search-input").value;
    if (!address) return;
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(10);
            placeMarker(location);
            updateFormFields(location);
        } else {
            alert("Não foi possível encontrar o local: " + status);
        }
    });
}

function placeMarker(location) { marker.setPosition(location); }

function updateFormFields(location) {
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
    const latInput = document.getElementById("latitude-input");
    const lonInput = document.getElementById("longitude-input");
    if (latInput && lonInput) {
        latInput.value = lat.toFixed(6);
        lonInput.value = lng.toFixed(6);
    }
}

function renderGridJsTable(columnsConfig, tableData) {
    const wrapper = document.getElementById('table-wrapper');
    if (!wrapper) return;
    if (grid) grid.destroy();
    wrapper.innerHTML = '';
    grid = new gridjs.Grid({
        columns: columnsConfig,
        data: tableData,
        search: true, sort: true,
        pagination: { limit: 10 },
        language: {
            'search': { 'placeholder': '🔍 Pesquisar...' },
            'pagination': { 'previous': 'Anterior', 'next': 'Próxima', 'showing': 'Mostrando', 'results': () => 'Resultados', 'to': 'a', 'of': 'de' }
        }
    }).render(wrapper);
}

function renderApexCharts(seriesData) {
    renderedApexCharts.forEach(chart => chart.destroy());
    renderedApexCharts = [];
    const container = document.getElementById("charts-container-apex");
    if (!container) return;
    container.innerHTML = '';
    container.style.display = 'grid';
    if (!seriesData || seriesData.length === 0) {
        container.style.display = 'none';
        return;
    }
    seriesData.forEach((seriesInfo, index) => {
        const chartId = `apexchart-${index}`;
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-card-apex';
        chartWrapper.innerHTML = `<h4>${seriesInfo.name}</h4><div id="${chartId}"></div>`;
        container.appendChild(chartWrapper);
        const options = {
            chart: { type: 'line', height: 300 }, series: [seriesInfo],
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, format: 'dd MMM', style: { fontSize: '10px' } } },
            yaxis: { labels: { formatter: (v) => (typeof v === 'number' && v % 1 !== 0) ? v.toFixed(2) : v } },
            stroke: { curve: 'smooth', width: 2 },
            tooltip: { x: { format: 'dd/MM/yyyy HH:mm' }, y: { formatter: (v) => (typeof v === 'number' && v % 1 !== 0) ? v.toFixed(2) : v } },
        };
        const chart = new ApexCharts(document.getElementById(chartId), options);
        chart.render();
        renderedApexCharts.push(chart);
    });
}

function displayRealTimeResults(data) {
    const resultsContainer = document.querySelector('.results');
    if (!resultsContainer) return;
    const resultsHtml = `<h2>Condições Atuais em ${data.name}</h2><h3>${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)} | Observado em: ${new Date(data.dt * 1000).toLocaleString('pt-BR')}</h3><div class="real-time-cards-grid"><div class="data-card main-temp"><span class="card-title">Temperatura</span><span class="card-value">${data.main.temp.toFixed(1)} °C</span><span class="card-subtitle">Sensação: ${data.main.feels_like.toFixed(1)} °C</span><span class="card-subtitle">Mín: ${data.main.temp_min.toFixed(1)}°C / Máx: ${data.main.temp_max.toFixed(1)}°C</span></div><div class="data-card"><span class="card-title">Umidade</span><span class="card-value">${data.main.humidity} %</span></div><div class="data-card"><span class="card-title">Vento</span><span class="card-value">${(data.wind.speed * 3.6).toFixed(1)} km/h</span><span class="card-subtitle">Direção: ${data.wind.deg}°</span></div><div class="data-card"><span class="card-title">Pressão</span><span class="card-value">${data.main.pressure} hPa</span></div><div class="data-card"><span class="card-title">Nuvens</span><span class="card-value">${data.clouds.all} %</span></div><div class="data-card"><span class="card-title">Visibilidade</span><span class="card-value">${(data.visibility / 1000).toFixed(1)} km</span></div><div class="data-card small-card"><span class="card-title">Nascer do Sol</span><span class="card-value small-value">${new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR')}</span></div><div class="data-card small-card"><span class="card-title">Pôr do Sol</span><span class="card-value small-value">${new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR')}</span></div></div>`;
    resultsContainer.innerHTML = resultsHtml;
    resultsContainer.style.display = 'block';
}

// =================================================================
// PONTO DE ENTRADA DO JAVASCRIPT
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    const handleFormSubmit = async (e, fetchFunction, isRealTime = false) => {
        e.preventDefault();
        const form = e.target;
        const errorDiv = form.querySelector('.form-error');
        const resultsDiv = document.querySelector('.results');
        errorDiv.style.display = 'none';
        resultsDiv.style.display = 'none';
        
        let params = {};
        if (isRealTime) {
            params = { lat: form.querySelector('#latitude-input').value, lon: form.querySelector('#longitude-input').value };
        } else {
            params = {
                latitude: form.querySelector('#latitude-input').value,
                longitude: form.querySelector('#longitude-input').value,
                start_date: form.querySelector('#start-date-input').value,
                end_date: form.querySelector('#end-date-input').value,
                parameters: Array.from(form.querySelectorAll('input[name="parameters"]:checked')).map(el => el.value).join(',')
            };
            if (!params.parameters) {
                errorDiv.textContent = 'Por favor, selecione pelo menos uma variável climática.';
                errorDiv.style.display = 'block';
                return;
            }
        }
        
        try {
            const data = await fetchFunction(params);
            if (isRealTime) {
                displayRealTimeResults(data);
            } else {
                if (!data.properties || !data.properties.parameter) throw new Error(data.error || 'Estrutura de dados inválida da API da NASA.');
                const apiParams = data.properties.parameter;
                const paramKeys = Object.keys(apiParams);
                const dates = Object.keys(apiParams[paramKeys[0]]);
                const isHourly = dates[0].length > 8;

                const columnsConfig = [{ id: 'dateKey', name: isHourly ? 'Data/Hora' : 'Data' }];
                paramKeys.forEach(key => {
                    const paramInfo = PARAMETER_MAP[key] || { name: key, unitDaily: '', unitHourly: '' };
                    let unit = isHourly ? paramInfo.unitHourly : paramInfo.unitDaily;
                    const title = `${paramInfo.name} (${unit})`;
                    columnsConfig.push({ id: key, name: title });
                });

                const tableData = dates.map(dateStr => {
                    const row = {
                        dateKey: isHourly ?
                            `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)} ${dateStr.substring(8,10)}:00` :
                            `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`
                    };
                    paramKeys.forEach(key => {
                        const value = apiParams[key][dateStr];
                        row[key] = value === -999 ? 'N/A' : value;
                    });
                    return row;
                });
                
                const chartSeries = paramKeys.map(key => {
                    const paramInfo = PARAMETER_MAP[key] || { name: key, unitDaily: '', unitHourly: '' };
                    let unit = isHourly ? paramInfo.unitHourly : paramInfo.unitDaily;
                    const name = `${paramInfo.name} (${unit})`;
                    return {
                        name: name,
                        data: dates.map(dateStr => {
                            const dateObj = isHourly ?
                                new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}T${dateStr.substring(8,10)}:00:00Z`) :
                                new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}T12:00:00Z`);
                            return { x: dateObj.getTime(), y: apiParams[key][dateStr] === -999 ? null : apiParams[key][dateStr] };
                        })
                    }
                });

                renderGridJsTable(columnsConfig, tableData);
                renderApexCharts(chartSeries);
                resultsDiv.style.display = 'block';

                const toggleBtn = document.getElementById('toggle-table-btn');
                const tableContainer = document.getElementById('table-container');
                if (toggleBtn && tableContainer) {
                    toggleBtn.onclick = () => {
                        const isHidden = tableContainer.style.display === 'none';
                        tableContainer.style.display = isHidden ? 'block' : 'none';
                    };
                }
            }
        } catch (error) {
            console.error("Erro na chamada da API:", error);
            errorDiv.textContent = `Erro ao buscar dados: ${error.message}`;
            errorDiv.style.display = 'block';
        }
    };

    const dailyForm = document.getElementById('daily-analysis-form');
    if (dailyForm) dailyForm.addEventListener('submit', (e) => handleFormSubmit(e, fetchNasaPowerDaily));

    const hourlyForm = document.getElementById('hourly-analysis-form');
    if (hourlyForm) hourlyForm.addEventListener('submit', (e) => handleFormSubmit(e, fetchNasaPowerHourly));

    const realTimeForm = document.getElementById('real-time-analysis-form');
    if (realTimeForm) realTimeForm.addEventListener('submit', (e) => handleFormSubmit(e, fetchOpenWeatherRealTime, true));
});

window.initMap = initMap;
