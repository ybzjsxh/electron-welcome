const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { spawn, exec, execSync, spawnSync } = require('child_process');
// const router = express.Router()

const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')));

router.post('/update', (req, res, next) => {
  const { content, fontSize = 160 } = req.body;
  // TODO 路径问题
  let config = fs.readFileSync('../resouces/config.json', 'utf8');
  let new_config = { ...JSON.parse(config), content, fontSize };
  // TODO 路径问题
  fs.writeFile('../config.json', JSON.stringify(new_config), err => {
    if (!err) {
      console.log('update success');
      res.json({ code: 0, msg: 'ok', content });
    } else {
      res.json({ code: -1, msg: err.msg });
    }
  });
});

router.post('/restart', (req, res) => {
  let pid = fs.readFileSync('../pid.txt');
  exec(`sudo kill -9 ${pid}`, err => {
    if (!err) {
      console.log('ss');
    } else {
      console.log(err);
    }
  });
  setTimeout(() => {
    // TODO: 重启问题
    spawn('yarn', ['start'], { cwd: path.join(__dirname, '../') });
    res.json({ code: 0, msg: 'ok' });
  }, 2000);
});

app.use('/api', router);

app.listen(port, () => {
  console.log(chalk.blue(`listening on http://127.0.0.1:${port}`));
});
