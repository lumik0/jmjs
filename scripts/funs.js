(()=>{
    const functions = new Proxy({}, {
        set(target, property, value) {
            if(!((cHandler === null)||(cHandler === cMain))){
                return error(null, `Нельзя определять функции в ивенте`);
            }
            let options = {
                hidden: false
            }
            if(typeof value != 'function'){
                if(typeof value != 'object' || Array.isArray(value)) throw (`Функция ${property} должна быть функцией`);
                options = value; value = options.func || options.fun || options.function || options.callback;
            }
            let old = cHandler, c;
            if(!target[property]){
                c = addHandler({
                    type: 'function',
                    is_hidden: options.hidden,
                    name: property,
                    operations: []
                });
            }
            target[property] = value;
            vars.functions[property] = {
                func: value,
                args: getFArgs(value),
                handler: c??vars.functions[property].handler
            }
            
            setCHandler(cMain);
            const args = getFArgs(value).map((_, i) => {
                game[`JMJS_funs:${property}_${i}`] = 0;
                return `%var(JMJS_funs:${property}_${i})`;
            });
            (()=>{
                setCHandler(c);
                vars.functions[property].func(args);
                setCHandler(old);
            })();
            return true;
        }
    });
    function callFunction(name, ...args){
        if(typeof name == 'function'){
            for(let i in functions){
                if(functions[i] == name) {
                    name = i; break;
                }
            }
        }
        args.forEach((arg, i) => {
            game[`JMJS_funs:${name}_${i}`] = arg;
        });

        addO('call_function', [{
            name: "function_name",
            value: getValue(name)
        }]);
    }
    


    const processes = new Proxy({}, {
        set(target, property, value) {
            if(!((cHandler === null)||(cHandler === cMain))){
                return error(null, `Нельзя определять функции в ивенте`);
            }
            if(typeof value != 'function'){
                return error(null, `Функция ${property} должна быть функцией`);
            }
            let old = cHandler;
            target[property] = value;
            addHandler({
                type: 'process',
                is_hidden: false,
                name: property,
                operations: []
            });
            
            vars.processes[property] = {
                func: value,
                args: getFArgs(value),
                handler: cHandler
            }
            
            setCHandler(cMain);
            const args = getFArgs(value).map((_, i) => {
                game[`JMJS_proc:${property}_${i}`] = 0;
                return `%var(JMJS_proc:${property}_${i})`;
            });
            (()=>{
                setCHandler(vars.processes[property].handler);
                vars.processes[property].func(args);
                setCHandler(old);
            })();
            return true;
        }
    });
    function startProcess(name, local_variables_mode, target_mode, ...args){
        if(typeof name == 'function'){
            for(let i in functions){
                if(processes[i] == name) {
                    name = i; break;
                }
            }
        }
        
        for(let i=0;i<args.length;i++){
            game[`JMJS_proc:${name}_${i}`] = args[i];
        }
    
        addOperation({
            action: 'start_process',
            values: [{
                name: "function_name",
                value: getValue(name)
            },{
                name: 'local_variables_mode',
                value:{
                    type: 'enum',
                    enum: local_variables_mode??'COPY'
                }
            },{
                name: 'target_mode',
                value:{
                    type: 'enum',
                    enum: target_mode??'CURRENT_TARGET'
                }
            }]
        });
    }

    return {
        functions, callFunction,
        funs: functions, callF: callFunction,
        
        processes, startProcess,
        proc: processes
    }
});
