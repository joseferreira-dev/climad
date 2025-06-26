// static/js/api_client.js
async function fetchNasaPowerDaily(params) {
    const apiUrl = new URL('/api/nasa-power/daily/', window.location.origin);
    Object.keys(params).forEach(key => apiUrl.searchParams.append(key, params[key]));

    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
    }
    return response.json();
}

async function fetchNasaPowerHourly(params) {
    const apiUrl = new URL('/api/nasa-power/hourly/', window.location.origin);
    Object.keys(params).forEach(key => apiUrl.searchParams.append(key, params[key]));

    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
    }
    return response.json();
}

async function fetchOpenWeatherRealTime(params) {
    const apiUrl = new URL('/api/open-weather/real-time/', window.location.origin);
    Object.keys(params).forEach(key => apiUrl.searchParams.append(key, params[key]));

    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
    }
    return response.json();
}