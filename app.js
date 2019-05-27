const Koa = require('koa');

const port = process.env.PORT || 80;
const serverTimeout = 600000;

const app = new Koa();

app.use((ctx, next) => {
    if (ctx.request.method === 'GET' && ctx.request.path === '/status') {
        // eslint-disable-next-line no-param-reassign
        ctx.body = {
            status: 'App is up and running',
        };

        return;
    }

    return next();
});

app.use(async (ctx, next) => {
    if (ctx.request.method === 'GET' && ctx.request.path === '/prof') {

        const fs = require('fs');
        const dir = './';

        const files = fs.readdirSync(dir)
            .filter(name => name.includes('.log'))
            .map((fileName) => ({
                name: fileName,
                time: fs.statSync(dir + fileName).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time )
            .map(({ name, time }) => ({ name, time: new Date(time) }));

        const first = files[0];

        if (!first) {
            ctx.body = {};
            return;
        }

        const src = fs.createReadStream(dir + first.name);
        ctx.response.set('content-type', 'txt/html');
        // eslint-disable-next-line no-param-reassign
        ctx.body = src;

        return;
    }

    return next();
});


const server = app.listen(port);
server.keepAliveTimeout = 0;
server.setTimeout(serverTimeout);

process.on('SIGINT', () => { server.close(() => process.exit(0)); });
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });

// eslint-disable-next-line no-console
console.log(`Koa server is listening on ${port} port.`);