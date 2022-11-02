import express from 'express';
import {Agent} from "undici";

const PORT = 3000;
const HEADERS_DELAY = 200;
const BODY_DELAY = 300;
const PATH = '/test';

/**
 * These tests show how timeouts of undici work. See different timeout values and thrown errors.
 */
async function runTests() {

    /**
     * Server sends headers in 200ms from start of a request
     * After 300ms it completes a body.
     */
    const server = await startServer();

    console.log('-= Connection timeout example =-');
    // I don't know hot to simulate connection timeout easily.
    // So I just put minimum value to catch connection timeout every time.
    await testRequest({connect: {timeout: 10}});

    console.log('-= Headers timeout example =-');
    await testRequest({headersTimeout: HEADERS_DELAY - 10});

    console.log('-= Body timeout example =-');
    await testRequest({bodyTimeout: BODY_DELAY - 10});

    console.log('-= Success example =-');
    await testRequest({bodyTimeout: BODY_DELAY + 10});

    server.close();
}


async function testRequest(options) {
    const agent = new Agent(options);
    try {
        const resp = await agent.request({
            method: 'GET',
            origin: `http://localhost:${PORT}`,
            path: PATH,
        });

        const text = await resp.body.text();
        console.log({received: text});
    } catch (error) {
        console.log({error});
    }
}

async function startServer() {
    const app = express();
    app.get(PATH, (req, res) => {
        setTimeout(() => res.write('Hello'), HEADERS_DELAY);
        setTimeout(() => {res.write(' world!'); res.end();}, HEADERS_DELAY + BODY_DELAY);
    });

    let server;
    await new Promise((resolve) => {
        server = app.listen(PORT, resolve)
    });
    return server;
}

runTests().finally(() => {
    console.log('-= Done =-');
});
