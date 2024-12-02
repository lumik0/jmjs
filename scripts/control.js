(()=>{
    function wait(a, b, c){
        if(typeof a == 'function'){
            const id = `JMJS_proc[wait]:${Math.random().toString(32)}`;
            let ms = {
                type: 'enum',
                enum: c
            }
            processes[id] = ()=>{
                addO('control_wait', [{
                    name: 'duration',
                    value: getValue(b)
                },{
                    name: 'time_unit',
                    value: ms
                }]);
                a();
            }
            startProcess(id);
        }
        let ms = {
            type: 'enum',
            enum: b
        }
        addO('control_wait', [{
            name: 'duration',
            value: getValue(a)
        },{
            name: 'time_unit',
            value: ms
        }]);
    }
    function callException(id, text, type){
        addO('control_call_exception', [{
            name: 'id', value: getValue(id)
        },{
            name: 'text', value: getValue(text)
        },{
            name: 'type', value: {
                type: 'enum',
                enum: type??"ERROR"
            }
        }]);
    }
    function dummy(){
        addO('control_dummy');
    }
    function returnFunction(){
        addO('control_return_function');
    }
    function skipIteration(){
        addO('control_skip_iteration');
    }
    function stopRepeat(){
        addO('control_stop_repeat');
    }

    return { wait, interval: wait, dummy, returnFunction, skipIteration, stopRepeat, callException };
});