const fs = require('fs');
const args = process.argv.slice(2);
const version = fs.readFileSync(__dirname+'/data/version.txt', 'utf8');
let settings = JSON.parse(fs.readFileSync(__dirname+'/settings.json', 'utf8'));
if(args.length == 0){
    console.log(`Использование: node jmjs <script>`);
    process.exit(1);
}
if(typeof settings != 'object'){
    settings = {
        savefile: "%file%.json",
        uploadModule: true,
        autoupdate: true
    }
    fs.writeFileSync(__dirname+'/settings.json', JSON.stringify(settings, null, 4));
}

async function checkVer(){
    const ver = await(await(await fetch('https://raw.githubusercontent.com/lumik0/jmjs/refs/heads/main/data/version.txt')).text());
    if(ver!=version){
        console.error(`Новая версия доступна: ${ver.replace('\n','')}`);
        console.error(`\x1b[32mИдёт обновление..\x1b[0m`);
        const list = await(await(await fetch('https://api.github.com/repos/lumik0/jmjs/git/trees/main?recursive=1')).json());
        for(let file of list.tree){
            if(file.path == 'README.md') continue;
            if(file.type == 'tree'){
                if(!fs.existsSync(`${__dirname}/${file.path}`)){
                    fs.mkdirSync(`${__dirname}/${file.path}`);
                }
            }else{
                const data = (await(await fetch(`https://raw.githubusercontent.com/lumik0/jmjs/refs/heads/main/${file.path}`)).text());
                fs.writeFileSync(`${__dirname}/${file.path}`, data);
            }
        }
        console.log(`\x1b[32mОбновление завершено.\x1b[0m`);
        process.exit(1);
    } else return true;
}

function error(e, msg){
    if(!e) e = '';
    function StackItem(){
        this.what = '[unknown]';
        this.file = '[unknown]';
        this.line = '[unknown]';
        this.column = '[unknown]';
    }
    function parse(stack){
        let items = [];
        let lines = stack.match(/^\s+at.*$/mg);

        if(!lines) return [];
        lines.forEach(line=>{
            line = line.replace(/^\s*at\s*/, '');
            let m = line.match(/^(.*?)\s+\(([^)]+):(\d+):(\d+)\)$/);
    
            if(!m) {
                m = line.match(/^(.*?):(\d+):(\d+)$/);
                if(m) m.splice(1, 0, null);
            }
            if(!m) {
                m = line.lastIndexOf('<anonymous>');
                m = line.substr(m+'<anonymous>'.length+1, line.length-1).replace(')','');
                m = [null, 'what', null, m.split(':')[1], m.split(':')[0]];
            }

            let item = new StackItem();
            if(m){
                item.what = m[1];
                item.file = m[2];
                item.line = m[3];
                item.column = m[4];
                items.push(item);
            }else{
                item.what = line;
                items.push(item);
            }
        });
    
        return items;
    };
    function getLineColumn(str, line, column, lastcolumn) {
        let lines = str.split('\n');
        if(line >= 1 && line <= lines.length){
            let selectedLine = lines[line-1];
            if(column >= 0 && column <= selectedLine.length && lastcolumn >= column && lastcolumn <= selectedLine.length){
                return selectedLine.substring(0, lastcolumn);
            }
        }
    }
    function getLineLength(str, line){
        let lines = str.split('\n');
        if(line >= 1 && line <= lines.length) {
            return lines[line - 1].length;
        }
    }
    
    console.error('Ошибка!\n');
    console.error(`${msg}`);
    if(e && e.stack){
        const m = parse(e.stack);
        const n = m.find(v => v.line !== '[unknown]' && v.column !== '[unknown]');
        if(n) console.error(`${n.column}:${n.line} - ${getLineColumn(cScript.data, n.line, n.column, getLineLength(cScript.data, n.line))}`);
    }
    console.error("\x1b[2m"+(e.stack?e.stack:e)+'\x1b[0m');
    process.exit(1);
}
function loadC(scr, ...args){
    let data, result;
    if(!datasc[scr]) data = fs.readFileSync(__dirname+'/'+scr, 'utf8');
    else data = datasc[scr];
    datasc[scr] = data;
    try{result = eval(data);}catch(e){error(e,e.message);}
    if(typeof result == 'function') result = result(...args);
    return result;
}
function loadCS(scr, ...args){
    const d = loadC(scr, ...args);
    for(let i in d){
        global[i] = d[i];
    }
}

function getFArgs(func) {
    if(func.length === 0){
        return [];
    }
    let string = func.toString();
    let args;
    args = string.match(/(?:async|function)\s*.*?\(([^)]*)\)/)?.[1] ||
           string.match(/^\s*\(([^)]*)\)\s*=>/)?.[1] ||
           string.match(/^\s*([^=]*)=>/)?.[1]
    return args.split(',').map(function(arg){
        return arg.replace(/\/\*.*\*\//, '').trim();
    }).filter(function(arg){
        return arg;
    });
}

let datasc = {};
let result = { handlers: [] };
let cMain = null;
let cHandler = null;
let cOperation = null;
let cScript = {
    path: args[0],
    data: fs.readFileSync(args[0], {encoding: 'utf8'}),
};

function clone(obj){
    let result = obj;
    let type = {}.toString.call(obj).slice(8, -1);
    if(type == 'Set') {
        return new Set([...obj].map(value => clone(value)));
    } else if(type == 'Map') {
        return new Map([...obj].map(kv => [clone(kv[0]), clone(kv[1])]));
    } else if(type == 'Date') {
        return new Date(obj.getTime());
    } else if(type == 'RegExp') {
        return RegExp(obj.source, getRegExpFlags(obj));
    } else if(type == 'Array' || type == 'Object') {
        result = Array.isArray(obj) ? [] : {};
        for(let key in obj) {
            result[key] = clone(obj[key]);
        }
    }
    return result;
}
function sclone(obj){
    obj = clone(obj);
    if(typeof obj == 'function') return obj;
    if(typeof obj == 'object'){
        function a(o){
            for(let key in o){
                if(typeof o[key]=='function'){
                    delete o[key];
                }else if(typeof o[key] == 'object') a(o[key]);
            }
            return o;
        }
        obj = a(obj);
    }
    return structuredClone(obj);
}
function setCHandler(handler){
    if(!handler || !handler.operations){
        cHandler = null;
        cOperation = null;
        return;
    }
    cHandler = handler;
    cOperation = handler.operations;
}
function typeContains(type1, type2){
    if(type1 == 'variable') return true;
    if(type2 == 'variable') return true;
    return type1 === type2;
}
function gameValue(value, selection){
    return {
        jmjs: true,
        type: 'game_value',
        game_value: value,
        selection: selection??"null"
    }
}
let gv = gameValue;
// global.gvph = (v,s) => ph(gameValue(v,s));
function addHandler(data) {
    result.handlers.push({
        type: data.type??'event',
        event: data.event,
        operations: [],
        position: events.size++,
        ...data
    });
    cHandler = result.handlers[result.handlers.length - 1];
    cOperation = cHandler.operations;
    return cHandler;
}
function addOperation(data, cur) {
    if(!cur) cur = cOperation;
    if(!cur) cur = cHandler;
    if(!cur && cMain) cur = cMain.operations;
    if(!cur) {
        events.on('world_start', ()=>{});
        setCHandler(cMain = events.lastHandler);
        cur = cMain.operations;
    }
    
    cur.push({
        action: data.action,
        values: data.values??[],
        ...data
    });
    return cur;
}
function addO(action, values, data){
    if(!data) data = {};
    if(data.dontMapValue && values){
        values = values.map(getValue);
        delete data.dontMapValue;
    }
    return addOperation({
        action: action,
        values: values??[],
        ...data
    });
}
function getValue(value){
    function _var(value){
        if(!value.variable.startsWith(`JMJS_variable:`) && value.path.split(variable.doth).length > 1){
            if(!game[`JMJS_variable:${value.path}`]){
                gPath(value.scope, value.path, `JMJS_variable:${value.path}`);
            }
            return {
                type: 'variable',
                variable: `JMJS_variable:${value.path}`,
                scope: 'game'
            }
        }

        return {
            type: 'variable',
            variable: value.variable,
            scope: value.scope
        }
    }
    if(typeof value == 'object'){
        if(Array.isArray(value)){
            if(value.variable) return _var(value);
            return {
                type: "array",
                values: value.map(getValue)
            }
        }else{
            if(value.jmjs == true){
                if(value.type == 'location'){
                    return {
                        type: 'location',
                        x: value.x,
                        y: value.y,
                        z: value.z,
                        yaw: value.yaw??undefined,
                        pitch: value.pitch??undefined
                    }
                }else if(value.type == 'item'){
                    return {
                        type: 'item',
                        item: JSON.stringify(value.item)
                    }
                }else if(value.type == 'minimessage'){
                    return {
                        type: 'text',
                        text: String(value.value),
                        parsing: 'minimessage'
                    }
                }else if(value.type == 'plain'){
                    return {
                        type: 'text',
                        text: String(value.value),
                        parsing: 'plain'
                    }
                }else if(value.type == 'entity'){
                    return getValue(value.uuid);
                }else if(value.type == 'player'){
                    return getValue(value.name);
                }else return value;
            }else return value;
        }
    }else if(typeof value == 'boolean'){
        return {
            type: 'enum',
            enum: value?'TRUE':'FALSE'
        }
    }else if(typeof value == 'number'){
        return {
            type: 'number',
            number: value
        }
    }else if(typeof value == 'function'){
        if(value.type == 'variable' && value.variable) return _var(value);
    }
    
    return {
        type: 'text',
        text: String(value),
        parsing: 'legacy'
    }
}
function setMeta(data){
    result.meta = {
        id: data.id,
        name: data.name,
        description: data.description,
        authors: data.authors,
        agent: data.agent,
        dependencies: data.dependencies,
    }
}

let actionsInfo = JSON.parse(fs.readFileSync(__dirname+'/data/actions.json', 'utf8'));
let eventsInfo = JSON.parse(fs.readFileSync(__dirname+'/data/events.json', 'utf8'));
let valuesInfo = JSON.parse(fs.readFileSync(__dirname+'/data/values.json', 'utf8'));
loadCS('scripts/placeholder.js');
loadCS('scripts/controller.js');
loadCS('scripts/condition.js');
loadCS('scripts/factories.js');
loadCS('scripts/commands.js');
loadCS('scripts/variable.js');
loadCS('scripts/control.js');
loadCS('scripts/repeat.js');
loadCS('scripts/select.js');
loadCS('scripts/events.js');
loadCS('scripts/funs.js');
loadCS('scripts/game.js');

let current = loadC('scripts/player.js', 'current');
let currentEntity = loadC('scripts/entity.js', 'current');
let event = {
    player: loadC('scripts/player.js'),
    entity: loadC('scripts/entity.js', 'entity'),
    
    killer: loadC('scripts/player.js', 'killer_player'),
    killerEntity: loadC('scripts/entity.js', 'killer_entity'),
    damager: loadC('scripts/player.js', 'damager_player'),
    damagerEntity: loadC('scripts/entity.js', 'damager_entity'),
    victim: loadC('scripts/player.js', 'victim_player'),
    victimEntity: loadC('scripts/entity.js', 'victim_entity'),
    shooter: loadC('scripts/player.js', 'shooter'),
    shooterEntity: loadC('scripts/entity.js', 'shooter_entity'),
    randomEntity: loadC('scripts/entity.js', 'random_entity'),
    randomPlayer: loadC('scripts/player.js', 'random_player'),
    allPlayers: loadC('scripts/player.js', 'all_players'),
    allMobs: loadC('scripts/entity.js', 'all_mobs'),
    allEntities: loadC('scripts/entity.js', 'all_entities'),
    projectile: loadC('scripts/entity.js', 'projectile'),
    lastEntity: loadC('scripts/entity.js', 'lastEntity'),
    
    cancel(){
        addO("game_cancel_event");
    },
    uncancel(){
        addO("game_uncancel_event");
    },
    getAllPlayers(){
        return this.allPlayers
    }
};
let vars = {
    functions: {},
    processes: {},
    commands: {}
};
let events = {
    size: 0,
    events: {},
    lastHandler: null,
    on(ev, callback, unshift){
        if(!this.events[ev]){
            this.events[ev] = [];
        }
        if(unshift) this.events[ev].unshift(callback);
        else this.events[ev].push(callback);
        
        addHandler({ event: ev });
        callback(event);
        this.lastHandler = cHandler;
        setCHandler(null);
        return this;
    }
}

async function uploadModule(){
    fetch('https://m.justmc.ru/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(result)
    }).catch(()=>{
        console.error('Не удалось опубликовать модуль');
    }).then(async (e)=>{
        if(!e) return;
        let res = await e.json();
        
        console.log(`\x1b[90mКоманда для загрузки модуля:`);
        console.log(`\x1b[36m/module loadUrl force https://m.justmc.ru/api/${res.id}\x1b[0m`);
    });
}

(async function(){
    if(settings.autoupdate && !(await checkVer())) return;
    try{
        eval(cScript.data);
    }catch(e){
        error(e, e.message);
    }

    let det = loadC('scripts/detect.js', cScript.data);
    if(det) error(det);
    
    fs.writeFileSync(settings.savefile.replaceAll('%file%',args[0].split('/').pop()), JSON.stringify(result));
    console.log(`\x1b[32mУспешно! Файл сохранен\x1b[0m`);
    
    if(settings.uploadModule) uploadModule();
})();
