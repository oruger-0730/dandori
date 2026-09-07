const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function readTasks(){
  try{
    const text = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(text);
  }catch(err){
    if(err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeTasks(tasks){
  const tmpFile = DATA_FILE + '.tmp';
  await fs.writeFile(tmpFile, JSON.stringify(tasks, null, 2), 'utf-8');
  await fs.rename(tmpFile, DATA_FILE);
}

app.get('/api/tasks', async (req, res) => {
  try{
    const tasks = await readTasks();
    res.json(tasks);
  }catch(err){
    console.error('タスクの読み込みに失敗しました', err);
    res.status(500).json({ error: 'load_failed' });
  }
});

app.post('/api/tasks', async (req, res) => {
  if(!Array.isArray(req.body)){
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  try{
    await writeTasks(req.body);
    res.json({ ok: true });
  }catch(err){
    console.error('タスクの保存に失敗しました', err);
    res.status(500).json({ error: 'save_failed' });
  }
});

app.listen(PORT, () => {
  console.log('だんどり サーバー起動: http://localhost:' + PORT);
});
