(()=>{
    let methods = {};
    const rand = Math.floor(Math.random() * 5);
    const doth = Array.from('🕥💀💻😭🙉🦄').slice(rand, rand + 1).join('');

    const arr = actionsInfo.filter(e => e.object == 'variable' && e.id.startsWith('set_variable') && e.type == 'basic');
    arr.forEach(obj => {
        const id = obj.id.replace('set_variable_','');
        methods[id.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase())] = (...args) => {
            let _args = args;
            args = obj.args.map((arg, i) => {
                let value = _args[i];
                
                if(arg.array){
                    let arr = [];
                    value = Array.isArray(value) ? value : _args;
                    for(let j=0;j<value.length;j++){
                        if(typeContains(arg.type, getValue(value[j]).type)){
                            arr.push(getValue(value[j]));
                        }
                    }
                    _args = _args.filter((_,i) => arr[i] === undefined);
                    return { name: arg.id, value: getValue(arr)};
                } else if(arg && value){
                    if(obj.args[i+1] && obj.args[i+1].array)
                        _args.splice(i, 1);
                    if(arg.type == 'enum') return { name: arg.id, value: {type: 'enum', enum: typeof value=='boolean'?(!!value).toString().toUpperCase():value }};
                    return { name: arg.id, value: getValue(value) };
                }
            }).filter(Boolean);
            
            addO(obj.id, args);
            return `%var_local(${args[0]})`;
        }
    });

    
    let obj = {};
    let vmethods = {
        equals(value){
            return {
                type: 'condition',
                action: 'var_equals',
                args: [this, value]
            };
        },
        greater(value){
            return {
                type: 'condition',
                action: 'var_greater',
                args: [this, value]
            };
        },
        greaterOrEquals(value){
            return {
                type: 'condition',
                action: 'var_greater_or_equals',
                args: [this, value]
            };
        },
        less(value){
            return {
                type: 'condition',
                action: 'var_less',
                args: [this, value]
            };
        },
        lessOrEquals(value){
            return {
                type: 'condition',
                action: 'var_less_or_equals',
                args: [this, value]
            };
        }
    };

    function ENumber(initialValue = 0, properties = {}) {
        if(typeof initialValue!='number') initialValue = Number(initialValue);
        if(isNaN(initialValue)) throw 'Initial value must be a number';
        let value = initialValue;
    
        return new Proxy(() => {
            return value;
        }, {
            get(target, property) {
                if(property === 'valueOf') {
                    return () => value;
                } else if(property === 'toString') {
                    return () => value.toString();
                } else if(property in properties) {
                    return properties[property];
                }
                return target[property];
            },
            set(target, property, newValue){
                if(property === 'valueOf' || property === 'toString') {
                    return false;
                }
                if(property in properties) {
                    properties[property] = newValue;
                } else {
                    target[property] = newValue;
                }
                return true;
            }
        });
    }
    function EArray(initialArray = [], properties = {}) {
        if(!Array.isArray(initialArray)) throw 'Initial array must be an array';
        let array = initialArray;
        
        return new Proxy(array, {
            get(target, property) {
                if(property in target) {
                    return target[property];
                } else if(property in properties) {
                    return properties[property];
                }
            },
            set(target, property, value) {
                if(property in target) {
                    target[property] = value;
                } else{
                    properties[property] = value;
                }
                return true;
            }
        });
    }
    function EObject(initialObject = {}, properties = {}) {
        if(typeof initialObject == 'number') return ENumber(initialObject, properties);
        if(Array.isArray(initialObject)) return EArray(initialObject, properties);
        let obj = { ...initialObject };
        
        return new Proxy(obj, {
            get(target, property){
                if(property in target) {
                    return target[property];
                } else if(property in properties) {
                    return properties[property];
                }
                return undefined;
            },
            set(target, property, value){
                if(property in target || !(property in properties)){
                    target[property] = value;
                }else{
                    properties[property] = value;
                }
                return true;
            },
            has(target, property){
                return property in target || property in properties;
            },
            deleteProperty(target, property){
                if(property in target){
                    delete target[property];
                } else if(property in properties){
                    delete properties[property];
                }
                return true;
            }
        });
    }



    function get(value, dont){
        if(typeof value == 'object' && Array.isArray(value)){
            if(dont){
                let result = {type: 'array', values: []};
                for(let i=0;i<value.length;i++){
                    let o = value[i];
                    if(typeof o == 'object'){
                        value[i] = get(o);
                    }
                }
                for(let o of value){
                    if(typeof o == 'object'){
                        result.values.push(o);
                    }else{
                        result.values.push(getValue(o));
                    }
                }
                return result;
            }

            for(let i=0;i<value.length;i++){
                let o = value[i];
                if(typeof o == 'object'){
                    value[i] = get(o);
                }else{
                    value[i] = getValue(o);
                }
            }

            return {
                type: 'array',
                values: value
            };
            // const i = 'JMJS_LIST:'+Math.random().toString(36);
            // addOperation({
            //     action: 'set_variable_create_list',
            //     values: [{
            //         name: 'variable',
            //         value: {
            //             type: 'variable',
            //             variable: i,
            //             scope: 'local'
            //         }
            //     },{
            //         name: 'values',
            //         value: getValue(value)
            //     }]
            // });

            // return {
            //     type: 'variable',
            //     variable: i,
            //     scope: 'local'
            // };
        }else{
            if(dont){
                let result = {type: 'array', values: []};
                for(let i in value){
                    let o = value[i];
                    if(typeof o == 'object'){
                        value[i] = get(o);
                    }
                }
                for(let o of value){
                    if(typeof o == 'object'){
                        result.values.push(o);
                    }else{
                        result.values.push(getValue(o));
                    }
                }
                return result;
            }

            for(let i in value){
                let o = value[i];
                if(typeof o == 'object'){
                    value[i] = get(o);
                }else{
                    value[i] = getValue(o);
                }
            }

            const i = 'JMJS_MAP:'+Math.random().toString(36);
            addO('set_variable_create_map_from_values', [{
                name: 'variable',
                value: {
                    type: 'variable',
                    variable: i,
                    scope: 'local'
                }
            },{
                name: 'keys',
                value: getValue(Object.keys(value))
            },{
                name: 'values',
                value: getValue(Object.values(value))
            }]);

            return {
                type: 'variable',
                variable: i,
                scope: 'local'
            }
        }
    }
    function set(type, path, value, operation){
        let name = path.split(doth)[0];
        let pvalue, dvalue = clone(value);
        
        pvalue = setByPath({}, path, dvalue);
        
        if(Array.isArray(pvalue)){
            if(varExists(type, name)){
                if(operation == '+' || operation == '-'){
                    const i = 'JMJS_var:'+Math.random().toString(36).substring(2,13);
                    set('local', i, pvalue[pvalue.length-1], operation);
                    pvalue = {
                        type: 'variable',
                        variable: i,
                        scope: 'local',
                        length: pvalue.length
                    }
                }
                // gPath('local', path, `JMJS_lvar:${path}`);
                addO('set_variable_set_list_value', [{
                    name: 'variable',
                    value: {
                        type: 'variable',
                        variable: 'listValue',
                        scope: 'local'
                    }
                },{
                    name: 'list',
                    value: {
                        type: 'variable',
                        variable: `JMJS_lvar:${path}`,
                        scope: 'local'
                    }
                },{
                    name: 'number',
                    value: getValue(pvalue.length-1)
                },{
                    name: 'value',
                    value: getValue(pvalue.type=='variable'?pvalue:pvalue[pvalue.length-1])
                }]);
                // setVar(type, name, getVar('local', `JMJS_lvar:${path}`));
            }else{
                addO('set_variable_set_list_value', [{
                    name: 'variable',
                    value: {
                        type: 'variable',
                        variable: 'listValue',
                        scope: 'local'
                    }
                },{
                    name: 'list',
                    value: {
                        type: 'variable',
                        variable: name,
                        scope: type
                    }
                },{
                    name: 'number',
                    value: getValue(pvalue.length-1)
                },{
                    name: 'value',
                    value: getValue(pvalue[pvalue.length-1])
                }]);
            }
        }else if(typeof pvalue == 'object'){
            let object = pvalue[name];
            if(typeof object == 'object'){
                if(Array.isArray(object)){
                    addO('set_variable_create_list', [{
                        name: 'variable',
                        value: {
                            type: 'variable',
                            variable: name,
                            scope: type
                        }
                    },{
                        name: 'values',
                        value: get(object)
                    }]);
                }else{
                    if(typeof value != 'object') value = object;
                    if(varExists(type, name)){
                        for(let v in value){
                            if(operation == '+' || operation == '-'){
                                const i = 'JMJS_var:'+Math.random().toString(36).substring(2,13);
                                set('local', i, value[v], operation);
                                value[v] = {
                                    type: 'variable',
                                    variable: i,
                                    scope: 'local'
                                }
                            }
                            let oldname = name;
                            let oldtype = type;
                            if(path != name){
                                name = `JMJS_lvar:${path}`;
                                type = 'game';
                                if(!obj.local[`JMJS_lvar:${path}`]){
                                    gPath(oldtype, path, `JMJS_lvar:${path}`);
                                }
                            }
                            addO('set_variable_set_map_value', [{
                                name: 'variable',
                                value: {
                                    type: 'variable',
                                    variable: 'mapValue',
                                    scope: 'local'
                                }
                            },{
                                name: 'map',
                                value: {
                                    type: 'variable',
                                    variable: name,
                                    scope: type
                                }
                            },{
                                name: 'key',
                                value: getValue(v)
                            },{
                                name: 'value',
                                value: getValue(value[v])
                            }]);
                            if(path != oldname){
                                setVar(oldtype, oldname, {
                                    type: 'variable',
                                    variable: `JMJS_lvar:${path}`,
                                    scope: 'game'
                                });
                            }
                        }
                    }else{
                        addO('set_variable_create_map_from_values', [{
                            name: 'variable',
                            value: {
                                type: 'variable',
                                variable: name,
                                scope: type
                            }
                        },{
                            name: 'keys',
                            value: getValue(Object.keys(value))
                        },{
                            name: 'values',
                            value: get(Object.values(value), true)
                        }]);
                    }
                }
            }else if(typeof object == 'number' && operation == '+' || operation == '-'){
                addO('set_variable_increment', [{
                    name: 'variable',
                    value: {
                        type: 'variable',
                        variable: name,
                        scope: type
                    }
                },{
                    name: 'number',
                    value: getValue(object)
                }]);
            }else if(['number','string'].includes(typeof object) && operation == '='){
                addO('set_variable_value', [{
                    name: 'variable',
                    value: {
                        type: 'variable',
                        variable: name,
                        scope: type
                    }
                },{
                    name: 'value',
                    value: getValue(value)
                }]);
            }
        }
    }
    function setVar(scope, name, value){
        addO('set_variable_value', [{
            name: 'variable',
            value: {
                type: 'variable',
                variable: name,
                scope: scope
            }
        },{
            name: 'value',
            value: getValue(value)
        }]);
    }
    function getVar(scope, name, defaultValue=0){
        switch(scope){
            case 'game': return EObject(obj.game[name]??defaultValue);
            case 'save': return EObject(obj.save[name]??defaultValue);
            case 'local': return EObject(obj.local[name]??defaultValue);
        }
    }
    
    function pathIsArray(path){
        return !isNaN(Number(path.split('').pop()));
    }
    function varExists(type, variable){
        return obj[type][variable] !== undefined;
    }

    function setByPath(obj, path, value) {
        const keys = path.split(doth);
        const name = keys[0];
        let current = obj;
      
        for(let i = 0; i < keys.length; i++) {
            const key = keys[i];
        
            if(i === keys.length - 1) {
                current[key] = value;
            }else{
                const nextKey = keys[i + 1];
                if(!isNaN(nextKey)){
                    if(!Array.isArray(current[key])){
                        current[key] = [];
                    }
                }else{
                    if(typeof current[key] !== 'object' || current[key] === null){
                        current[key] = {};
                    }
                }
                current = current[key];
            }
        }

        if(!Array.isArray(current) && !current[name]){
            current = {[name]: current};
        }

        return current;
    }
    function getByPath(obj, path) {
        const keys = path.split(doth);
        let current = obj;
        
        if(current === undefined || current === null){
            return undefined;
        }
        for(let i = 0; i < keys.length; i++) {
            const key = keys[i];
            
            current = current[key];
        }
        
        return current;
    }
    function gPath(scope, path, savevar) {
        const keys = path.split(doth);
        const name = keys[0];
        let current = {};

        savevar = {
            type: 'variable',
            variable: savevar,
            scope: 'game'
        }
        
        for(let i = 1; i < keys.length; i++) {
            const key = keys[i];

            let _var = clone(savevar);
            if(i == 1) _var = {
                type: 'variable',
                variable: name,
                scope: scope
            }
            
            if(pathIsArray(key)){
                addO('set_variable_get_list_value', [{
                    name: 'variable',
                    value: savevar
                },{
                    name: 'list',
                    value: _var
                },{
                    name: 'number',
                    value: getValue(Number(key))
                }]);
            }else{
                addO('set_variable_get_map_value', [{
                    name: 'variable',
                    value: savevar
                },{
                    name: 'map',
                    value: _var
                },{
                    name: 'key',
                    value: getValue(key)
                }]);
            }
        }
        
        return current;
    }
      
    function observeObject(type, initialState) {
        let state = clone(initialState);
    
        function createProxy(obj, path = []) {
            return new Proxy(obj, {
                get(target, property){
                    const prop = target[property];
                    const fullPath = path.concat(property).join(doth);
                    if(typeof prop == 'function') return prop.bind(target);
                    if(typeof prop == 'number') return ENumber(prop, { type: 'variable', variable: path.concat(property).join(doth), scope: type, path: fullPath, ...vmethods });
                    if(typeof prop == 'object' && prop !== null) return createProxy(EObject(prop, { type: 'variable', variable: property, scope: type, path: fullPath, ...vmethods }), path.concat(property));
                    return prop;
                },
                set(target, property, value){
                    value = clone(value);
                    const oldValue = target[property];
                    const fullPath = path.concat(property).join(doth);
                    if(typeof value == 'function') return target[property] = value;
                    if(oldValue === value) return false;
                    
                    let operationType = '=';
                    if(typeof oldValue == 'number' && typeof value == 'number') {
                        if(value === oldValue) {
                            operationType = '=';
                        } else if(value > oldValue) {
                            operationType = '+';
                        } else if(value < oldValue) {
                            operationType = '-';
                        }
                    }
                    if(typeof target[property] == typeof value){ // change
                        set(type, fullPath, clone(value-oldValue), operationType);
                    } else if(target[property] === undefined){ // new, define
                        set(type, fullPath, clone(value), '=');
                    }

                    target[property] = value;
                    return true;
                }
            });
        }

        return createProxy(state);
    }
    obj.game = observeObject('game', {});
    obj.save = observeObject('save', {});
    obj.local = observeObject('local', {});

    obj.g = obj.game;
    obj.s = obj.save;
    obj.l = obj.local;

    return {
        setByPath, getByPath, gPath,
        variable: {
            doth, ...methods
        },
        ...obj
    };
});