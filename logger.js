import fs from 'fs';
import { stdin, stdout } from 'process';

const logStream = fs.createWriteStream('app.log', { flags: 'w' });

// Regex to strip ANSI escape codes
const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

stdin.setEncoding('utf8');

stdin.on('data', (chunk) => {
    // Write raw chunk to stdout (preserves colors)
    stdout.write(chunk);

    // Strip colors and write to file
    const cleanChunk = chunk.replace(ansiRegex, '');
    logStream.write(cleanChunk);
});

stdin.on('end', () => {
    logStream.end();
});
