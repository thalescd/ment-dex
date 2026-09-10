// Ponto de entrada da aplicacao.
//
// Nao e preciso listar os modulos aqui: em ES modules o proprio grafo de
// imports define a ordem de avaliacao — se A importa B, o corpo de B roda
// antes do de A. Importar eventListeners.js ja arrasta todo o resto.
//
// eventListeners.js registra os handlers no momento do import (efeito
// colateral). O carregamento dos dados fica explicito aqui, e nao escondido
// na ultima linha dele.
import "./utils/eventListeners.js";
import { fetchData } from "./utils/app.js";

fetchData(new URLSearchParams(window.location.search));
