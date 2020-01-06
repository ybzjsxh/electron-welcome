const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

app.use(bodyParser.json({ limit: '50mb' }));

app.use('/', express.static(path.join(__dirname, 'public')));

router.post('/update', (req, res, next) => {
  const { content, fontSize = 160, color = '#000' } = req.body;
  let config = fs.readFileSync(
    path.join(__dirname, '../resources/app.asar.unpacked/config.json'),
    'utf8',
  );
  let new_config = {}
  if (!!content) {
    new_config = { ...JSON.parse(config), content, fontSize, fontColor: color };
  } else {
    new_config = { ...JSON.parse(config), fontSize, fontColor: color};
  }
  fs.writeFile(
    path.join(__dirname, '../resources/app.asar.unpacked/config.json'),
    JSON.stringify(new_config),
    err => {
      if (!err) {
        console.log('update success');
        res.json({ code: 0, msg: 'ok', data: { content, fontSize, color } });
      } else {
        res.json({ code: -1, msg: err.msg });
      }
    },
  );
});

router.post(
  '/upload',
  multer({
    storage: multer.diskStorage({
      destination: 'upload_tmp/',
      filename: function(req, file, cb) {
        cb(null, '06.png');
      },
    }),
  }).any(),
  (req, res) => {
    if (req.files.length === 0) {
      res.json({ code: -1, msg: '请选择文件上传' });
      return;
    }
    let file = req.files[0];
    spawn('cp', [
      '-r',
      'upload_tmp/06.png',
      path.join(__dirname, '../resources/app.asar.unpacked/static/images/'),
    ]);
    res.json({ code: 0, data: { file: file.filename, msg: '上传成功!' } });
  },
);

router.post('/restart', (req, res) => {
  try {
    fs.readFile(path.join(__dirname, './pid.txt'), 'utf8', (err, pid) => {
      console.log('current pid: ', pid);
      spawnSync('taskkill', ['/pid', `${pid}`, '-t', '-f']);
    });
    console.log('restarting app');
    spawn(path.join(__dirname, '../welcomeconfig.exe'), {
      cwd: path.join(__dirname, '../'),
    });
    res.json({ code: 0, msg: 'ok' });
  } catch (err) {
    console.log(err);
    res.json({ code: -1, msg: 'error' });
  }
});

app.use('/api', router);

app.listen(port, () => {
  console.log(chalk.blue(`listening on http://127.0.0.1:${port}`));
});
