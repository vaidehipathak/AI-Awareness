const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m"
};

function log(msg, color = colors.reset) {
    console.log(`${color}[DevManager] ${msg}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd(), ignoreError = false) {
    try {
        execSync(command, { cwd, stdio: 'inherit' });
        return true;
    } catch (e) {
        if (!ignoreError) {
            log(`Command failed: ${command}`, colors.red);
            process.exit(1);
        }
        return false;
    }
}

function checkOllama() {
    log("Checking Ollama...", colors.cyan);
    try {
        execSync('ollama --version', { stdio: 'ignore' });
        log("Ollama is installed.", colors.green);
    } catch (e) {
        log("WARNING: Ollama is not found in PATH!", colors.yellow);
        log("Please install Ollama from https://ollama.com/", colors.yellow);
        log("Continuing without Ollama check (it might fail to start)...", colors.yellow);
    }
}

function checkRootDeps() {
    log("Checking Root Dependencies...", colors.cyan);
    if (!fs.existsSync(path.join(__dirname, '../node_modules/concurrently'))) {
        log("'concurrently' missing. Installing...", colors.yellow);
        runCommand('npm install concurrently');
    } else {
        log("Root dependencies OK.", colors.green);
    }
}

function checkFrontendDeps() {
    log("Checking Frontend Dependencies...", colors.cyan);
    const frontendPath = path.join(__dirname, '../frontend');
    if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
        log("Frontend 'node_modules' missing. Installing...", colors.yellow);
        runCommand('npm install', frontendPath);
    } else {
        log("Frontend dependencies OK.", colors.green);
    }
}

function checkBackendDeps() {
    log("Checking Backend Dependencies...", colors.cyan);
    // rigorous check: try importing a key package
    try {
        execSync('python -c "import django"', { stdio: 'ignore' });
        log("Backend dependencies appear installed (Django found).", colors.green);
    } catch (e) {
        log("Backend dependencies missing or venv not active. Installing...", colors.yellow);
        runCommand('pip install -r backend/requirements.txt', path.join(__dirname, '../'));
    }
}

function isOllamaRunning() {
    try {
        // Windows-specific check for port 11434
        // 'findstr' returns exit code 1 if not found, which triggers catch block
        const output = execSync('netstat -ano | findstr :11434', { stdio: 'pipe' }).toString();
        return output.includes('LISTENING');
    } catch (e) {
        return false;
    }
}

function startDev() {
    log("Preparing Development Stack...", colors.bright);

    const ollamaActive = isOllamaRunning();
    let cmd;

    if (ollamaActive) {
        log("Ollama is already running (Port 11434 active). Skipping launch.", colors.green);
        // Only run Frontend and Backend
        cmd = `npx concurrently --names "FRONTEND,BACKEND" --prefix-colors "blue,green" "npm run dev:frontend" "npm run dev:backend"`;
    } else {
        log("Ollama not active. Launching full stack...", colors.yellow);
        // Run all three
        cmd = `npx concurrently --names "FRONTEND,BACKEND,OLLAMA" --prefix-colors "blue,green,yellow" "npm run dev:frontend" "npm run dev:backend" "npm run dev:ollama"`;
    }

    log("Executing: " + cmd, colors.cyan);
    runCommand(cmd);
}

// Main Execution Flow
console.log(colors.bright + "=== AI Awareness Dev Manager ===" + colors.reset);
checkOllama();
checkRootDeps();
checkFrontendDeps();
checkBackendDeps();
startDev();
