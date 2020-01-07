const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const { net, err } = require('./logger');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const port = process.env.PORT || 3001;

let platform = os.platform();

app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));

app.use(bodyParser.json({ limit: '10mb' }));

app.use('/', express.static(path.join(__dirname, 'public')));

router.post('/update', (req, res, next) => {
  const { content, fontSize = 160, color = '#000' } = req.body;
  let config = fs.readFileSync(
    path.join(__dirname, '../resources/app.asar.unpacked/config.json'),
    'utf8',
  );
  let new_config = {};
  if (!!content) {
    new_config = { ...JSON.parse(config), content, fontSize, fontColor: color };
  } else {
    new_config = { ...JSON.parse(config), fontSize, fontColor: color };
  }
  fs.writeFile(
    path.join(__dirname, '../resources/app.asar.unpacked/config.json'),
    JSON.stringify(new_config),
    error => {
      if (!error) {
        console.log('update success');
        net.info(`update config: ${content} ${fontSize} ${color}`);
        res.json({ code: 0, msg: 'ok', data: { content, fontSize, color } });
      } else {
        err.error(`update error: ${error}`);
        res.json({ code: -1, msg: error.msg });
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
    net.info(`上传文件成功：${file.filename}`);
    res.json({ code: 0, data: { file: file.filename, msg: '上传成功!' } });
  },
);

router.post('/restart', (req, res) => {
  try {
    fs.readFile(path.join(__dirname, './pid.txt'), 'utf8', (error, pid) => {
      if (error) {
        console.log(error);
        err.error(`读取pid失败：${error}`);
      } else {
        console.log('current pid: ', pid);
        if (platform === 'win32') {
          net.info(`执行命令：taskkill /pid ${pid} -t -f`);
          spawnSync('taskkill', ['/pid', `${pid}`, '-t', '-f']);

          console.log('restarting app');
          net.info(`restarting app`);
          net.info(`启动程序---windows`);
          spawn(path.join(__dirname, '../welcomeconfig.exe'), {
            cwd: path.join(__dirname, '../'),
          });
          net.info(`重启成功！`);
          res.json({ code: 0, msg: 'ok' });
        } else {
          net.info(`执行命令：sudo kill -9 ${pid}`);
          spawnSync('sudo', ['kill', '-9', `${pid}`]);

          console.log('restarting app');
          net.info(`restarting app`);
          net.info(`启动程序---linux`);
          spawn(path.join(__dirname, '../welcomeconfig'), {
            cwd: path.join(__dirname, '../'),
          });
          net.info(`重启成功！`);
          res.json({ code: 0, msg: 'ok' });
        }
      }
    });
  } catch (error) {
    console.log(error);
    err.error(`重启失败：${error}`);
    res.json({ code: -1, msg: 'error' });
  }
});

app.use('/api', router);

app.listen(port, () => {
  net.info(`后台服务启动成功：http://127.0.0.1:${port}`);
  console.log(chalk.blue(`listening on http://127.0.0.1:${port}`));
});
