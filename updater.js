// Copyright 2017 The Appgineer
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

const name = "roon-extension-manager";
const module_dir = 'node_modules/';
const backup_dir = 'backup/';
const perform_update = 66;

function get_extension_root() {
    const exec = require('child_process').execSync;
    const stdout = exec('npm list -g --depth=0 ' + name);

    return stdout.toString().split('\n')[0] + '/';
}

function update() {
    const extension_root = get_extension_root();
    const cwd = extension_root + module_dir + name + '/';
    const backup_file = extension_root + backup_dir + name + '.tar';
    const options = { file: backup_file, cwd: cwd };

    backup(options, (clean) => {
        console.log('Inf: Updating: ' + name + '...');

        const exec = require('child_process').exec;
        exec('npm update -g ' + name, (err, stdout, stderr) => {
            if (err) {
                console.error(stderr);
                throw err;
            } else if (clean) {
                process.exit();
            } else {
                const tar = require('tar');
                tar.extract(options, [], () => {
                    process.exit();
                });
            }
        });
    });
}

function backup(options, cb) {
    const fs = require('fs');
    fs.readFile(options.cwd + '.npmignore', 'utf8', function(err, data) {
        let globs = [];

        if (err) {
            console.error(err);
            throw err;
        } else {
            const lines = data.split('\n');

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();

                if (line && line != 'node_modules' && line[0] != '#') {
                    if (fs.existsSync(options.cwd + line)) {
                        globs.push(line);
                    }
                }
            }
        }

        if (globs.length) {
            const tar = require('tar');
            tar.create(options, globs, cb);
        } else if (cb) {
            cb(true);
        }
    });
}

update();
