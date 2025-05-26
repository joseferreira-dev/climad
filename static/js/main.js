let map;
let marker;
let geocoder;
let renderedApexCharts = []; // Para guardar referências aos gráficos ApexCharts

function initMap() {
    const initialCoords = { lat: -8.047562, lng: -34.877064 }; // Recife
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialCoords,
        zoom: 7,
    });
    geocoder = new google.maps.Geocoder();
    map.addListener("click", (event) => {
        placeMarker(event.latLng);
        updateFormFields(event.latLng);
    });
    if (document.getElementById("map-search-button")) {
        document.getElementById("map-search-button").addEventListener("click", () => {
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

function renderApexCharts() {
    console.log("renderApexCharts() chamada");
    const dataScript = document.getElementById("apex-chart-data-script");

    // Limpa gráficos anteriores
    renderedApexCharts.forEach(chart => chart.destroy());
    renderedApexCharts = [];
    // Limpa o conteúdo HTML dos cards, caso existam de uma renderização anterior com erro
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

    $("#charts-container-apex").show(); // Mostra o contentor de gráficos

    seriesDataForCharts.forEach((seriesInfo, index) => {
        const chartElementId = "apexchart-" + (index + 1); // ID simples baseado no índice
        const chartElement = document.getElementById(chartElementId);

        if (chartElement) {
            const options = {
                chart: {
                    type: 'line',
                    height: 300, // Altura fixa para cada gráfico
                    animations: {
                        enabled: true, // Animações suaves
                        easing: 'easeinout',
                        speed: 800,
                    },
                    toolbar: { // Permite exportar, zoom, etc.
                        show: true 
                    }
                },
                series: [{ // ApexCharts espera um array de séries
                    name: seriesInfo.name,
                    data: seriesInfo.data // seriesInfo.data já é [{x: 'DD/MM/AAAA', y: valor}, ...]
                }],
                xaxis: {
                    type: 'category', // Nossas datas DD/MM/AAAA são categorias
                    labels: {
                        rotate: -45,
                        rotateAlways: false,
                        hideOverlappingLabels: true,
                        trim: true,
                        style: {
                            fontSize: '10px'
                        }
                    },
                    tooltip: {
                        enabled: false // Evita tooltip no eixo X se for muito denso
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '10px'
                        },
                        formatter: function (value) {
                           // Arredonda para 2 casas decimais se for float, senão mantém
                           return (typeof value === 'number' && value % 1 !== 0) ? value.toFixed(2) : value;
                        }
                    }
                },
                stroke: {
                    curve: 'smooth', // Linhas suavizadas
                    width: 2
                },
                tooltip: {
                    x: {
                        format: 'dd/MM/yyyy' // Formato da data no tooltip
                    },
                    y: {
                         formatter: function (value) {
                           return (typeof value === 'number' && value % 1 !== 0) ? value.toFixed(2) : value;
                        }
                    }
                },
                noData: { // Mensagem se a série não tiver dados (após filtrar -999)
                    text: "Sem dados para exibir neste período",
                    align: 'center',
                    verticalAlign: 'middle',
                    offsetX: 0,
                    offsetY: 0,
                    style: {
                        color: undefined,
                        fontSize: '14px',
                        fontFamily: undefined
                    }
                }
            };

            const chart = new ApexCharts(chartElement, options);
            chart.render();
            renderedApexCharts.push(chart); // Guarda a referência para destruir depois
        } else {
            console.warn("Elemento do gráfico não encontrado:", chartElementId);
        }
    });
}

$(document).ready(function() {
    // Inicializa o DataTables se a tabela existir
    if ($('#climate-table').length) {
        $('#climate-table').DataTable({
            lengthMenu: [10, 20, 50, 100],
            language: { // Traduções do DataTables
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
            }
        });
    }

    const dataScript = document.getElementById("apex-chart-data-script");
    if (dataScript && dataScript.textContent.trim() !== "") {
        renderApexCharts();
    } else {
         $('#charts-container-apex').hide(); 
    }
});