(()=>{
    function range(v, min, max, step, callback){
        if(!getValue(v).variable){
            local['index'] = 0;
            callback = step;
            step = max;
            max = min;
            min = v;
            v = local['index'];
        }
        if(typeof step == 'function'){
            callback = step;
            step = 1;
        }

        let old = cOperation;
        addOperation({
            action: 'repeat_on_range',
            operations: [],
            values: [{
                name: "variable",
                value: getValue(v)
            },{
                name: "start",
                value: getValue(min)
            },{
                name: "end",
                value: getValue(max)
            },{
                name: "interval",
                value: getValue(step)
            }],
        });
        cOperation = cOperation[cOperation.length-1].operations;
        if(callback) callback(`%var_local(${getValue(v).variable})`);
        cOperation = old;
    }

    let callbackDo = null;
    function whilе(type, values){
        let old = cOperation;
        const cond = getCond(type, values);
        if(!cond) return error(`Нет такого условия: ${type}`);
        addOperation({
            action: 'repeat_forever',
            operations: [],
            values: cond.values,
            conditional: {
                action: cond.action,
                is_inverted: _not??undefined,
            }
        });
        let c = cOperation[cOperation.length-1].operations;
        cOperation = old;
        
        if(callbackDo) {
            cOperation = c;
            callbackDo();
            cOperation = old;
            return;
        }
        return {
            do(callback){
                cOperation = c;
                callback();
                cOperation = old;
            }
        }
    }
    function dо(callback){
        return {
            while(type, values){
                callbackDo = callback;
                return whilе(type, values);
            }
        }
    }
    
    const methods = {};
    const arr = actionsInfo.filter(e => e.object == 'repeat' && e.type == 'container' && !['range','while'].includes(e.name));
    arr.forEach(obj => {
        const id = obj.id.replace('repeat_','');
        methods[id.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase())] = (...args) => {
            let _args = args;
            let callback;

            _args.forEach(arg=>{
                if(typeof arg == 'function') callback = arg;
            });
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
            const lamdba = obj.lambda.map((arg, i) => {
                return `%var_local(${arg.id})`;
            });
            
            let old = cOperation;
            addOperation({
                action: obj.id,
                values: args,
                operations: []
            });
            cOperation = cOperation[cOperation.length-1].operations;
            if(callback) callback(...lamdba);
            cOperation = old;
        }
    });

    return {
        range, whilе, whilee: whilе, wwhile: whilе, While: whilе, WHILE: whilе, _while: whilе, while_: whilе,
        dо, До: dо, до: dо, DO: dо, Do: dо, do_: dо, _do: dо,
        ...methods
    }
});
