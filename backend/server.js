const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// ==================== HEARTBEAT ====================
let lastHeartbeat = Date.now();
const HEARTBEAT_TIMEOUT = 10000; // 10 segundos sem heartbeat = encerra

function checkHeartbeat() {
    if (Date.now() - lastHeartbeat > HEARTBEAT_TIMEOUT) {
        console.log('');
        console.log('========================================');
        console.log('  Pagina fechada - Encerrando servidor');
        console.log('========================================');
        console.log('');
        process.exit(0);
    }
}

// Verifica heartbeat a cada 5 segundos
setInterval(checkHeartbeat, 5000);

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Função para ler dados
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = {
                afazeres: [],
                checklist: [],
                checkStatus: [],
                metas: [],
                financeiro: [],
                notas: [],
                gastosFixos: [],
                investimentos: []
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        // Garantir que campos novos existam
        if (!data.notas) data.notas = [];
        if (!data.gastosFixos) data.gastosFixos = [];
        if (!data.investimentos) data.investimentos = [];
        return data;
    } catch (error) {
        console.error('Erro ao ler dados:', error);
        return { afazeres: [], checklist: [], checkStatus: [], metas: [], financeiro: [], notas: [], gastosFixos: [], investimentos: [] };
    }
}

// Função para salvar dados
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

// ==================== ROTAS API ====================

// Heartbeat - frontend manda a cada 5 segundos
app.get('/api/heartbeat', (req, res) => {
    lastHeartbeat = Date.now();
    res.json({ ok: true });
});

// Rota raiz - serve o index.html
app.get('/', (req, res) => {
    lastHeartbeat = Date.now(); // Reset ao abrir página
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// GET todos os dados
app.get('/api/data', (req, res) => {
    lastHeartbeat = Date.now();
    const data = readData();
    res.json(data);
});

// POST salvar todos os dados
app.post('/api/data', (req, res) => {
    lastHeartbeat = Date.now();
    const success = saveData(req.body);
    if (success) {
        res.json({ success: true, message: 'Dados salvos com sucesso!' });
    } else {
        res.status(500).json({ success: false, message: 'Erro ao salvar dados' });
    }
});

// ==================== AFAZERES ====================

app.get('/api/afazeres', (req, res) => {
    const data = readData();
    res.json(data.afazeres || []);
});

app.post('/api/afazeres', (req, res) => {
    const data = readData();
    data.afazeres.push(req.body);
    saveData(data);
    res.json({ success: true, data: req.body });
});

app.put('/api/afazeres/:id', (req, res) => {
    const data = readData();
    const index = data.afazeres.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
        data.afazeres[index] = { ...data.afazeres[index], ...req.body };
        saveData(data);
        res.json({ success: true, data: data.afazeres[index] });
    } else {
        res.status(404).json({ success: false, message: 'Não encontrado' });
    }
});

app.delete('/api/afazeres/:id', (req, res) => {
    const data = readData();
    data.afazeres = data.afazeres.filter(a => a.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
});

// ==================== CHECKLIST ====================

app.get('/api/checklist', (req, res) => {
    const data = readData();
    res.json(data.checklist || []);
});

app.post('/api/checklist', (req, res) => {
    const data = readData();
    data.checklist.push(req.body);
    saveData(data);
    res.json({ success: true, data: req.body });
});

app.put('/api/checklist/:id', (req, res) => {
    const data = readData();
    const index = data.checklist.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        data.checklist[index] = { ...data.checklist[index], ...req.body };
        saveData(data);
        res.json({ success: true, data: data.checklist[index] });
    } else {
        res.status(404).json({ success: false, message: 'Não encontrado' });
    }
});

app.delete('/api/checklist/:id', (req, res) => {
    const data = readData();
    data.checklist = data.checklist.filter(c => c.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
});

// ==================== CHECK STATUS ====================

app.get('/api/checkstatus', (req, res) => {
    const data = readData();
    res.json(data.checkStatus || []);
});

app.post('/api/checkstatus', (req, res) => {
    const data = readData();
    data.checkStatus.push(req.body);
    saveData(data);
    res.json({ success: true, data: req.body });
});

app.delete('/api/checkstatus/:key', (req, res) => {
    const data = readData();
    data.checkStatus = data.checkStatus.filter(s => s.key !== req.params.key);
    saveData(data);
    res.json({ success: true });
});

// ==================== METAS ====================

app.get('/api/metas', (req, res) => {
    const data = readData();
    res.json(data.metas || []);
});

app.post('/api/metas', (req, res) => {
    const data = readData();
    data.metas.push(req.body);
    saveData(data);
    res.json({ success: true, data: req.body });
});

app.put('/api/metas/:id', (req, res) => {
    const data = readData();
    const index = data.metas.findIndex(m => m.id === req.params.id);
    if (index !== -1) {
        data.metas[index] = { ...data.metas[index], ...req.body };
        saveData(data);
        res.json({ success: true, data: data.metas[index] });
    } else {
        res.status(404).json({ success: false, message: 'Não encontrado' });
    }
});

app.delete('/api/metas/:id', (req, res) => {
    const data = readData();
    data.metas = data.metas.filter(m => m.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
});

// ==================== FINANCEIRO ====================

app.get('/api/financeiro', (req, res) => {
    const data = readData();
    res.json(data.financeiro || []);
});

app.post('/api/financeiro', (req, res) => {
    const data = readData();
    data.financeiro.push(req.body);
    saveData(data);
    res.json({ success: true, data: req.body });
});

app.delete('/api/financeiro/:id', (req, res) => {
    const data = readData();
    data.financeiro = data.financeiro.filter(f => f.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
});

// ==================== BACKUP/EXPORT ====================

app.get('/api/backup', (req, res) => {
    const data = readData();
    res.setHeader('Content-Disposition', `attachment; filename=hub-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json(data);
});

app.post('/api/restore', (req, res) => {
    const success = saveData(req.body);
    if (success) {
        res.json({ success: true, message: 'Backup restaurado com sucesso!' });
    } else {
        res.status(500).json({ success: false, message: 'Erro ao restaurar backup' });
    }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('========================================');
    console.log('      HUB PESSOAL RODANDO!');
    console.log('========================================');
    console.log('');
    console.log('Acesse no navegador:');
    console.log('  http://localhost:' + PORT);
    console.log('');
    console.log('Dados salvos em: ' + DATA_FILE);
    console.log('');
    console.log('Para acessar do CELULAR (mesma wifi):');
    console.log('  Descubra seu IP: ipconfig (no CMD)');
    console.log('  Acesse: http://SEU_IP:3000');
    console.log('');
    console.log('----------------------------------------');
    console.log('  Feche a aba do navegador para encerrar');
    console.log('  Ou pressione Ctrl+C');
    console.log('----------------------------------------');
    console.log('');
});
