// static/js/main.js

// Variáveis globais para o Google Maps
let map;
let marker;
let geocoder;

// Para guardar referências aos gráficos ApexCharts e destruí-los se necessário
let renderedApexCharts = []; 

// Função de inicialização do Google Maps (chamada pelo script da API no HTML)
function initMap() {
    const initialCoords = { lat: -8.047562, lng: -34.877064 }; // Coordenadas de Recife como padrão
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialCoords,
        zoom: 7,
    });
    
    geocoder = new google.maps.Geocoder();

    map.addListener("click", (event) => {
        placeMarker(event.latLng);
        updateFormFields(event.latLng);
    });

    const mapSearchButton = document.getElementById("map-search-button");
    if (mapSearchButton) {
        mapSearchButton.addEventListener("click", () => {
            geocodeAddress();
        });
    }
}

function geocodeAddress() {
    const address = document.getElementById("map-search-input").value;
    if (!address) return;
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
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

function placeMarker(location) {
    if (marker) {
        marker.setPosition(location);
    } else {
        marker = new google.maps.Marker({ position: location, map: map });
    }
}

function updateFormFields(location) {
    if (location && typeof location.lat === 'function' && typeof location.lng === 'function') {
        document.getElementById("latitude-input").value = location.lat().toFixed(6);
        document.getElementById("longitude-input").value = location.lng().toFixed(6);
    }
}

// Função para renderizar os gráficos ApexCharts
function renderApexCharts() {
    console.log("renderApexCharts() chamada");
    const dataScript = document.getElementById("apex-chart-data-script");

    // Limpa gráficos anteriores
    renderedApexCharts.forEach(chart => chart.destroy());
    renderedApexCharts = [];
    $(".chart-card-apex div[id^='apexchart-']").empty();


    if (!dataScript || !dataScript.textContent.trim()) {
        console.warn("Script de dados para ApexCharts não encontrado ou vazio.");
        $("#charts-container-apex").hide();
        return;
    }

    let seriesDataForCharts;
    try {
        seriesDataForCharts = JSON.parse(dataScript.textContent);
        console.log("Dados para ApexCharts parseados:", seriesDataForCharts);
    } catch (e) {
        console.error("Erro ao fazer parse dos dados JSON para ApexCharts:", e, "Conteúdo:", dataScript.textContent);
        $("#charts-container-apex").hide();
        return;
    }

    if (!Array.isArray(seriesDataForCharts) || seriesDataForCharts.length === 0) {
        console.warn("Nenhum dataset encontrado para ApexCharts.");
        $("#charts-container-apex").hide();
        return;
    }

    $("#charts-container-apex").show(); 

    seriesDataForCharts.forEach((seriesInfo, index) => {
        const chartElementId = "apexchart-" + (index + 1); 
        const chartElement = document.getElementById(chartElementId);

        if (chartElement) {
            const options = {
                chart: {
                    type: 'line',
                    height: 300, 
                    animations: { enabled: true, easing: 'easeinout', speed: 800 },
                    toolbar: { show: true }
                },
                series: [{
                    name: seriesInfo.name,
                    data: seriesInfo.data 
                }],
                xaxis: {
                    type: 'category', 
                    labels: {
                        rotate: -45, rotateAlways: false, hideOverlappingLabels: true,
                        trim: true, style: { fontSize: '10px' }
                    },
                    tooltip: { enabled: false }
                },
                yaxis: {
                    labels: {
                        style: { fontSize: '10px' },
                        formatter: function (value) {
                           return (typeof value === 'number' && value % 1 !== 0) ? value.toFixed(2) : value;
                        }
                    }
                },
                stroke: { curve: 'smooth', width: 2 },
                tooltip: {
                    x: { format: 'dd/MM/yyyy' },
                    y: {
                         formatter: function (value) {
                           return (typeof value === 'number' && value % 1 !== 0) ? value.toFixed(2) : value;
                        }
                    }
                },
                noData: { text: "Sem dados para exibir neste período" }
            };

            const chart = new ApexCharts(chartElement, options);
            chart.render();
            renderedApexCharts.push(chart); 
        } else {
            console.warn("Elemento do gráfico não encontrado:", chartElementId);
        }
    });
}


// Código executado quando o documento HTML está completamente carregado
$(document).ready(function() {
    // Inicializa o DataTables se a tabela com ID 'climate-table' existir na página
    if ($('#climate-table').length) {
        $('#climate-table').DataTable({
            lengthMenu: [10, 20, 50, 100], 
            language: { // Traduções para o português do Brasil
                "sEmptyTable": "Nenhum registo encontrado",
                "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registos",
                "sInfoEmpty": "Mostrando 0 até 0 de 0 registos",
                "sInfoFiltered": "(Filtrados de _MAX_ registos)",
                "sInfoPostFix": "",
                "sInfoThousands": ".",
                "sLengthMenu": "_MENU_ resultados por página",
                "sLoadingRecords": "Carregando...",
                "sProcessing": "Processando...",
                "sZeroRecords": "Nenhum registo encontrado",
                "sSearch": "Pesquisar:",
                "oPaginate": {
                    "sNext": "Próximo",
                    "sPrevious": "Anterior",
                    "sFirst": "Primeiro",
                    "sLast": "Último"
                },
                "oAria": {
                    "sSortAscending": ": Ordenar colunas de forma ascendente",
                    "sSortDescending": ": Ordenar colunas de forma descendente"
                }
            },
            // Configuração para adicionar os botões de exportação
            dom: 'lBfrtip', 
            buttons: [
                {
                    extend: 'excelHtml5', text: 'Excel', titleAttr: 'Exportar para Excel',
                    className: 'dt-button buttons-excel buttons-html5'
                },
                {
                    extend: 'csvHtml5', text: 'CSV', titleAttr: 'Exportar para CSV',
                    className: 'dt-button buttons-csv buttons-html5'
                },
                {
                    text: 'JSON (copiar)', titleAttr: 'Copiar dados em formato JSON',
                    className: 'dt-button buttons-json buttons-html5',
                    action: function ( e, dt, button, config ) {
                        var data = dt.buttons.exportData();
                        var jsonData = data.body.map(row => {
                            let obj = {};
                            data.header.forEach((header, i) => { obj[header] = row[i]; });
                            return obj;
                        });
                        var jsonOutput = JSON.stringify(jsonData, null, 2);
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(jsonOutput).then(function() {
                                alert('Dados JSON copiados para a área de transferência!');
                            }, function(err) {
                                alert('Erro ao copiar dados JSON. Tente manualmente.');
                                console.error('Erro ao copiar JSON: ', err);
                            });
                        } else {
                            alert('Não foi possível copiar automaticamente. Por favor, copie o JSON da consola do navegador.');
                            console.log("Dados JSON para cópia manual:\n", jsonOutput);
                        }
                    }
                }
            ]
        });
    }

    // Renderiza os gráficos ApexCharts se o script de dados existir e tiver conteúdo
    const dataScript = document.getElementById("apex-chart-data-script");
    if (dataScript && dataScript.textContent.trim() !== "") {
        renderApexCharts();
    } else {
         $('#charts-container-apex').hide(); 
    }
});