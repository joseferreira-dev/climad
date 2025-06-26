// static/js/main.js (VERSÃO FINAL COM CORREÇÃO PARA DATATABLES E I18N)

// =================================================================
// LÓGICA DO MAPA E FUNÇÕES DE RENDERIZAÇÃO
// =================================================================
let map, marker, geocoder, renderedApexCharts = [];

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

function renderDataTable(tableData, columnsConfig) {
    const tableSelector = '#climate-table';
    if ($.fn.DataTable.isDataTable(tableSelector)) $(tableSelector).DataTable().destroy();
    const tableContainer = $(tableSelector).parent();
    tableContainer.empty().append('<table id="climate-table" class="display compact stripe hover" style="width:100%"></table>');
    
    $(tableSelector).DataTable({
        data: tableData,
        columns: columnsConfig,
        // ========= CORREÇÃO 1: URL do arquivo de tradução do DataTables =========
        language: { url: '//cdn.datatables.net/plug-ins/2.0.8/i18n/pt-BR.json' },
        dom: 'lBfrtip',
        buttons: ['excel', 'csv'],
        scrollX: true
    });
}

function renderApexCharts(seriesData) {
    renderedApexCharts.forEach(chart => chart.destroy());
    renderedApexCharts = [];
    const container = $("#charts-container-apex");
    container.empty().show();
    if (!seriesData || seriesData.length === 0) { container.hide(); return; }
    seriesData.forEach((seriesInfo, index) => {
        const chartId = `apexchart-${index}`;
        container.append(`<div class="chart-card-apex"><h4>${seriesInfo.name}</h4><div id="${chartId}"></div></div>`);
        const options = {
            chart: { type: 'line', height: 300 }, series: [seriesInfo],
            xaxis: {
                type: 'datetime',
                labels: { datetimeUTC: false, format: 'dd MMM', style: { fontSize: '10px' } },
            },
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
    const resultsHtml = `<h2>Condições Atuais em ${data.name}</h2><h3>${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)} | Observado em: ${new Date(data.dt * 1000).toLocaleString('pt-BR')}</h3><div class="real-time-cards-grid"><div class="data-card main-temp"><span class="card-title">Temperatura (°C)</span><span class="card-value">${data.main.temp.toFixed(1)}</span><span class="card-subtitle">Sensação: ${data.main.feels_like.toFixed(1)}°C</span><span class="card-subtitle">Mín: ${data.main.temp_min.toFixed(1)}°C / Máx: ${data.main.temp_max.toFixed(1)}°C</span></div><div class="data-card"><span class="card-title">Umidade (%)</span><span class="card-value">${data.main.humidity}</span></div><div class="data-card"><span class="card-title">Vento (km/h)</span><span class="card-value">${(data.wind.speed * 3.6).toFixed(1)}</span><span class="card-subtitle">Direção: ${data.wind.deg}°</span></div><div class="data-card"><span class="card-title">Pressão (hPa)</span><span class="card-value">${data.main.pressure}</span></div><div class="data-card"><span class="card-title">Nuvens (%)</span><span class="card-value">${data.clouds.all}</span></div><div class="data-card"><span class="card-title">Visibilidade (km)</span><span class="card-value">${(data.visibility / 1000).toFixed(1)}</span></div><div class="data-card small-card"><span class="card-title">Nascer do Sol</span><span class="card-value small-value">${new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR')}</span></div><div class="data-card small-card"><span class="card-title">Pôr do Sol</span><span class="card-value small-value">${new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR')}</span></div></div>`;
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
            params = {
                lat: form.querySelector('#latitude-input').value,
                lon: form.querySelector('#longitude-input').value
            };
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
                const renameMap = data.parameters;
                const dates = Object.keys(apiParams[paramKeys[0]]);
                const isHourly = dates[0].length > 8;

                const columnsConfig = [{
                    data: 'dateKey',
                    title: isHourly ? 'Data/Hora' : 'Data'
                }];

                paramKeys.forEach(key => {
                    columnsConfig.push({
                        data: key,
                        // ========= CORREÇÃO 2: 'longname' em vez de 'long_name' =========
                        title: renameMap[key].longname 
                    });
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
                
                const chartSeries = paramKeys.map(key => ({
                    name: renameMap[key].longname, // << Também corrigido aqui para a legenda do gráfico
                    data: dates.map(dateStr => {
                        const dateObj = isHourly ?
                            new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}T${dateStr.substring(8,10)}:00:00Z`) :
                            new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}T12:00:00Z`);
                        return { x: dateObj.getTime(), y: apiParams[key][dateStr] === -999 ? null : apiParams[key][dateStr] };
                    })
                }));

                renderDataTable(tableData, columnsConfig);
                renderApexCharts(chartSeries);
                resultsDiv.style.display = 'block';
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