(()=>{
    // function forever(callback){
    //     let old = cOperation;
    //     addOperation({
    //         action: 'repeat_forever',
    //         operations: [],
    //         values: [],
    //     });
    //     cOperation = cOperation[cOperation.length-1].operations;
    //     if(callback) callback();
    //     cOperation = old;
    // }
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











    // function multiTimes(variable, amount, callback){
    //     let old = cOperation;
    //     addOperation({
    //         action: 'repeat_multi_times',
    //         operations: [],
    //         values: [{
    //             name: 'variable',
    //             value: getValue(variable)
    //         },{
    //             name: 'amount',
    //             value: getValue(amount)
    //         }],
    //     });
    //     cOperation = cOperation[cOperation.length-1].operations;
    //     if(callback) callback();
    //     cOperation = old;
    // }
    // function forEachInList(index, value, list){
    //     let old = cOperation;
    //     addOperation({
    //         action: 'repeat_for_each_in_list',
    //         operations: [],
    //         values: [{
    //             name: 'index',
    //             value: getValue(index)
    //         },{
    //             name: 'value',
    //             value: getValue(value)
    //         },{
    //             name: 'list',
    //             value: getValue(list)
    //         }],
    //     });
    //     cOperation = cOperation[cOperation.length-1].operations;
    //     if(callback) callback(`%var_local(${getValue(index).variable})`, `%var_local(${getValue(value).variable})`);
    //     cOperation = old;
    // }
    // function forEachMapEntry(key, value, map){
    //     let old = cOperation;
    //     addOperation({
    //         action: 'repeat_for_each_map_entry',
    //         operations: [],
    //         values: [{
    //             name: 'key',
    //             value: getValue(key)
    //         },{
    //             name: 'value',
    //             value: getValue(value)
    //         },{
    //             name: 'map',
    //             value: getValue(map)
    //         }],
    //     });
    //     cOperation = cOperation[cOperation.length-1].operations;
    //     if(callback) callback(`%var_local(${getValue(key).variable})`, `%var_local(${getValue(value).variable})`);
    //     cOperation = old;
    // }
    // function onGrid(variable, start, end){
    //     let old = cOperation;
    //     addOperation({
    //         action: 'repeat_on_grid',
    //         operations: [],
    //         values: [{
    //             name: 'variable',
    //             value: getValue(variable)
    //         },{
    //             name: 'start',
    //             value: getValue(start)
    //         },{
    //             name: 'end',
    //             value: getValue(end)
    //         }],
    //     });
    //     cOperation = cOperation[cOperation.length-1].operations;
    //     if(callback) callback(`%var_local(${getValue(variable).variable})`);
    //     cOperation = old;
    // }
    // function adjacently(variable, origin, change_rotation, include_self, pattern){
    //     let old = cOperation;
    //     addOperation({
    //         action: 'repeat_on_grid',
    //         operations: [],
    //         values: [{
    //             name: 'variable',
    //             value: getValue(variable)
    //         },{
    //             name: 'origin',
    //             value: getValue(origin)
    //         },{
    //             name: 'change_rotation',
    //             value: {
    //                 type: 'enum',
    //                 enum: change_rotation
    //             }
    //         },{
    //             name: 'include_self',
    //             value: {
    //                 type: 'enum',
    //                 enum: include_self
    //             }
    //         },{
    //             name: 'pattern',
    //             value: {
    //                 type: 'enum',
    //                 enum: pattern
    //             }
    //         }],
    //     });
    //     cOperation = cOperation[cOperation.length-1].operations;
    //     if(callback) callback(`%var_local(${getValue(variable).variable})`);
    //     cOperation = old;
    // }
    // function onGrid(variable, start, end){
    //     let old = cOperation;
    //     addOperation({
    //         action: 'repeat_on_grid',
    //         operations: [],
    //         values: [{
    //             name: 'variable',
    //             value: getValue(variable)
    //         },{
    //             name: 'start',
    //             value: getValue(start)
    //         },{
    //             name: 'end',
    //             value: getValue(end)
    //         }],
    //     });
    //     cOperation = cOperation[cOperation.length-1].operations;
    //     if(callback) callback(`%var_local(${getValue(variable).variable})`);
    //     cOperation = old;
    // }
    
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
            // console.log(_args)
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
            // console.log(args, lamdba)
            
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




    // ✔ repeat_forever
    // ✔ repeat_while
    // ▢ repeat_multi_times
    // ✔ repeat_on_range
    // ▢ repeat_for_each_in_list
    // ▢ repeat_for_each_map_entry
    // ▢ repeat_on_grid
    // ▢ repeat_adjacently
    // ⨉ repeat_on_path
    // ⨉ repeat_on_circle
    // ⨉ repeat_on_sphere

    return {
        range, whilе, whilee: whilе, wwhile: whilе, While: whilе, WHILE: whilе, _while: whilе, while_: whilе,
        dо, До: dо, до: dо, DO: dо, Do: dо, do_: dо, _do: dо,
        ...methods

        // multiTimes, forEachInList, forEachMapEntry,
        // onGrid, adjacently
    }
});