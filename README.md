# Climad: Plataforma de Análise Climática Inteligente

Climad é uma aplicação web robusta, desenvolvida com Python e Django, que serve como uma central para coleta, visualização e análise de dados climáticos. A plataforma integra-se com APIs de fontes renomadas como NASA POWER e OpenWeatherMap para fornecer dados históricos e em tempo real. Os usuários podem selecionar localizações geográficas através de um mapa interativo, escolher períodos de tempo e especificar as variáveis climáticas de interesse. Os dados resultantes são exibidos de forma clara em tabelas interativas e gráficos dinâmicos, tornando a ferramenta ideal para pesquisa, agricultura e planejamento.

## 🌟 Funcionalidades Principais

  * **Três Modos de Análise:**
      * **Dados em Tempo Real:** Obtém as condições meteorológicas atuais para qualquer local do globo usando a API da OpenWeatherMap.
      * **Análise de Dados Diários:** Consulta dados históricos diários da API NASA POWER para um intervalo de datas selecionado.
      * **Análise de Dados Horários:** Consulta dados históricos horários da API NASA POWER para uma análise mais granular.
  * **Seleção de Localização Interativa:**
      * Interface de mapa (Google Maps) para selecionar coordenadas com um clique.
      * Funcionalidade de geocodificação para pesquisar locais por endereço ou nome.
      * Entrada manual de latitude e longitude.
  * **Ampla Seleção de Variáveis:** Formulários completos que permitem ao usuário selecionar múltiplas variáveis climáticas para análise, como temperatura, precipitação, umidade, velocidade do vento, radiação solar e muitas outras.
  * **Visualização de Dados Avançada:**
      * **Tabelas Interativas:** Os dados são apresentados em tabelas dinâmicas com Grid.js, que oferecem pesquisa, paginação e ordenação.
      * **Gráficos Dinâmicos:** Geração automática de gráficos de linha para cada variável climática selecionada utilizando a biblioteca ApexCharts.
      * **Cards de Dados em Tempo Real:** Exibição clara e moderna das condições atuais, como temperatura, sensação térmica, umidade, vento, etc..
  * **Dicionário de Dados Integrado:** Uma página dedicada que explica cada parâmetro climático disponível, incluindo seu código de API, descrição e unidades, carregado a partir de um arquivo JSON local.
  * **Backend Robusto e Escalável:**
      * Construído com Django e Django Rest Framework para criar endpoints de API eficientes que intermediam a comunicação entre o frontend e as APIs externas.
      * Validação de dados de entrada nas requisições de API através de serializers, garantindo a integridade dos parâmetros enviados às fontes externas.
  * **Design Moderno e Responsivo:** Interface de usuário limpa, intuitiva e adaptável a diferentes tamanhos de tela, com uma barra de navegação lateral para fácil acesso a todas as ferramentas.

## 🛠️ Tecnologias Utilizadas

| Categoria      | Tecnologia/Biblioteca                                                                 |
| :------------- | :------------------------------------------------------------------------------------ |
| **Backend** | Python, Django, Django Rest Framework                                   |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+)                                                        |
| **Bibliotecas JS** | ApexCharts (Gráficos), Grid.js (Tabelas Interativas)                    |
| **APIs Externas**| Google Maps API (Maps, Places, Geocoding), NASA POWER, OpenWeatherMap |
| **Banco de Dados** | SQLite (padrão do Django para desenvolvimento)                        |
| **Dependências Python**| `requests`, `python-decouple`, `pandas`, `numpy`                    |

## 📂 Estrutura do Projeto

```
climad/
├── api/                         # App Django para a API REST
│   ├── serializers.py           # Validação dos dados para as APIs externas
│   ├── urls.py                  # URLs dos endpoints da API (/api/...)
│   └── views.py                 # Lógica que busca dados da NASA e OpenWeather
├── core/                        # App Django principal para as páginas
│   ├── templates/               # Arquivos HTML (páginas da aplicação)
│   ├── urls.py                  # URLs das páginas (/, /diaria, /horaria, etc.)
│   └── views.py                 # Lógica de renderização das páginas
├── climad/                      # Configurações do projeto Django
│   ├── settings.py              # Configurações, chaves de API, apps instalados
│   └── urls.py                  # URLs raiz do projeto
├── static/                      # Arquivos estáticos
│   ├── css/style.css            # Estilização da aplicação
│   ├── js/                      # Lógica do frontend
│   │   ├── main.js              # Manipulação do DOM, mapa, gráficos e tabelas
│   │   └── api_client.js        # Funções para chamar a API interna do Climad
│   └── data/
│       └── data_dictionary.json # Descrição dos parâmetros climáticos
├── .env.example                 # Exemplo de arquivo para variáveis de ambiente
├── manage.py                    # Utilitário de linha de comando do Django
└── requirements.txt             # Lista de dependências Python
```

## ⚙️ Configuração e Instalação

Siga os passos abaixo para configurar e executar o projeto no seu ambiente local.

**1. Pré-requisitos**

  * Python (versão 3.10 ou superior)
  * PIP (gerenciador de pacotes do Python)
  * Git

**2. Clonar o Repositório**

```bash
git clone https://github.com/joseferreira-dev/climad.git
cd climad
```

**3. Criar e Ativar um Ambiente Virtual**
É altamente recomendado usar um ambiente virtual para isolar as dependências do projeto.

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

**4. Instalar as Dependências**
Com o ambiente virtual ativo, instale todas as dependências listadas no `requirements.txt`.

```bash
pip install -r requirements.txt
```

**5. Configurar as Variáveis de Ambiente**
Este projeto precisa de chaves de API para funcionar.

  * **Obtenha as Chaves de API:**

    1.  **Google Maps API:** Acesse o [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative as APIs `Maps JavaScript API` e `Geocoding API`. Gere uma chave de API.
    2.  **OpenWeatherMap API:** Crie uma conta no [OpenWeatherMap](https://openweathermap.org/) e obtenha sua chave de API.
    3.  **Django Secret Key:** Gere uma chave secreta aleatória. Você pode usar um gerador online ou o próprio Django.

  * **Crie o arquivo `.env`:**
    Na raiz do projeto (mesma pasta que `manage.py`), crie um arquivo chamado `.env` e adicione as chaves obtidas:

    ```env
    # Adicione a chave secreta do Django. Exemplo:
    SECRET_KEY='django-insecure-your-random-secret-key-here'

    # Adicione a sua chave de API do Google Maps
    MAPS_API_KEY='SUA_CHAVE_DE_API_DO_Maps'

    # Adicione a sua chave de API do OpenWeatherMap
    OPENWEATHER_API_KEY='SUA_CHAVE_DE_API_DO_OPENWEATHERMAP'
    ```

  * **Adicione `.env` ao `.gitignore`:**
    Certifique-se de que o arquivo `.gitignore` contém a linha `.env` para que suas chaves secretas não sejam enviadas para o repositório.

**6. Aplicar as Migrações do Django**
Para configurar o banco de dados inicial do Django:

```bash
python manage.py migrate
```

## 🚀 Executando a Aplicação

1.  Com o ambiente virtual ativo, inicie o servidor de desenvolvimento do Django:
    ```bash
    python manage.py runserver
    ```
2.  Abra o seu navegador e acesse: `http://127.0.0.1:8000/`

A aplicação Climad deverá estar funcionando\!

## 🔮 Futuro do Projeto

  * Integração de mais fontes de dados climáticos (ex: NOAA, ECMWF, INMET).
  * Implementação de funcionalidades de Machine Learning para análise preditiva.
  * Desenvolvimento de novas ferramentas de visualização, como mapas de calor.
  * Criação de um sistema de contas de usuário para salvar análises e locais favoritos.
