/**
 * Archivo barril principal - Exporta todos los módulos del sistema
 */

// Configuración
export { CONFIG } from "./config.js";

// Servicios
export { DataService } from "./services/dataService.js";

// Core
export { RulesEngine } from "./core/rulesEngine.js";
export { SolutionEvaluator } from "./core/solutionEvaluator.js";

// UI
export { FormGenerator } from "./ui/formGenerator.js";
export { ResultsRenderer } from "./ui/resultsRenderer.js";
export { ThemeManager } from "./ui/themeManager.js";

// Utilidades
export { InputValidator } from "./utils/inputValidator.js";
export { DebugUtils } from "./utils/debugUtils.js";

// Aplicación principal
export { SistemaSeleccionSoluciones, sistema, inicializarSistema } from "./app.js";
