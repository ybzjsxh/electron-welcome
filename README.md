# electron-welcomeconfig

## deploy

run `yarn build:[platform]` or `npm run build:[platform]`

or `yarn move:[platform]`, `npm run move:[platform]` if only just server side update

### for raspberrypi

1. edit `.config/lxsession/LXDE-pi/autostart`, add `@/home/pi/welcomeconfig-linxu-armv7l/welcomeconfig`
2. copy `start.sh` to the directory where the app is located, like `/home/pi/welcomeconfig-linux-armv7l/`
3. `chmod +x welcomeconfig start.sh`
4. edit `/etc/rc.local` add `su pi -c "exec /home/pi/welcomeconfig-linux-armv7l/start.sh"  &` before `exit 0`

## version

- 1.2.0 重构restart方法，直接重启程序不再重启app了
- 1.1.1 加入日志
- 1.1.0 增加修改颜色，字号，背景图功能
- 1.0.0 基本功能：修改文字内容

## TODO
